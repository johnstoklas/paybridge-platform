import type { PayBridgeCheckoutProps } from "../types"

export function PayBridgeCheckout({
  payer,
  approvalUrl,
  purchase,
  pending = false,
  onCheckout,
}: PayBridgeCheckoutProps) {
  return (
    <section className="pb-checkout">
      {payer ? (
        <p>
          Payer {payer.payer_id} is {payer.connected ? "connected" : "not connected"}
        </p>
      ) : (
        <p>No payer</p>
      )}
      {approvalUrl ? <p>Waiting for PayPal approval</p> : null}
      {purchase ? (
        <button
          type="button"
          className="pb-button"
          disabled={pending}
          onClick={() => onCheckout?.(purchase.id)}
        >
          Checkout
        </button>
      ) : null}
    </section>
  )
}
