export function openApprovalUrl(approvalUrl: string, target = "_blank"): Window | null {
  return window.open(approvalUrl, target, "noopener,noreferrer")
}
