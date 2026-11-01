import { expect, test } from "vitest"
import {
  cartTotalCents,
  createPayBridgeClient,
  isConnectResult,
  isPurchaseCreated,
  PayBridgeError,
  pollUntilConnected,
  type CreatePurchaseInput,
  type PayBridgeClient,
  type Purchase,
} from "../packages/sdk/src"

const cart: CreatePurchaseInput = {
  payer_id: "payer-1",
  app: "demo",
  currency: "usd",
  merchant: { name: "Northwind" },
  items: [
    {
      name: "Notebook",
      unit_amount_cents: 1200,
      quantity: 2,
      product_url: "https://example.com/notebook",
    },
  ],
}

const purchase: Purchase = {
  id: "purchase-1",
  payer_id: "payer-1",
  app: "demo",
  merchant_name: "Northwind",
  checkout_url: null,
  currency: "USD",
  items: cart.items,
  amount_cents: 2400,
  status: "paid",
  paypal_order_id: "order-1",
  paypal_capture_id: "capture-1",
  lithic_card_token: "card-token",
  card_amount_cents: 2400,
  store_order_id: "store-1",
  failure_reason: null,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:01.000Z",
}

function install(handler: (url: URL, init: RequestInit | undefined) => Response) {
  const fetchImpl: typeof fetch = async (input, init) => {
    const headers = new Headers(init?.headers)
    if (headers.get("Accept") !== "application/json") throw new Error("missing Accept header")
    const contentType = headers.get("Content-Type")
    if (init?.body != null && contentType !== "application/json") {
      throw new Error("missing Content-Type header")
    }
    if (init?.body == null && contentType != null) throw new Error("unexpected Content-Type header")
    return handler(new URL(String(input)), init)
  }
  return fetchImpl
}

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

test("public client calls the seven routes", async () => {
  const created = {
    id: "purchase-1",
    status: "paypal_captured" as const,
    amount_cents: 2400,
    paypal_order_id: "order-1",
    connected: true as const,
  }
  const approval = {
    payer_id: "payer-1",
    connected: false as const,
    approval_url: "https://www.sandbox.paypal.com/approve",
  }
  const paths: string[] = []
  const fetchImpl = install((url, init) => {
    paths.push(`${init?.method ?? "GET"} ${url.pathname}`)
    if (url.pathname === "/payers/connect") return json(200, approval)
    if (url.pathname === "/payers/payer-1/complete") {
      return json(200, { payer_id: "payer-1", connected: true })
    }
    if (url.pathname === "/payers/payer-1") return json(200, { payer_id: "payer-1", connected: true })
    if (url.pathname === "/purchases/purchase-1/checkout") {
      return json(200, { ...purchase, status: "refunded", failure_reason: "Card declined" })
    }
    if (url.pathname === "/purchases/purchase-1") return json(200, purchase)
    if (url.pathname === "/purchases" && init?.method === "POST") {
      const body = JSON.parse(String(init.body)) as { app?: string }
      return json(200, body.app === "reconnect" ? approval : created)
    }
    if (url.pathname === "/purchases") return json(200, [purchase])
    return json(404, { detail: "Purchase not found" })
  })
  const client = createPayBridgeClient({ fetch: fetchImpl })

  await expect(client.connectPayer("demo")).resolves.toEqual(approval)
  await expect(client.getPayer("payer-1")).resolves.toMatchObject({ connected: true })
  await expect(client.completePayer("payer-1")).resolves.toMatchObject({ connected: true })
  await expect(client.createPurchase(cart)).resolves.toEqual(created)
  await expect(client.createPurchase({ ...cart, app: "reconnect" })).resolves.toEqual(approval)
  await expect(client.checkoutPurchase("purchase-1")).resolves.toMatchObject({
    status: "refunded",
    failure_reason: "Card declined",
  })
  await expect(client.getPurchase("purchase-1")).resolves.toEqual(purchase)
  await expect(client.listPurchases()).resolves.toEqual([purchase])
  expect(paths).toEqual([
    "POST /payers/connect",
    "GET /payers/payer-1",
    "POST /payers/payer-1/complete",
    "POST /purchases",
    "POST /purchases",
    "POST /purchases/purchase-1/checkout",
    "GET /purchases/purchase-1",
    "GET /purchases",
  ])
})

test("public client maps error status codes", async () => {
  const cases = [
    [404, { detail: "Payer not found" }, "Payer not found"],
    [409, { detail: "Purchase not found" }, "Purchase not found"],
    [502, { detail: "Lithic failed" }, "Lithic failed"],
  ] as const
  for (const [status, body, message] of cases) {
    const client = createPayBridgeClient({
      fetch: install(() => json(status, body)),
    })
    await expect(client.getPurchase("missing")).rejects.toMatchObject({
      status,
      detail: message,
    })
  }

  const detail = [{ loc: ["body", "currency"], msg: "Field required", type: "missing" }]
  const client = createPayBridgeClient({
    fetch: install(() => json(422, { detail })),
  })
  await expect(client.createPurchase(cart)).rejects.toBeInstanceOf(PayBridgeError)
  await expect(client.createPurchase(cart)).rejects.toMatchObject({
    status: 422,
    detail,
    message: "Request failed validation",
  })
})

test("public helpers branch create results and sum the cart", () => {
  expect(cartTotalCents(cart.items)).toBe(2400)
  expect(isPurchaseCreated({
    id: "purchase-1",
    status: "paypal_captured",
    amount_cents: 2400,
    paypal_order_id: "order-1",
    connected: true,
  })).toBe(true)
  expect(isConnectResult({
    payer_id: "payer-1",
    connected: false,
    approval_url: "https://www.sandbox.paypal.com/approve",
  })).toBe(true)
})

test("pollUntilConnected resolves, times out, and aborts", async () => {
  let reads = 0
  const client = {
    async getPayer(payerId: string) {
      reads += 1
      return { payer_id: payerId, connected: reads > 1 }
    },
  } as unknown as PayBridgeClient

  await expect(
    pollUntilConnected(client, "payer-1", { intervalMs: 0, timeoutMs: 1000 }),
  ).resolves.toEqual({ payer_id: "payer-1", connected: true })

  const waiting = {
    async getPayer() {
      return { payer_id: "payer-1", connected: false }
    },
  } as unknown as PayBridgeClient
  await expect(
    pollUntilConnected(waiting, "payer-1", { intervalMs: 0, timeoutMs: 0 }),
  ).rejects.toMatchObject({ status: 0, detail: "Timed out waiting for PayPal approval" })

  const controller = new AbortController()
  controller.abort()
  const aborted = {
    getPayer() {
      throw new Error("should not poll")
    },
  } as unknown as PayBridgeClient
  await expect(
    pollUntilConnected(aborted, "payer-1", { signal: controller.signal }),
  ).rejects.toMatchObject({ name: "AbortError" })
})
