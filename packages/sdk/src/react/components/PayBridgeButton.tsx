import type { ButtonHTMLAttributes } from "react";

import { openPayBridgePopup } from "../../core/popup";
import { PayBridgeShadow } from "./PayBridgeShadow";
import type { CreatePurchaseInput } from "../../types";
import { createPayBridgeClient } from "../../api/client";
import { PAYBRIDGE_CONFIG } from "../../core/config";

const client = createPayBridgeClient();

export interface PayBridgeButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  purchase: CreatePurchaseInput;
}

export function PayBridgeButton({
  purchase,
  ...props
}: PayBridgeButtonProps) {

  async function handleCheckout() {
    const popup = openPayBridgePopup("about:blank");

    if (!popup) {
      console.error("Popup blocked");
      return;
    }

    try {
      // Send purchase information to backend
      const result = await client.createPurchase(purchase);

      // Assuming PurchaseCreated has an `id` property.
      // Your actual type may use a different field.
      if (!("id" in result) || typeof result.id !== "string") {
        popup.close();
        throw new Error("Purchase requires additional setup");
      }

      // Navigate popup to the purchase checkout
      popup.location.href =
        `${PAYBRIDGE_CONFIG.checkoutUrl}/checkout/${encodeURIComponent(result.id)}`;

    } catch (error) {
      popup.close();
      console.error("Checkout failed:", error);
    }
  }

  return (
    <PayBridgeShadow>
      <button
        {...props}
        type={props.type ?? "button"}
        onClick={() => void handleCheckout()}
        className={`pb:bg-paybridge pb:text-white pb:font-sans
          pb:font-semibold pb:px-6 pb:py-3 pb:rounded-lg
          pb:cursor-pointer pb:border-0
          pb:hover:bg-paybridge-hover
          pb:disabled:opacity-50
          pb:disabled:cursor-not-allowed
          `}
      >
        Pay with PayBridge
      </button>
    </PayBridgeShadow>
  );
}