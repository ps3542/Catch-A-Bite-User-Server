import { useEffect, useMemo, useState } from "react";
import InlineMessage from "../../../components/InlineMessage.jsx";
import OwnerStoreContextBar, { loadActiveStoreId } from "../../../components/owner/OwnerStoreContextBar.jsx";
import { ownerReviewService } from "../../../api/owner/ownerReviewService.js";
import styles from "../../../styles/owner.module.css";

export default function OwnerReviewPage() {
  const [storeId, setStoreId] = useState(loadActiveStoreId());
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const [replyDraft, setReplyDraft] = useState({ reviewId: "", content: "" });

  const canLoad = useMemo(() => Number.isFinite(Number(storeId)) && Number(storeId) > 0, [storeId]);

  const load = async () => {
    if (!canLoad) {
      setStatus({ tone: "error", message: "storeId를 먼저 적용해 주세요." });
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      const res = await ownerReviewService.list(Number(storeId));
      setItems(res.data?.data ?? res.data ?? []);
    } catch (e) {
      setStatus({ tone: "error", message: e?.message || "리뷰 조회에 실패했습니다." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // storeId가 설정돼 있으면 바로 로드
    if (canLoad) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]);

  const submitReply = async () => {
    const rid = Number(replyDraft.reviewId);
    if (!canLoad) {
      setStatus({ tone: "error", message: "storeId를 먼저 적용해 주세요." });
      return;
    }
    if (!Number.isFinite(rid) || rid <= 0 || !replyDraft.content.trim()) {
      setStatus({ tone: "error", message: "reviewId와 답글 내용을 입력해 주세요." });
      return;
    }

    setLoading(true);
    setStatus(null);
    try {
      await ownerReviewService.reply(Number(storeId), rid, { content: replyDraft.content.trim() });
      setReplyDraft({ reviewId: "", content: "" });
      setStatus({ tone: "success", message: "답글이 등록되었습니다." });
      await load();
    } catch (e) {
      setStatus({ tone: "error", message: e?.message || "답글 등록에 실패했습니다." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <OwnerStoreContextBar onChange={(id) => setStoreId(id)} />

      <h2>리뷰 관리</h2>

      <div className={styles.toolbar}>
        <input
          className={styles.input}
          type="number"
          min="1"
          placeholder="reply할 reviewId"
          value={replyDraft.reviewId}
          onChange={(e) => setReplyDraft((p) => ({ ...p, reviewId: e.target.value }))}
        />
        <input
          className={styles.input}
          placeholder="답글 내용"
          value={replyDraft.content}
          onChange={(e) => setReplyDraft((p) => ({ ...p, content: e.target.value }))}
        />
        <button type="button" className={styles.primaryButton} onClick={submitReply} disabled={loading}>
          답글 등록
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
            <th className={styles.th}>id</th>
            <th className={styles.th}>내용</th>
            <th className={styles.th}>작성자</th>
            <th className={styles.th}>별점</th>
            <th className={styles.th}>답글</th>
          </tr>
        </thead>
        <tbody>
          {items?.length ? (
            items.map((r, idx) => (
              <tr key={r.reviewId ?? r.id ?? idx}>
                <td className={styles.td}>{r.reviewId ?? r.id ?? "-"}</td>
                <td className={styles.td}>{r.content ?? r.reviewContent ?? "-"}</td>
                <td className={styles.td}>{r.writerNickname ?? r.nickname ?? "-"}</td>
                <td className={styles.td}>{r.rating ?? r.reviewRating ?? "-"}</td>
                <td className={styles.td}>{r.replyContent ?? r.reply ?? "-"}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td className={styles.td} colSpan={5}>리뷰가 없습니다.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
