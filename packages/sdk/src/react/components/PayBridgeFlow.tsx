import { useState } from "react";

import { PayBridgeCheckout } from "./PayBridgeCheckout";
import { PayBridgeStatus } from "./PayBridgeStatus";
import { PayBridgeResult } from "./PayBridgeResult";

import type { PaymentStep } from "./PayBridgeStatus";

type CheckoutView = "checkout" | "processing" | "result";

export function PayBridgeFlow() {
  const [view, setView] = useState<CheckoutView>("checkout");

  const [paymentStep, setPaymentStep] =
    useState<PaymentStep>("initializing");

  const [success, setSuccess] = useState(false);

  async function handleCheckout() {
    setView("processing");

    try {
      setPaymentStep("initializing");

      // Initialize payment

      setPaymentStep("authorizing");

      // Authorize PayPal payment

      setPaymentStep("processing");

      // Complete merchant purchase

      setPaymentStep("confirming");

      // Verify purchase completion

      setSuccess(true);
    } catch (error) {
      console.error(error);
      setSuccess(false);
    } finally {
      setView("result");
    }
  }

  return (
    <div className="pb:w-[480px] pb:h-[550px] pb:overflow-y-auto pb:rounded-2xl pb:bg-white pb:shadow-xl">
      {view === "checkout" && (
        <PayBridgeCheckout
          onCheckout={handleCheckout}
        />
      )}

      {view === "processing" && (
        <PayBridgeStatus step={paymentStep} />
      )}

      {view === "result" && (
        <PayBridgeResult success={success} />
      )}
    </div>
  );
}