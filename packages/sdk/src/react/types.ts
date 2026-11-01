import type { ReactNode } from "react"
import type { PayBridgeErrorDetail, Payer, Purchase, PurchaseCreated, PurchaseStatus } from "../types"

export type PayBridgeButtonProps = {
  onPress?: () => void
  disabled?: boolean
  pending?: boolean
  children?: ReactNode
}

export type PayBridgeCheckoutProps = {
  payer: Payer | null
  approvalUrl: string | null
  purchase: PurchaseCreated | null
  pending?: boolean
  onCheckout?: (purchaseId: string) => void
}

export type PayBridgeStatusProps = {
  status: PurchaseStatus | null
  amountCents?: number | null
  currency?: string | null
  failureReason?: string | null
}

export type PayBridgeErrorProps = {
  status?: number
  detail: PayBridgeErrorDetail
}

export type PayBridgeConfirmationProps = {
  purchase: Purchase
}
