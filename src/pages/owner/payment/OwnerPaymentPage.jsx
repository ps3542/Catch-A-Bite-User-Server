import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import InlineMessage from "../../../components/InlineMessage.jsx";
import { loadActiveStoreId } from "../../../components/owner/OwnerStoreContextBar.jsx";
import { ownerPaymentService } from "../../../api/owner/ownerPaymentService.js";
import { unwrap } from "../../../utils/apiResponse.js";
import styles from "../../../styles/owner.module.css";

function formatMoney(v) {
  const n = Number(v ?? 0);
  if (!Number.isFinite(n)) return "-";
  return `${n.toLocaleString("ko-KR")}원`;
}

function formatDateTime(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString("ko-KR");
}

function paymentStatusLabel(raw) {
  const v = String(raw ?? "").trim().toUpperCase();
  if (!v) return "-";
  if (v === "PAID" || v === "COMPLETED" || v === "SUCCESS") return "완료";
  if (v === "PENDING" || v === "READY") return "대기";
  if (v === "FAILED") return "실패";
  if (v === "CANCELED" || v === "CANCELLED") return "취소";
  if (v === "REFUNDED") return "환불";
  return v;
}

export default function OwnerPaymentPage() {
  const params = useParams();
  const paramStoreId = params?.storeId;
  const [storeId, setStoreId] = useState(paramStoreId ?? loadActiveStoreId());
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [selected, setSelected] = useState(null);

  const canLoad = useMemo(() => Number.isFinite(Number(storeId)) && Number(storeId) > 0, [storeId]);

  const load = async () => {
    if (!canLoad) {
      setStatus({ tone: "error", message: "storeId를 먼저 적용해 주세요." });
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      const params = { from: from || undefined, to: to || undefined, page, size };
      const res = await ownerPaymentService.list(Number(storeId), params);
      setData(unwrap(res));
      setSelected(null);
    } catch (e) {
      setStatus({ tone: "error", message: e?.response?.data?.message || e?.message || "결제 내역 조회에 실패했습니다." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canLoad) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId, page, size]);

  useEffect(() => {
    const onStoreChange = () => {
      if (paramStoreId) return;
      setStoreId(loadActiveStoreId());
    };
    window.addEventListener("owner:store-change", onStoreChange);
    window.addEventListener("storage", onStoreChange);
    return () => {
      window.removeEventListener("owner:store-change", onStoreChange);
      window.removeEventListener("storage", onStoreChange);
    };
  }, []);

  const pageData = data?.content ? data : null;
  const rows = pageData?.content ?? (Array.isArray(data) ? data : []);
  const hasPrev = (pageData?.number ?? page) > 0;
  const hasNext =
    pageData
      ? (typeof pageData?.last === "boolean" ? !pageData.last : pageData.totalPages ? (pageData.number ?? 0) + 1 < pageData.totalPages : false)
      : rows.length === size;
  const pageText = pageData ? `${(pageData.number ?? 0) + 1} / ${pageData.totalPages ?? 1}` : `${page + 1}`;

  return (
    <div>
      <h2>결제 내역</h2>

      <div className={styles.toolbar}>
        <input className={styles.input} type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <input className={styles.input} type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        <button type="button" className={styles.primaryButton} onClick={() => { setPage(0); load(); }} disabled={loading}>
          조회
        </button>
        <button type="button" className={styles.primaryButton} onClick={load} disabled={loading}>
          새로고침
        </button>
      </div>

      <InlineMessage tone={status?.tone}>{status?.message}</InlineMessage>
      {loading ? <div>불러오는 중...</div> : null}

      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>결제 id</th>
            <th className={styles.th}>주문 id</th>
            <th className={styles.th}>금액</th>
            <th className={styles.th}>상태</th>
            <th className={styles.th}>결제일시</th>
          </tr>
        </thead>
        <tbody>
          {rows?.length ? (
            rows.map((p, idx) => (
              <tr
                key={p.paymentId ?? p.id ?? idx}
                className={styles.rowClickable}
                onClick={() => setSelected(p)}
                title="클릭하여 상세 보기"
              >
                <td className={styles.td}>{p.paymentId ?? p.id ?? "-"}</td>
                <td className={styles.td}>{p.orderId ?? p.orderNo ?? "-"}</td>
                <td className={styles.td}>{formatMoney(p.amount ?? p.paymentAmount)}</td>
                <td className={styles.td}>
                  <span className={styles.badge}>{paymentStatusLabel(p.status ?? p.paymentStatus)}</span>
                </td>
                <td className={styles.td}>{formatDateTime(p.paymentPaidAt ?? p.createdAt ?? p.paymentCreatedAt)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td className={styles.td} colSpan={5}>결제 내역이 없습니다.</td>
            </tr>
          )}
        </tbody>
      </table>

      {selected ? (
        <div className={styles.detailCard}>
          <div className={styles.detailHeader}>
            <div className={styles.detailTitle}>결제 상세</div>
            <button type="button" className={styles.outlineButton} onClick={() => setSelected(null)}>
              닫기
            </button>
          </div>
          <div className={styles.detailGrid}>
            <div className={styles.detailKey}>결제 id</div>
            <div className={styles.detailVal}>{selected.paymentId ?? selected.id ?? "-"}</div>

            <div className={styles.detailKey}>주문 id</div>
            <div className={styles.detailVal}>{selected.orderId ?? selected.orderNo ?? "-"}</div>

            <div className={styles.detailKey}>금액</div>
            <div className={styles.detailVal}>{formatMoney(selected.amount ?? selected.paymentAmount)}</div>

            <div className={styles.detailKey}>상태</div>
            <div className={styles.detailVal}>{paymentStatusLabel(selected.status ?? selected.paymentStatus)}</div>

            <div className={styles.detailKey}>결제일시</div>
            <div className={styles.detailVal}>{formatDateTime(selected.paymentPaidAt ?? selected.createdAt ?? selected.paymentCreatedAt)}</div>
          </div>
          <div className={styles.mutedText}></div>
        </div>
      ) : null}

      <div className={styles.toolbar}>
        <button type="button" className={styles.primaryButton} onClick={() => setPage((v) => Math.max(0, v - 1))} disabled={loading || !hasPrev}>
          이전
        </button>
        <div>page: {pageText}</div>
        <button type="button" className={styles.primaryButton} onClick={() => setPage((v) => v + 1)} disabled={loading || !hasNext}>
          다음
        </button>
        <select className={styles.input} value={size} onChange={(e) => { setPage(0); setSize(Number(e.target.value)); }}>
          <option value={10}>10</option>
          <option value={20}>20</option>
          <option value={50}>50</option>
        </select>
      </div>
    </div>
  );
}
