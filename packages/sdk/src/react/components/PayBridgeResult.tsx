import { PayBridgeSuccess } from "./PayBridgeSuccess";
import { PayBridgeError } from "./PayBridgeError";

export interface PayBridgeResultProps {
  success: boolean;
  error?: string;
}

export function PayBridgeResult({
  success,
  error,
}: PayBridgeResultProps) {
  return success ? (
    <PayBridgeSuccess />
  ) : (
    <PayBridgeError message={error} />
  );
}