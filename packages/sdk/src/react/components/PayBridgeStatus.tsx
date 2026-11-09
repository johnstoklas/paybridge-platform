export type PaymentStep =
  | "initializing"
  | "authorizing"
  | "processing"
  | "confirming";

export interface PayBridgeStatusProps {
  step: PaymentStep;
}

const steps: { id: PaymentStep; label: string }[] = [
  { id: "initializing", label: "Checkout initialized" },
  { id: "authorizing", label: "Authorizing payment" },
  { id: "processing", label: "Completing purchase" },
  { id: "confirming", label: "Finalizing confirmation" },
];

export function PayBridgeStatus({
  step,
}: PayBridgeStatusProps) {
  const currentIndex = steps.findIndex((s) => s.id === step);

  return (
    <div
      role="status"
      aria-live="polite"
      className="pb:mx-auto pb:w-full pb:max-w-md pb:rounded-2xl pb:bg-white pb:p-8 pb:shadow-xl pb:font-sans pb:text-gray-900"
    >
      <div className="pb:text-center pb:mb-8">
        <div className="pb:mx-auto pb:mb-5 pb:h-14 pb:w-14 pb:rounded-full pb:border-4 pb:border-gray-200 pb:border-t-paybridge pb:animate-spin" />

        <h2 className="pb:text-xl pb:font-bold">
          Processing your payment
        </h2>

        <p className="pb:text-sm pb:text-gray-500 pb:mt-2">
          Please don't close this window while we complete your purchase.
        </p>
      </div>

      <div className="pb:space-y-5">
        {steps.map((item, index) => {
          const completed = index < currentIndex;
          const active = index === currentIndex;

          return (
            <div
              key={item.id}
              className="pb:flex pb:items-center pb:gap-4"
            >
              <div
                className={
                  "pb:flex pb:h-7 pb:w-7 pb:shrink-0 pb:items-center pb:justify-center pb:rounded-full " +
                  (completed
                    ? "pb:bg-green-500 pb:text-white"
                    : active
                      ? "pb:border-2 pb:border-paybridge pb:text-paybridge"
                      : "pb:border-2 pb:border-gray-200")
                }
              >
                {completed ? "✓" : active ? "•" : ""}
              </div>

              <span
                className={
                  completed || active
                    ? "pb:text-sm pb:font-medium"
                    : "pb:text-sm pb:text-gray-400"
                }
              >
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
