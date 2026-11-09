export function openPayBridgePopup(checkoutUrl: string) {
  const width = 500;
  const height = 700;

  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;

  return window.open(
    checkoutUrl,
    "PayBridgeCheckout",
    `popup=yes,width=${width},height=${height},left=${left},top=${top}`
  );
}