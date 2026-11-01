import type { PayBridgeStatusProps } from "../types"

export function PayBridgeStatus({
  status,
  amountCents,
  currency,
  failureReason,
}: PayBridgeStatusProps) {
  if (status == null) return null
  return (
    <section className="pb-status" data-status={status}>
      <p>{status}</p>
      {amountCents != null ? <p>{formatAmount(amountCents, currency)}</p> : null}
      {status === "refunded" && failureReason ? <p>{failureReason}</p> : null}
    </section>
  )
}

function formatAmount(cents: number, currency?: string | null): string {
  const amount = (cents / 100).toFixed(2)
  return currency ? `${amount} ${currency}` : amount
}
