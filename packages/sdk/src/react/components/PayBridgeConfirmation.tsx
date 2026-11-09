// import type { PayBridgeConfirmationProps } from "../types"

// export function PayBridgeConfirmation({ purchase }: PayBridgeConfirmationProps) {
//   if (purchase.status !== "paid") return null
//   return (
//     <section className="pb-confirmation">
//       <p>Payment confirmed</p>
//       <p>{formatAmount(purchase.amount_cents, purchase.currency)}</p>
//     </section>
//   )
// }

// function formatAmount(cents: number, currency?: string | null): string {
//   const amount = (cents / 100).toFixed(2)
//   return currency ? `${amount} ${currency}` : amount
// }

export interface PayBridgeConfirmationProps {
  transactionId: string;
  amount: number;
  currency?: string;
  onClose?: () => void;
  onViewReceipt?: () => void;
}

export function PayBridgeConfirmation({
  transactionId,
  amount,
  currency = "USD",
  onClose,
  onViewReceipt,
}: PayBridgeConfirmationProps) {
  const formattedAmount = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);

  return (
    <div className="pb:mx-auto pb:w-full pb:max-w-md pb:rounded-2xl pb:bg-white pb:p-8 pb:shadow-xl pb:font-sans pb:text-center pb:text-gray-900">
      {/* Success Icon */}
      <div className="pb:mx-auto pb:mb-5 pb:flex pb:h-16 pb:w-16 pb:items-center pb:justify-center pb:rounded-full pb:bg-green-100">
        <span className="pb:text-3xl pb:font-bold pb:text-green-600">
          ✓
        </span>
      </div>

      <h2 className="pb:text-2xl pb:font-bold pb:mb-2">
        Payment Successful!
      </h2>

      <p className="pb:text-sm pb:text-gray-500 pb:mb-6">
        Your purchase has been completed through PayBridge.
      </p>

      {/* Transaction Details */}
      <div className="pb:rounded-xl pb:border pb:border-gray-200 pb:p-4 pb:mb-6 pb:text-left">
        <div className="pb:flex pb:justify-between pb:gap-3 pb:py-2">
          <span className="pb:text-sm pb:text-gray-500">
            Transaction ID
          </span>
          <span className="pb:text-sm pb:font-medium pb:break-all">
            {transactionId}
          </span>
        </div>

        <div className="pb:flex pb:justify-between pb:gap-3 pb:border-t pb:border-gray-200 pb:py-3">
          <span className="pb:text-sm pb:text-gray-500">
            Amount
          </span>
          <span className="pb:text-sm pb:font-semibold">
            {formattedAmount}
          </span>
        </div>

        <div className="pb:flex pb:justify-between pb:gap-3 pb:border-t pb:border-gray-200 pb:pt-3">
          <span className="pb:text-sm pb:text-gray-500">
            Payment Method
          </span>
          <span className="pb:text-sm pb:font-medium">
            PayPal
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="pb:flex pb:flex-col pb:gap-3">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="pb:w-full pb:rounded-lg pb:bg-paybridge pb:py-3 pb:font-semibold pb:font-sans pb:text-white pb:cursor-pointer pb:hover:bg-paybridge-hover"
          >
            Continue Shopping
          </button>
        )}

        {onViewReceipt && (
          <button
            type="button"
            onClick={onViewReceipt}
            className="pb:w-full pb:rounded-lg pb:border pb:border-gray-300 pb:py-3 pb:font-medium pb:font-sans pb:cursor-pointer pb:hover:bg-gray-50"
          >
            View Receipt
          </button>
        )}
      </div>
    </div>
  );
}