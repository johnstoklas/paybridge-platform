import { expect, test } from "vitest"
import { cartTotalCents, isConnectResult, isPurchaseCreated, pollUntilConnected } from "./index"
import type { PayBridgeClient } from "../types"

test("branches create-purchase responses and sums item totals", () => {
  expect(cartTotalCents([
    { name: "Notebook", unit_amount_cents: 1200, quantity: 2, product_url: "https://example.com/a" },
    { name: "Pencil", unit_amount_cents: 50, quantity: 1, product_url: "https://example.com/b" },
  ])).toBe(2450)

  const created = {
    id: "purchase-1",
    status: "paypal_captured" as const,
    amount_cents: 2450,
    paypal_order_id: "order-1",
    connected: true as const,
  }
  const approval = {
    payer_id: "payer-1",
    connected: false as const,
    approval_url: "https://www.sandbox.paypal.com/approve",
  }
  expect(isPurchaseCreated(created)).toBe(true)
  expect(isConnectResult(created)).toBe(false)
  expect(isConnectResult(approval)).toBe(true)
  expect(isPurchaseCreated(approval)).toBe(false)
})

test("pollUntilConnected waits until the payer is connected", async () => {
  let reads = 0
  const client = {
    async getPayer(payerId: string) {
      reads += 1
      return { payer_id: payerId, connected: reads > 1 }
    },
  } as unknown as PayBridgeClient

  await expect(pollUntilConnected(client, "payer-1", { intervalMs: 0, timeoutMs: 1000 })).resolves.toEqual({
    payer_id: "payer-1",
    connected: true,
  })
  expect(reads).toBe(2)
})

test("pollUntilConnected times out and honors an aborted signal", async () => {
  const waiting = {
    async getPayer() {
      return { payer_id: "payer-1", connected: false }
    },
  } as unknown as PayBridgeClient
  await expect(pollUntilConnected(waiting, "payer-1", { intervalMs: 0, timeoutMs: 0 })).rejects.toMatchObject({
    status: 0,
    detail: "Timed out waiting for PayPal approval",
  })

  const controller = new AbortController()
  controller.abort()
  const aborted = {
    getPayer() {
      throw new Error("should not poll")
    },
  } as unknown as PayBridgeClient
  await expect(pollUntilConnected(aborted, "payer-1", { signal: controller.signal })).rejects.toMatchObject({
    name: "AbortError",
  })
})
