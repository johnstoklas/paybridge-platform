export type ConnectResult = {
  payer_id: string
  connected: false
  approval_url: string
}

export type Payer = {
  payer_id: string
  connected: boolean
}

export type Item = {
  name: string
  unit_amount_cents: number
  quantity: number
  product_url: string
}

export type CreatePurchaseInput = {
  payer_id: string
  app: string
  currency: string
  merchant: {
    name: string
    checkout_url?: string | null
  }
  items: Item[]
}

export type PurchaseCreated = {
  id: string
  status: "paypal_captured"
  amount_cents: number
  paypal_order_id: string
  connected: true
}

export type PurchaseStatus = "paypal_captured" | "card_issued" | "paid" | "refunded"

export type Purchase = {
  id: string
  payer_id: string
  app: string
  merchant_name: string
  checkout_url: string | null
  currency: string
  items: Item[]
  amount_cents: number
  status: PurchaseStatus
  paypal_order_id: string | null
  paypal_capture_id: string | null
  lithic_card_token: string | null
  card_amount_cents: number | null
  store_order_id: string | null
  failure_reason: string | null
  created_at: string
  updated_at: string
}

export type ValidationIssue = {
  loc: Array<string | number>
  msg: string
  type: string
}

export type PayBridgeErrorDetail = string | ValidationIssue[]

export class PayBridgeError extends Error {
  readonly status: number
  readonly detail: PayBridgeErrorDetail

  constructor(status: number, detail: PayBridgeErrorDetail) {
    super(typeof detail === "string" ? detail : "Request failed validation")
    this.name = "PayBridgeError"
    this.status = status
    this.detail = detail
  }
}

export type PayBridgeClient = {
  connectPayer(app: string): Promise<ConnectResult>
  getPayer(payerId: string): Promise<Payer>
  completePayer(payerId: string): Promise<Payer>
  createPurchase(input: CreatePurchaseInput): Promise<PurchaseCreated | ConnectResult>
  checkoutPurchase(purchaseId: string): Promise<Purchase>
  getPurchase(purchaseId: string): Promise<Purchase>
  listPurchases(): Promise<Purchase[]>
}
