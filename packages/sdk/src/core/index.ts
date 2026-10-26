import {
  PayBridgeError,
  type ConnectResult,
  type Item,
  type PayBridgeClient,
  type Payer,
  type PurchaseCreated,
} from "../types"

export function isConnectResult(value: PurchaseCreated | ConnectResult): value is ConnectResult {
  return value.connected === false || "approval_url" in value
}

export function isPurchaseCreated(value: PurchaseCreated | ConnectResult): value is PurchaseCreated {
  return "id" in value
}

export function cartTotalCents(items: Item[]): number {
  return items.reduce((sum, item) => sum + item.unit_amount_cents * item.quantity, 0)
}

export type PollOptions = {
  intervalMs?: number
  timeoutMs?: number
  signal?: AbortSignal
}

export async function pollUntilConnected(
  client: PayBridgeClient,
  payerId: string,
  options: PollOptions = {},
): Promise<Payer> {
  const intervalMs = options.intervalMs ?? 1000
  const timeoutMs = options.timeoutMs ?? 120_000
  const started = Date.now()

  while (true) {
    if (options.signal?.aborted) {
      throw new DOMException("Aborted", "AbortError")
    }
    const payer = await client.getPayer(payerId)
    if (payer.connected) return payer
    if (Date.now() - started >= timeoutMs) {
      throw new PayBridgeError(0, "Timed out waiting for PayPal approval")
    }
    await delay(intervalMs, options.signal)
  }
}

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      signal?.removeEventListener("abort", onAbort)
      resolve()
    }, ms)
    const onAbort = () => {
      clearTimeout(timer)
      reject(new DOMException("Aborted", "AbortError"))
    }
    signal?.addEventListener("abort", onAbort, { once: true })
  })
}
