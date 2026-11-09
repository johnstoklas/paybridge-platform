import { useState } from "react";
import type { Purchase } from "../../types";
import { createPayBridgeClient } from "../../api/client";

const client = createPayBridgeClient();

export interface PayBridgeCheckoutProps {
  purchase: Purchase;
}

export function PayBridgeCheckout({
  purchase,
}: PayBridgeCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = (purchase.items ?? []).reduce(
    (total, item) => total + item.unit_amount_cents * item.quantity,
    0
  );

  const formatCurrency = (amountCents: number) =>
    new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: purchase.currency,
    }).format(amountCents / 100);

  async function handleConfirm() {
    if (loading) return;

    setLoading(true);
    setError(null);

    try {
      const updatedPurchase = await client.checkoutPurchase(purchase.id);

      console.log("Checkout initialized:", updatedPurchase);
      console.log("PayPal order:", updatedPurchase.paypal_order_id);

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to initialize checkout."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    if (loading) return;
    window.close();
  }

  return (
    <div className="pb:mx-auto pb:w-full pb:max-w-md pb:rounded-2xl pb:bg-white pb:p-6 pb:shadow-xl pb:font-sans pb:text-left pb:text-gray-900">
      {/* Header */}
      <div className="pb:mb-6 pb:flex pb:items-center pb:justify-between">
        <h2 className="pb:text-xl pb:font-bold pb:text-paybridge">
          PayBridge
        </h2>
      </div>

      <h3 className="pb:text-2xl pb:font-bold pb:mb-2">
        Complete your purchase
      </h3>

      <p className="pb:text-sm pb:text-gray-500 pb:mb-6">
        Review your order before confirming your payment.
      </p>

      {/* Order Summary */}
      <div className="pb:rounded-xl pb:border pb:border-gray-200 pb:p-4 pb:mb-6">
        <h4 className="pb:font-semibold pb:mb-4">
          Order Summary
        </h4>

        <div className="pb:space-y-3">
          {(purchase.items ?? []).map((item, index) => (
            <div
              key={`${item.name}-${index}`}
              className="pb:flex pb:justify-between pb:gap-4 pb:text-sm"
            >
              <div>
                <p className="pb:font-medium">{item.name}</p>
                <p className="pb:text-gray-500">
                  Qty: {item.quantity}
                </p>
              </div>

              <span className="pb:font-medium">
                {formatCurrency(item.unit_amount_cents * item.quantity)}
              </span>
            </div>
          ))}
        </div>

        <div className="pb:border-t pb:border-gray-200 pb:mt-4 pb:pt-4 pb:flex pb:justify-between">
          <span className="pb:font-bold">Total</span>
          <span className="pb:font-bold">
            {formatCurrency(subtotal)}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="pb:flex pb:flex-col pb:gap-3">
        <button
          type="button"
          onClick={handleConfirm}
          disabled={loading}
          className="pb:w-full pb:rounded-lg pb:bg-paybridge pb:py-3 pb:text-sm pb:font-semibold pb:text-white pb:cursor-pointer pb:disabled:opacity-50"
        >
          {loading ? "Processing..." : `Pay ${formatCurrency(subtotal)}`}
        </button>

        <button
          type="button"
          onClick={handleCancel}
          disabled={loading}
          className="pb:w-full pb:rounded-lg pb:border pb:border-gray-300 pb:py-3 pb:text-sm pb:font-medium pb:cursor-pointer pb:hover:bg-gray-50 pb:disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}