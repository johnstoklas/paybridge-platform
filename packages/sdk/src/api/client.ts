import {
  PayBridgeError,
  type ConnectResult,
  type CreatePurchaseInput,
  type PayBridgeClient,
  type PayBridgeErrorDetail,
  type Payer,
  type Purchase,
  type PurchaseCreated,
} from "../types"

export const DEFAULT_BASE_URL = "http://127.0.0.1:8000"

export type PayBridgeClientOptions = {
  baseUrl?: string
  fetch?: typeof fetch
}

export function createPayBridgeClient(options: PayBridgeClientOptions = {}): PayBridgeClient {
  const baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "")
  const fetchImpl = options.fetch ?? globalThis.fetch

  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    const headers = new Headers(init?.headers)
    headers.set("Accept", "application/json")
    if (init?.body != null) headers.set("Content-Type", "application/json")

    const response = await fetchImpl(`${baseUrl}${path}`, { ...init, headers })
    if (!response.ok) throw await toPayBridgeError(response)
    return response.json() as Promise<T>
  }

  return {
    connectPayer(app) {
      return request<ConnectResult>("/payers/connect", {
        method: "POST",
        body: JSON.stringify({ app }),
      })
    },
    getPayer(payerId) {
      return request<Payer>(`/payers/${encodeURIComponent(payerId)}`, { method: "GET" })
    },
    completePayer(payerId) {
      return request<Payer>(`/payers/${encodeURIComponent(payerId)}/complete`, {
        method: "POST",
      })
    },
    createPurchase(input: CreatePurchaseInput) {
      return request<PurchaseCreated | ConnectResult>("/purchases", {
        method: "POST",
        body: JSON.stringify(input),
      })
    },
    checkoutPurchase(purchaseId) {
      return request<Purchase>(`/purchases/${encodeURIComponent(purchaseId)}/checkout`, {
        method: "POST",
      })
    },
    getPurchase(purchaseId) {
      return request<Purchase>(`/purchases/${encodeURIComponent(purchaseId)}`, {
        method: "GET",
      })
    },
    listPurchases() {
      return request<Purchase[]>("/purchases", { method: "GET" })
    },
  }
}

async function toPayBridgeError(response: Response): Promise<PayBridgeError> {
  let detail: PayBridgeErrorDetail = response.statusText || "Request failed"
  try {
    const body = (await response.json()) as { detail?: unknown }
    if (typeof body.detail === "string" || Array.isArray(body.detail)) {
      detail = body.detail as PayBridgeErrorDetail
    }
  } catch {
    // Response body was not JSON.
  }
  return new PayBridgeError(response.status, detail)
}
