import { useEffect, useMemo, useState } from "react";
import InlineMessage from "../../../components/InlineMessage.jsx";
import OwnerStoreContextBar, { loadActiveStoreId } from "../../../components/owner/OwnerStoreContextBar.jsx";
import { ownerTransactionService } from "../../../api/owner/ownerTransactionService.js";
import styles from "../../../styles/owner.module.css";

export default function OwnerTransactionPage() {
  const [storeId, setStoreId] = useState(loadActiveStoreId());
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

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
      const res = await ownerTransactionService.list(Number(storeId), params);
      setData(res.data?.data ?? res.data ?? null);
    } catch (e) {
      setStatus({ tone: "error", message: e?.message || "정산 내역 조회에 실패했습니다." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canLoad) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId, page, size]);

  const rows = data?.content ?? data ?? [];

  return (
    <div>
      <OwnerStoreContextBar onChange={(id) => setStoreId(id)} />
      <h2>정산 내역</h2>

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
            <th className={styles.th}>transaction id</th>
            <th className={styles.th}>기간</th>
            <th className={styles.th}>정산 금액</th>
            <th className={styles.th}>상태</th>
            <th className={styles.th}>생성일</th>
          </tr>
        </thead>
        <tbody>
          {rows?.length ? (
            rows.map((t, idx) => (
              <tr key={t.transactionId ?? t.id ?? idx}>
                <td className={styles.td}>{t.transactionId ?? t.id ?? "-"}</td>
                <td className={styles.td}>{t.period ?? `${t.from ?? "-"} ~ ${t.to ?? "-"}`}</td>
                <td className={styles.td}>{t.amount ?? t.transactionAmount ?? "-"}</td>
                <td className={styles.td}>{t.status ?? t.transactionStatus ?? "-"}</td>
                <td className={styles.td}>{t.createdAt ?? t.transactionCreatedAt ?? "-"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td className={styles.td} colSpan={5}>정산 내역이 없습니다.</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className={styles.toolbar}>
        <button type="button" className={styles.primaryButton} onClick={() => setPage((v) => Math.max(0, v - 1))} disabled={loading || page === 0}>
          이전
        </button>
        <div>page: {page}</div>
        <button type="button" className={styles.primaryButton} onClick={() => setPage((v) => v + 1)} disabled={loading}>
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
