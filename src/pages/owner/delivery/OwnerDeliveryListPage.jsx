import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import InlineMessage from "../../../components/InlineMessage.jsx";
import { ownerDeliveryService } from "../../../api/owner/ownerDeliveryService.js";
import styles from "../../../styles/ownerOrder.module.css";

// DeliveryStatus enum values are in backend; keep as strings to avoid hardcoding unknowns.
// Provide a small set of common statuses and allow free selection via "전체".
const statusOptions = [
  { value: "", label: "전체" },
  { value: "PENDING", label: "대기" },
  { value: "MATCHED", label: "배정" },
  { value: "PICKED_UP", label: "픽업" },
  { value: "DELIVERING", label: "배달중" },
  { value: "COMPLETED", label: "완료" },
  { value: "CANCELED", label: "취소" },
];

function unwrap(res) {
  const body = res?.data ?? null;
  return body?.data ?? body ?? null;
}

export default function OwnerDeliveryListPage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [items, setItems] = useState([]);

  const load = async () => {
    setLoading(true);
    setStatus(null);
    try {
      const res = filter
        ? await ownerDeliveryService.byStatus(filter)
        : await ownerDeliveryService.list();
      const data = unwrap(res);
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setStatus({ tone: "error", message: e?.response?.data?.message || e?.message || "배달 목록 조회에 실패했습니다." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const rows = useMemo(() => items.map((d, idx) => ({
    key: d.deliveryId ?? idx,
    deliveryId: d.deliveryId ?? "-",
    orderId: d.orderId ?? "-",
    delivererId: d.delivererId ?? "-",
    status: d.orderDeliveryStatus ?? "-",
    createdAt: d.orderDeliveryCreatedDate ?? "",
  })), [items]);

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <h2 className={styles.title}>배달 관리</h2>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ padding: 8, borderRadius: 8 }}>
            {statusOptions.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <button type="button" className={styles.outlineBtn} onClick={load} disabled={loading}>
            새로고침
          </button>
        </div>
      </div>

      <InlineMessage tone={status?.tone}>{status?.message}</InlineMessage>
      {loading ? <div className={styles.muted}>불러오는 중...</div> : null}

      <div className={styles.card}>
        {!loading && rows.length === 0 ? (
          <div className={styles.muted}>배달 내역이 없습니다.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {rows.map((r) => (
              <div
                key={r.key}
                style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12, cursor: "pointer" }}
                onClick={() => navigate(`/owner/deliveries/${r.deliveryId}`)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>delivery #{r.deliveryId}</div>
                    <div style={{ marginTop: 4, opacity: 0.8 }}>
                      order #{r.orderId} · rider {r.delivererId}
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontWeight: 700 }}>{r.status}</div>
                    {r.createdAt ? <div style={{ marginTop: 4, opacity: 0.8 }}>{String(r.createdAt).slice(0, 16)}</div> : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
