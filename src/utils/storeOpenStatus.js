export const normalize_open_status = (v) => String(v ?? "").toLowerCase();

export const is_open = (v) => normalize_open_status(v) === "open";


export const open_status_label = (v) => (is_open(v) ? "영업종료" : "영업시작");

// 토글 값 (open <-> close)
export const toggle_open_status_value = (v) => (is_open(v) ? "close" : "open");
