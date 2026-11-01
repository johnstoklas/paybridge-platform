import type { PayBridgeButtonProps } from "../types"

export function PayBridgeButton({
  onPress,
  disabled = false,
  pending = false,
  children = "Pay with PayBridge",
}: PayBridgeButtonProps) {
  return (
    <button
      type="button"
      className="pb-button"
      disabled={disabled || pending}
      onClick={onPress}
    >
      {children}
    </button>
  )
}
