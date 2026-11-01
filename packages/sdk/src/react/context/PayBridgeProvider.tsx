import { createContext, useMemo, useRef, useState, type ReactNode } from "react"
import { isConnectResult } from "../../core"
import {
  PayBridgeError as PayBridgeApiError,
  type ConnectResult,
  type CreatePurchaseInput,
  type PayBridgeClient,
  type Payer,
  type Purchase,
  type PurchaseCreated,
} from "../../types"

export type PayBridgeContextValue = {
  client: PayBridgeClient
  payer: Payer | null
  approvalUrl: string | null
  purchaseCreated: PurchaseCreated | null
  purchase: Purchase | null
  error: PayBridgeApiError | null
  pending: boolean
  connect: (app: string) => Promise<ConnectResult>
  createPurchase: (input: CreatePurchaseInput) => Promise<PurchaseCreated | ConnectResult>
  checkout: (purchaseId?: string) => Promise<Purchase>
  clearError: () => void
}

export const PayBridgeContext = createContext<PayBridgeContextValue | null>(null)

export function PayBridgeProvider({
  client,
  children,
}: {
  client: PayBridgeClient
  children: ReactNode
}) {
  const [payer, setPayer] = useState<Payer | null>(null)
  const [approvalUrl, setApprovalUrl] = useState<string | null>(null)
  const [purchaseCreated, setPurchaseCreated] = useState<PurchaseCreated | null>(null)
  const purchaseCreatedRef = useRef<PurchaseCreated | null>(null)
  const [purchase, setPurchase] = useState<Purchase | null>(null)
  const [error, setError] = useState<PayBridgeApiError | null>(null)
  const [pending, setPending] = useState(false)

  const value = useMemo<PayBridgeContextValue>(() => {
    async function run<T>(action: () => Promise<T>): Promise<T> {
      setPending(true)
      setError(null)
      try {
        return await action()
      } catch (caught) {
        const failure = asPayBridgeError(caught)
        setError(failure)
        throw failure
      } finally {
        setPending(false)
      }
    }

    return {
      client,
      payer,
      approvalUrl,
      purchaseCreated,
      purchase,
      error,
      pending,
      clearError() {
        setError(null)
      },
      connect(app) {
        return run(async () => {
          const result = await client.connectPayer(app)
          setPayer({ payer_id: result.payer_id, connected: false })
          setApprovalUrl(result.approval_url)
          purchaseCreatedRef.current = null
          setPurchaseCreated(null)
          return result
        })
      },
      createPurchase(input) {
        return run(async () => {
          const result = await client.createPurchase(input)
          if (isConnectResult(result)) {
            setPayer({ payer_id: result.payer_id, connected: false })
            setApprovalUrl(result.approval_url)
            purchaseCreatedRef.current = null
            setPurchaseCreated(null)
            return result
          }
          purchaseCreatedRef.current = result
          setPurchaseCreated(result)
          setApprovalUrl(null)
          setPayer((current) =>
            current
              ? { ...current, connected: true }
              : { payer_id: input.payer_id, connected: true },
          )
          return result
        })
      },
      checkout(purchaseId) {
        return run(async () => {
          const id = purchaseId ?? purchaseCreatedRef.current?.id
          if (!id) {
            throw new PayBridgeApiError(0, "No purchase to checkout")
          }
          const next = await client.checkoutPurchase(id)
          setPurchase(next)
          return next
        })
      },
    }
  }, [approvalUrl, client, error, payer, pending, purchase, purchaseCreated])

  return <PayBridgeContext value={value}>{children}</PayBridgeContext>
}

function asPayBridgeError(caught: unknown): PayBridgeApiError {
  if (caught instanceof PayBridgeApiError) return caught
  if (caught instanceof Error) return new PayBridgeApiError(0, caught.message)
  return new PayBridgeApiError(0, "Request failed")
}
