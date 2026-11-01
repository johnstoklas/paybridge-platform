import {
  PayBridgeButton,
  PayBridgeCheckout,
  PayBridgeConfirmation,
  PayBridgeError,
  PayBridgeStatus,
} from "../../../packages/sdk/src/react";
import type { Purchase } from "../../../packages/sdk/src";

const created = {
  id: "purchase-123",
  status: "paypal_captured" as const,
  amount_cents: 2500,
  paypal_order_id: "paypal-order-1",
  connected: true as const,
};

const paidPurchase: Purchase = {
  id: "purchase-123",
  payer_id: "payer-123",
  app: "playground",
  merchant_name: "Northwind",
  checkout_url: null,
  currency: "USD",
  items: [
    {
      name: "Notebook",
      unit_amount_cents: 2500,
      quantity: 1,
      product_url: "https://example.com/notebook",
    },
  ],
  amount_cents: 2500,
  status: "paid",
  paypal_order_id: "paypal-order-1",
  paypal_capture_id: "capture-1",
  lithic_card_token: "card-token",
  card_amount_cents: 2500,
  store_order_id: "store-1",
  failure_reason: null,
  created_at: "2026-01-01T00:00:00.000Z",
  updated_at: "2026-01-01T00:00:01.000Z",
};

export default function App() {
  return (
    <main>
      <h1>PayBridge Component Library</h1>

      <h2>Buttons</h2>
      <PayBridgeButton />
      <PayBridgeButton pending>Processing</PayBridgeButton>
      <PayBridgeButton disabled>Disabled</PayBridgeButton>

      <h2>Checkout</h2>
      <PayBridgeCheckout
        payer={{ payer_id: "payer-123", connected: false }}
        approvalUrl="https://www.sandbox.paypal.com/approve"
        purchase={null}
      />
      <PayBridgeCheckout
        payer={{ payer_id: "payer-123", connected: true }}
        approvalUrl={null}
        purchase={created}
        onCheckout={() => undefined}
      />

      <h2>Status</h2>
      <PayBridgeStatus status="paypal_captured" amountCents={2500} currency="USD" />
      <PayBridgeStatus status="card_issued" amountCents={2500} currency="USD" />
      <PayBridgeStatus status="paid" amountCents={2500} currency="USD" />
      <PayBridgeStatus
        status="refunded"
        amountCents={2500}
        currency="USD"
        failureReason="Store checkout is not available yet"
      />

      <h2>Error</h2>
      <PayBridgeError status={404} detail="Payer not found" />
      <PayBridgeError
        status={422}
        detail={[
          { loc: ["body", "app"], msg: "Field required", type: "missing" },
        ]}
      />

      <h2>Confirmation</h2>
      <PayBridgeConfirmation purchase={paidPurchase} />
    </main>
  );
}
