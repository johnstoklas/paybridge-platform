export interface PayBridgeErrorProps {
  title?: string;
  message: string;
  errorCode?: string;
  onRetry?: () => void;
  onCancel?: () => void;
}

export function PayBridgeError({
  title = "Payment Failed",
  message,
  errorCode,
  onRetry,
  onCancel,
}: PayBridgeErrorProps) {
  return (
    <div
      role="alert"
      className="pb:mx-auto pb:w-full pb:max-w-md pb:rounded-2xl pb:bg-white pb:p-8 pb:shadow-xl pb:font-sans pb:text-center pb:text-gray-900"
    >
      {/* Error Icon */}
      <div className="pb:mx-auto pb:mb-5 pb:flex pb:h-16 pb:w-16 pb:items-center pb:justify-center pb:rounded-full pb:bg-red-100">
        <span className="pb:text-3xl pb:font-bold pb:text-red-500">
          !
        </span>
      </div>

      <h2 className="pb:text-2xl pb:font-bold pb:mb-2">
        {title}
      </h2>

      <p className="pb:text-sm pb:text-gray-500 pb:mb-6">
        {message}
      </p>

      {errorCode && (
        <div className="pb:mb-6 pb:rounded-lg pb:border-l-4 pb:border-red-500 pb:bg-red-50 pb:p-4 pb:text-left">
          <p className="pb:text-xs pb:text-red-700">
            Error Code: {errorCode}
          </p>
        </div>
      )}

      <div className="pb:flex pb:flex-col pb:gap-3">
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="pb:w-full pb:rounded-lg pb:bg-paybridge pb:py-3 pb:font-semibold pb:font-sans pb:text-white pb:cursor-pointer pb:hover:bg-paybridge-hover"
          >
            Try Again
          </button>
        )}

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="pb:w-full pb:rounded-lg pb:border pb:border-gray-300 pb:py-3 pb:font-medium pb:font-sans pb:cursor-pointer pb:hover:bg-gray-50"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}