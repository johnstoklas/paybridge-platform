import { useState } from "react";

import {
  PayBridgeButton,
  PayBridgeCheckout,
  PayBridgeConfirmation,
  PayBridgeError,
  PayBridgeStatus,
} from "../../../packages/sdk/src/react";

import type { Purchase } from "../../../packages/sdk/src";
import type { PaymentStep } from "../../../packages/sdk/src/react";

type PlaygroundView =
  | "checkout"
  | "processing"
  | "success"
  | "error";

const paymentSteps: PaymentStep[] = [
  "initializing",
  "authorizing",
  "processing",
  "confirming",
];

const mockItems = [
  {
    id: "item-1",
    name: "Wireless Headphones",
    quantity: 1,
    price: 79.99,
  },
  {
    id: "item-2",
    name: "USB-C Charging Cable",
    quantity: 2,
    price: 12.99,
  },
];

const paidPurchase: Purchase = {
  id: "purchase-123",
  payer_id: "payer-123",
  app: "playground",
  merchant_name: "Northwind",
  checkout_url: null,
  currency: "USD",
  items: [
    {
      name: "Wireless Headphones",
      unit_amount_cents: 7999,
      quantity: 1,
      product_url: null,
    },
    {
      name: "USB-C Charging Cable",
      unit_amount_cents: 1299,
      quantity: 2,
      product_url: null,
    },
  ],
  amount_cents: 10597,
  status: "paid",
  paypal_order_id: "paypal-order-1",
  paypal_capture_id: "capture-1",
  lithic_card_token: "card-token",
  card_amount_cents: 10597,
  store_order_id: "store-1",
  failure_reason: null,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:01.000Z",
};

export default function App() {
  const [view, setView] = useState<PlaygroundView>("checkout");
  const [step, setStep] = useState<PaymentStep>("initializing");

  function startProcessing() {
    setStep("initializing");
    setView("processing");
  }

  function nextStep() {
    const currentIndex = paymentSteps.indexOf(step);

    if (currentIndex < paymentSteps.length - 1) {
      setStep(paymentSteps[currentIndex + 1]);
    } else {
      setView("success");
    }
  }

  function reset() {
    setView("checkout");
    setStep("initializing");
  }

  return (
  <main className="pb:min-h-screen pb:bg-slate-100 pb:px-8 pb:py-12 pb:font-sans">
    <div className="pb:mx-auto pb:max-w-7xl">
      {/* Header */}
      <header className="pb:mb-10">
        <h1 className="pb:text-4xl pb:font-bold pb:tracking-tight pb:text-slate-900">
          PayBridge Playground
        </h1>

        <p className="pb:mt-3 pb:text-slate-500">
          Test and preview PayBridge SDK components.
        </p>
      </header>

      {/* Two-column layout */}
      <div className="pb:grid pb:grid-cols-1 pb:items-start pb:gap-8 pb:lg:grid-cols-3">

        {/* LEFT: Initialization Button */}
        <section className="pb:rounded-2xl pb:bg-white pb:p-8 pb:shadow-sm pb:lg:col-span-1">
          <div className="pb:mb-6">
            <h2 className="pb:text-xl pb:font-semibold pb:text-slate-900">
              Initialization Button
            </h2>

            <p className="pb:mt-2 pb:text-sm pb:leading-relaxed pb:text-slate-500">
              This button initializes a purchase through the PayBridge API
              and opens the checkout popup.
            </p>
          </div>

          <div className="pb:rounded-xl pb:border pb:border-slate-200 pb:bg-slate-50 pb:p-8 pb:text-center">
            <PayBridgeButton
              purchase={{
                payer_id: "1234",
                app: "playground",
                currency: "USD",
                merchant: {
                  name: "John",
                  checkout_url: "",
                },
                items: [
                  {
                    name: "Wireless Headphones",
                    unit_amount_cents: 7999,
                    quantity: 1,
                    product_url: "",
                  },
                ],
              }}
            />
          </div>

          <p className="pb:mt-5 pb:text-xs pb:leading-relaxed pb:text-slate-400">
            This button uses the actual SDK implementation. The checkout
            preview on the right is independent and uses mock data.
          </p>
        </section>

        {/* RIGHT: Checkout Flow Preview */}
        <section className="pb:rounded-2xl pb:bg-white pb:p-8 pb:shadow-sm pb:lg:col-span-2">

          {/* Section Header */}
          <div className="pb:mb-6">
            <h2 className="pb:text-xl pb:font-semibold pb:text-slate-900">
              Checkout Flow Preview
            </h2>

            <p className="pb:mt-2 pb:text-sm pb:text-slate-500">
              Navigate through the different stages of the PayBridge checkout.
            </p>
          </div>

          {/* Navigation Buttons */}
          <div className="pb:mb-8 pb:flex pb:flex-wrap pb:gap-3">
            {(
              [
                ["checkout", "Checkout"],
                ["processing", "Processing"],
                ["success", "Success"],
                ["error", "Error"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => {
                  if (value === "processing") {
                    startProcessing();
                  } else if (value === "checkout") {
                    reset();
                  } else {
                    setView(value);
                  }
                }}
                className={
                  "pb:cursor-pointer pb:rounded-lg pb:px-5 pb:py-2.5 pb:text-sm pb:font-medium pb:transition-all pb:duration-200 " +
                  (view === value
                    ? "pb:bg-blue-600 pb:text-white pb:shadow-md"
                    : "pb:bg-slate-100 pb:text-slate-600 pb:hover:bg-slate-200 pb:hover:text-slate-900")
                }
              >
                {label}
              </button>
            ))}
          </div>

          {/* Component Preview */}
          <div className="pb:flex pb:min-h-[450px] pb:items-center pb:justify-center pb:rounded-xl pb:border pb:border-slate-200 pb:bg-slate-50 pb:p-6">

            {view === "checkout" && (
              <PayBridgeCheckout
                purchase={paidPurchase}
              />
            )}

            {view === "processing" && (
              <div className="pb:w-full pb:space-y-6">
                <PayBridgeStatus step={step} />

                <div className="pb:flex pb:justify-center pb:gap-3">
                  <button
                    type="button"
                    onClick={nextStep}
                    className="pb:cursor-pointer pb:rounded-lg pb:bg-blue-600 pb:px-5 pb:py-2.5 pb:text-sm pb:font-semibold pb:text-white pb:shadow-sm pb:transition-all pb:hover:bg-blue-700 pb:hover:shadow-md pb:active:scale-95"
                  >
                    Next Step →
                  </button>

                  <button
                    type="button"
                    onClick={() => setView("error")}
                    className="pb:cursor-pointer pb:rounded-lg pb:border pb:border-red-200 pb:bg-red-50 pb:px-5 pb:py-2.5 pb:text-sm pb:font-medium pb:text-red-600 pb:transition-all pb:hover:bg-red-100 pb:active:scale-95"
                  >
                    Simulate Error
                  </button>
                </div>
              </div>
            )}

            {view === "success" && (
              <PayBridgeConfirmation purchase={paidPurchase} />
            )}

            {view === "error" && (
              <PayBridgeError
                status={500}
                detail="Payment processing failed."
              />
            )}
          </div>

          {/* Footer Controls */}
          <div className="pb:mt-6 pb:flex pb:justify-end">
            <button
              type="button"
              onClick={reset}
              className="pb:cursor-pointer pb:rounded-lg pb:border pb:border-slate-200 pb:bg-white pb:px-5 pb:py-2.5 pb:text-sm pb:font-medium pb:text-slate-600 pb:transition-all pb:hover:bg-slate-100 pb:hover:text-slate-900 pb:active:scale-95"
            >
              ↻ Reset Preview
            </button>
          </div>
        </section>
      </div>
    </div>
  </main>
);
}