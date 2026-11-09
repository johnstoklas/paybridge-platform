import { useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

import { paybridgeStyles } from "../styles/paybridge-styles";

interface PayBridgeShadowProps {
  children: ReactNode;
}

export function PayBridgeShadow({
  children,
}: PayBridgeShadowProps) {
  const [shadowRoot, setShadowRoot] = useState<ShadowRoot | null>(null);

  function attachShadow(element: HTMLDivElement | null) {
    if (!element) return;

    const root = element.shadowRoot ?? element.attachShadow({
      mode: "open",
    });

    setShadowRoot(root);
  }

  return (
    <div ref={attachShadow}>
      {shadowRoot &&
        createPortal(
          <>
            <style>{paybridgeStyles}</style>
            {children}
          </>,
          shadowRoot
        )}
    </div>
  );
}