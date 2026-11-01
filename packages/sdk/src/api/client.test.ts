import { expect, test } from "vitest"
import { createPayBridgeClient } from "./client"
import { PayBridgeError, type CreatePurchaseInput, type Purchase } from "../types"

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
  const calls: Array<{ url: URL; init?: RequestInit }> = []
  const fetchImpl: typeof fetch = async (input, init) => {
    const headers = new Headers(init?.headers)
    if (headers.get("Accept") !== "application/json") {
      throw new Error("missing Accept header")
    }
    const contentType = headers.get("Content-Type")
    if (init?.body != null && contentType !== "application/json") {
      throw new Error("missing Content-Type header")
    }
    if (init?.body == null && contentType != null) {
      throw new Error("unexpected Content-Type header")
    }
    const url = new URL(String(input))
    calls.push({ url, init })
    return handler(url, init)
  }
  return { fetchImpl, calls }
}

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

test("connectPayer posts the app id", async () => {
  const { fetchImpl, calls } = install(() =>
    json(200, {
      payer_id: "payer-1",
      connected: false,
      approval_url: "https://www.sandbox.paypal.com/approve",
    }),
  )
  const client = createPayBridgeClient({ fetch: fetchImpl })
  const result = await client.connectPayer("demo")

  expect(result.approval_url).toBe("https://www.sandbox.paypal.com/approve")
  expect(calls[0]?.url.href).toBe("http://127.0.0.1:8000/payers/connect")
  expect(calls[0]?.init?.method).toBe("POST")
  expect(calls[0]?.init?.body).toBe(JSON.stringify({ app: "demo" }))
})

test("getPayer encodes the payer id", async () => {
  const { fetchImpl, calls } = install(() => json(200, { payer_id: "payer/1", connected: true }))
  const client = createPayBridgeClient({
    baseUrl: "http://localhost:9000/",
    fetch: fetchImpl,
  })

  await expect(client.getPayer("payer/1")).resolves.toEqual({
    payer_id: "payer/1",
    connected: true,
  })
  expect(calls[0]?.url.href).toBe("http://localhost:9000/payers/payer%2F1")
  expect(calls[0]?.init?.method).toBe("GET")
})

test("completePayer posts no body", async () => {
  const { fetchImpl, calls } = install(() => json(200, { payer_id: "payer-1", connected: true }))
  const client = createPayBridgeClient({ fetch: fetchImpl })

  await expect(client.completePayer("payer-1")).resolves.toEqual({
    payer_id: "payer-1",
    connected: true,
  })
  expect(calls[0]?.url.pathname).toBe("/payers/payer-1/complete")
  expect(calls[0]?.init?.method).toBe("POST")
  expect(calls[0]?.init?.body).toBeUndefined()
})

test("createPurchase returns a captured purchase", async () => {
  const created = {
    id: "purchase-1",
    status: "paypal_captured",
    amount_cents: 2400,
    paypal_order_id: "order-1",
    connected: true,
  }
  const { fetchImpl, calls } = install(() => json(200, created))
  const client = createPayBridgeClient({ fetch: fetchImpl })

  await expect(client.createPurchase(cart)).resolves.toEqual(created)
  expect(calls[0]?.url.pathname).toBe("/purchases")
  expect(calls[0]?.init?.body).toBe(JSON.stringify(cart))
})

test("createPurchase returns an approval url without throwing", async () => {
  const approval = {
    payer_id: "payer-1",
    connected: false,
    approval_url: "https://www.sandbox.paypal.com/approve",
  }
  const { fetchImpl } = install(() => json(200, approval))
  const client = createPayBridgeClient({ fetch: fetchImpl })

  await expect(client.createPurchase(cart)).resolves.toEqual(approval)
})

test("checkoutPurchase returns a refunded purchase without throwing", async () => {
  const refunded = {
    ...purchase,
    status: "refunded",
    failure_reason: "Store checkout is not available yet",
  }
  const { fetchImpl, calls } = install(() => json(200, refunded))
  const client = createPayBridgeClient({ fetch: fetchImpl })

  await expect(client.checkoutPurchase("purchase/1")).resolves.toEqual(refunded)
  expect(calls[0]?.url.pathname).toBe("/purchases/purchase%2F1/checkout")
  expect(calls[0]?.init?.method).toBe("POST")
  expect(calls[0]?.init?.body).toBeUndefined()
})

test("getPurchase and listPurchases read purchases", async () => {
  const { fetchImpl, calls } = install((url) => {
    if (url.pathname === "/purchases/purchase-1") return json(200, purchase)
    return json(200, [purchase])
  })
  const client = createPayBridgeClient({ fetch: fetchImpl })

  await expect(client.getPurchase("purchase-1")).resolves.toEqual(purchase)
  await expect(client.listPurchases()).resolves.toEqual([purchase])
  expect(calls.map((call) => call.url.pathname)).toEqual(["/purchases/purchase-1", "/purchases"])
})

test.each([
  [404, { detail: "Payer not found" }, "Payer not found"],
  [409, { detail: "Payer has no PayPal setup to finish" }, "Payer has no PayPal setup to finish"],
  [502, { detail: "PayPal unavailable" }, "PayPal unavailable"],
])("maps HTTP %s to PayBridgeError", async (status, body, message) => {
  const { fetchImpl } = install(() => json(status, body))
  const client = createPayBridgeClient({ fetch: fetchImpl })

  await expect(client.getPayer("missing")).rejects.toMatchObject({
    name: "PayBridgeError",
    status,
    detail: message,
    message,
  })
  await expect(client.getPayer("missing")).rejects.toBeInstanceOf(PayBridgeError)
})

test("maps validation errors to the detail list", async () => {
  const detail = [{ loc: ["body", "app"], msg: "Field required", type: "missing" }]
  const { fetchImpl } = install(() => json(422, { detail }))
  const client = createPayBridgeClient({ fetch: fetchImpl })

  await expect(client.createPurchase(cart)).rejects.toMatchObject({
    status: 422,
    detail,
    message: "Request failed validation",
  })
})

test("uses the status text when the error body is not JSON", async () => {
  const fetchImpl: typeof fetch = async () =>
    new Response("nope", { status: 502, statusText: "Upstream failed" })
  const client = createPayBridgeClient({ fetch: fetchImpl })

  await expect(client.listPurchases()).rejects.toMatchObject({
    status: 502,
    detail: "Upstream failed",
  })
})
