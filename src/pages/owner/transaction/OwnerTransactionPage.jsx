import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import InlineMessage from "../../../components/InlineMessage.jsx";
import { loadActiveStoreId } from "../../../components/owner/OwnerStoreContextBar.jsx";
import { ownerTransactionService } from "../../../api/owner/ownerTransactionService.js";
import { unwrap } from "../../../utils/apiResponse.js";
import styles from "../../../styles/owner.module.css";

import {
  getTransactionStatusLabel,
  getTransactionStatusGroup,
  transactionStatusOptions,
} from "../../../constants/transactionStatusMap.js";

// owner 화면에서는 사업자 정산만 노출합니다.
const ownerTransactionType = "STORE_PAYOUT";

function formatDateTime(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString("ko-KR");
}

function formatAmount(amount, currency) {
  if (amount === null || amount === undefined) return "-";
  const n = Number(amount);
  if (!Number.isFinite(n)) return String(amount);
  const money = n.toLocaleString("ko-KR");
  return currency ? `${money} ${currency}` : money;
}

export default function OwnerTransactionPage() {
  const params = useParams();
  const navigate = useNavigate();
  const paramStoreId = params?.storeId;
  const [storeId, setStoreId] = useState(paramStoreId ?? loadActiveStoreId());
  const [txStatus, setTxStatus] = useState("");
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
      const params = {
        type: ownerTransactionType,
        status: txStatus || undefined,
        from: from || undefined,
        to: to || undefined,
        page,
        size,
      };
      const res = await ownerTransactionService.list(Number(storeId), params);
      setData(unwrap(res));
      setSelected(null);
    } catch (e) {
      setStatus({ tone: "error", message: e?.response?.data?.message || e?.message || "정산 내역 조회에 실패했습니다." });
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
      <h2>정산 내역</h2>

      <div className={styles.toolbar}>        
        <select className={styles.input} value={txStatus} onChange={(e) => { setPage(0); setTxStatus(e.target.value); }}>
          {transactionStatusOptions.map((o) => (
            <option key={o.value || "all"} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <input className={styles.input} type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <input className={styles.input} type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        <button
          type="button"
          className={styles.primaryButton}
          onClick={() => {
            setPage(0);
            load();
          }}
          disabled={loading}
        >
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
            <th className={styles.th}>거래 id</th>
            <th className={styles.th}>주문 id</th>
            <th className={styles.th}>금액</th>
            <th className={styles.th}>상태</th>
            <th className={styles.th}>생성일</th>
            <th className={styles.th}>완료일</th>
          </tr>
        </thead>
        <tbody>
          {rows?.length ? (
            rows.map((t, idx) => (
              <tr
                key={t.transactionId ?? t.id ?? idx}
                className={styles.rowClickable}
                onClick={() => setSelected(t)}
                title="클릭하여 상세 보기"
              >
                <td className={styles.td}>{t.transactionId ?? t.id ?? "-"}</td>
                <td className={styles.td}>{t.orderId ?? "-"}</td>
                <td className={styles.td}>{formatAmount(t.amount, t.currency)}</td>
                <td className={styles.td}>
                  <span className={styles.badge}>{getTransactionStatusLabel(t.transactionStatus)}</span>
                </td>
                <td className={styles.td}>{formatDateTime(t.createdAt)}</td>
                <td className={styles.td}>{formatDateTime(t.completedAt)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td className={styles.td} colSpan={6}>정산 내역이 없습니다.</td>
            </tr>
          )}
        </tbody>
      </table>

      {selected ? (
        <div className={styles.detailCard}>
          <div className={styles.detailHeader}>
            <div className={styles.detailTitle}>정산 상세</div>
            <button type="button" className={styles.outlineButton} onClick={() => setSelected(null)}>
              닫기
            </button>
          </div>
          <div className={styles.detailGrid}>
            <div className={styles.detailKey}>거래 id</div>
            <div className={styles.detailVal}>{selected.transactionId ?? selected.id ?? "-"}</div>

            <div className={styles.detailKey}>주문 id</div>
            <div className={styles.detailVal}>
              {selected.orderId ?? "-"}
              {selected.orderId ? (
                <button
                  type="button"
                  className={styles.outlineButton}
                  style={{ marginLeft: 10 }}
                  onClick={() => navigate(`/owner/stores/${storeId}/orders/${selected.orderId}`)}
                >
                  주문 상세
                </button>
              ) : null}
            </div>

            <div className={styles.detailKey}>금액</div>
            <div className={styles.detailVal}>{formatAmount(selected.amount, selected.currency)}</div>

            <div className={styles.detailKey}>상태</div>
            <div className={styles.detailVal}>
              <span className={styles.badge}>{getTransactionStatusLabel(selected.transactionStatus)}</span>
              <span className={styles.mutedText} style={{ marginLeft: 10 }}>
                ({getTransactionStatusGroup(selected.transactionStatus)})
              </span>
            </div>

            <div className={styles.detailKey}>생성일</div>
            <div className={styles.detailVal}>{formatDateTime(selected.createdAt)}</div>

            <div className={styles.detailKey}>완료일</div>
            <div className={styles.detailVal}>{formatDateTime(selected.completedAt)}</div>
          </div>
          <div className={styles.mutedText} style={{ marginTop: 10 }}>
      
          </div>
        </div>
      ) : null}

      <div className={styles.toolbar}>
        <button
          type="button"
          className={styles.primaryButton}
          onClick={() => setPage((v) => Math.max(0, v - 1))}
          disabled={loading || !hasPrev}
        >
          이전
        </button>
        <div>page: {pageText}</div>
        <button
          type="button"
          className={styles.primaryButton}
          onClick={() => setPage((v) => v + 1)}
          disabled={loading || !hasNext}
        >
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
