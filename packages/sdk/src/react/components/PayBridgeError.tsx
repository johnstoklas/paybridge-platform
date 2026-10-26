import type { PayBridgeErrorProps } from "../types"

export function PayBridgeError({ status, detail }: PayBridgeErrorProps) {
  return (
    <section className="pb-error" role="alert">
      {status != null ? <p>Error {status}</p> : null}
      {typeof detail === "string" ? (
        <p>{detail}</p>
      ) : (
        <ul>
          {detail.map((issue, index) => (
            <li key={`${issue.loc.join(".")}-${index}`}>{issue.msg}</li>
          ))}
        </ul>
      )}
    </section>
  )
}
