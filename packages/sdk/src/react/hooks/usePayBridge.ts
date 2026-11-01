import { useContext } from "react"
import { PayBridgeContext, type PayBridgeContextValue } from "../context/PayBridgeProvider"

export function usePayBridge(): PayBridgeContextValue {
  const value = useContext(PayBridgeContext)
  if (!value) {
    throw new Error("usePayBridge must be used within PayBridgeProvider")
  }
  return value
}
