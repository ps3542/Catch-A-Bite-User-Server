// Owner 정산(Transaction) 상태는 백엔드 status 문자열을 그대로 사용하되,
// 화면에서는 사업자 관점의 라벨/그룹으로만 해석해 노출합니다.

const labelMap = {
  PENDING: "대기",
  COMPLETED: "완료",
  FAILED: "실패",
  REFUNDED: "환불",
};

const groupMap = {
  PENDING: "진행 중",
  COMPLETED: "완료",
  FAILED: "문제 발생",
  REFUNDED: "환불",
};

export function getTransactionStatusLabel(status) {
  if (!status) return "-";
  const key = String(status).toUpperCase();
  return labelMap[key] ?? String(status);
}

export function getTransactionStatusGroup(status) {
  if (!status) return "-";
  const key = String(status).toUpperCase();
  return groupMap[key] ?? "기타";
}

export const transactionStatusOptions = [
  { value: "", label: "전체 상태" },
  { value: "PENDING", label: "대기" },
  { value: "COMPLETED", label: "완료" },
  { value: "FAILED", label: "실패" },
  { value: "REFUNDED", label: "환불" },
];
