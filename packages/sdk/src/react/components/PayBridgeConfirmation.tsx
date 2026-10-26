import type { PayBridgeConfirmationProps } from "../types"

export function PayBridgeConfirmation({ purchase }: PayBridgeConfirmationProps) {
  if (purchase.status !== "paid") return null
  return (
    <section className="pb-confirmation">
      <p>Payment confirmed</p>
      <p>{formatAmount(purchase.amount_cents, purchase.currency)}</p>
    </section>
  )
}

function formatAmount(cents: number, currency?: string | null): string {
  const amount = (cents / 100).toFixed(2)
  return currency ? `${amount} ${currency}` : amount
}
