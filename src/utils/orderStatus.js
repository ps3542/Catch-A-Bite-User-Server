export function ownerOrderStatusLabel(raw) {
  const v = String(raw ?? "").trim().toLowerCase();

  const map = {
    pending: "접수대기",
    cooking: "조리중",
    cooked: "조리완료",
    delivering: "배달중",
    delivered: "배달완료",
    rejected: "거절",
    payment_confirmed: "결제확인",
    paymentconfirmed: "결제확인",
  };

  return map[v] ?? (v ? v : "-");
}
