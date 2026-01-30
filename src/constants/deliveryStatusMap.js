// delivery status mapping for owner (사업자) 화면
// source of truth: backend enum DeliveryStatus
// PENDING, ASSIGNED, ACCEPTED, PICKED_UP, IN_DELIVERY, DELIVERED, CANCELLED

export const deliveryStatusLabels = Object.freeze({
  PENDING: "배차 대기",
  ASSIGNED: "배차 완료",
  ACCEPTED: "배달 준비",
  PICKED_UP: "배달 중",
  IN_DELIVERY: "배달 중",
  DELIVERED: "배달 완료",
  CANCELLED: "취소",
});

// owner-friendly filter groups (UI only)
export const deliveryStatusGroups = Object.freeze([
  { key: "all", label: "전체", statuses: null },
  { key: "pending", label: "배차 대기", statuses: ["PENDING"] },
  { key: "progress", label: "진행 중", statuses: ["ASSIGNED", "ACCEPTED", "PICKED_UP", "IN_DELIVERY"] },
  { key: "done", label: "완료", statuses: ["DELIVERED"] },
  { key: "cancel", label: "취소", statuses: ["CANCELLED"] },
]);

export function toDeliveryStatusLabel(status) {
  if (!status) return "-";
  return deliveryStatusLabels[status] ?? String(status);
}

export function toDeliveryGroupKeyByStatus(status) {
  if (!status) return "all";
  const s = String(status);
  if (s === "PENDING") return "pending";
  if (s === "DELIVERED") return "done";
  if (s === "CANCELLED") return "cancel";
  return "progress";
}
