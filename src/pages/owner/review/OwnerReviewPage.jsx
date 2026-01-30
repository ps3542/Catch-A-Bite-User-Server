import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import InlineMessage from "../../../components/InlineMessage.jsx";
import { loadActiveStoreId } from "../../../components/owner/OwnerStoreContextBar.jsx";
import { ownerReviewService } from "../../../api/owner/ownerReviewService.js";
import styles from "../../../styles/ownerReview.module.css";

function safeArray(v) {
  return Array.isArray(v) ? v : [];
}

// ApiResponse.ok({ data }) 형태 대응
function extractPage(res) {
  const body = res?.data ?? null;
  const data = body?.data ?? body ?? null;

  // PageResponseDTO<OwnerReviewDTO> 예상: { content, page, size, totalElements, totalPages }
  const content = safeArray(data?.content ?? data?.items ?? data);
  const page = Number.isFinite(Number(data?.page)) ? Number(data.page) : 0;
  const size = Number.isFinite(Number(data?.size)) ? Number(data.size) : 20;
  const totalElements = Number.isFinite(Number(data?.totalElements)) ? Number(data.totalElements) : content.length;
  const totalPages = Number.isFinite(Number(data?.totalPages))
    ? Number(data.totalPages)
    : Math.max(1, Math.ceil(totalElements / Math.max(1, size)));

  return { content, page, size, totalElements, totalPages };
}

function stars(rating) {
  const n = Math.max(0, Math.min(5, Number(rating ?? 0)));
  const full = "★".repeat(n);
  const empty = "☆".repeat(5 - n);
  return `${full}${empty}`;
}

function formatDate(v) {
  if (!v) return "";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v).slice(0, 16);
  return d.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function OwnerReviewPage() {
  const params = useParams();
  const paramStoreId = params?.storeId;
  const [storeId, setStoreId] = useState(paramStoreId ?? loadActiveStoreId());
  const canLoad = useMemo(() => Number.isFinite(Number(storeId)) && Number(storeId) > 0, [storeId]);

  const [loading, setLoading] = useState(false);
  const [submittingId, setSubmittingId] = useState(null);
  const [status, setStatus] = useState(null);

  // all | unreplied | replied
  const [filter, setFilter] = useState("all");

  const [pageState, setPageState] = useState({
    content: [],
    page: 0,
    size: 10,
    totalElements: 0,
    totalPages: 1,
  });

  // reviewId -> draft text
  const [drafts, setDrafts] = useState({});

  const load = async (nextPage = pageState.page) => {
    if (!canLoad) {
      setStatus({ tone: "error", message: "storeId를 먼저 적용해 주세요." });
      return;
    }
    setLoading(true);
    setStatus(null);
    try {
      const res = await ownerReviewService.list(Number(storeId), { page: nextPage, size: pageState.size });
      const p = extractPage(res);
      setPageState(p);
    } catch (e) {
      setStatus({ tone: "error", message: e?.response?.data?.message || e?.message || "리뷰 조회에 실패했습니다." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canLoad) load(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]);

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

  const submitReply = async (reviewId) => {
    const content = String(drafts[reviewId] ?? "").trim();
    if (!content) {
      setStatus({ tone: "error", message: "답글 내용을 입력해 주세요." });
      return;
    }
    if (!canLoad) {
      setStatus({ tone: "error", message: "storeId를 먼저 적용해 주세요." });
      return;
    }

    setSubmittingId(reviewId);
    setStatus(null);
    try {
      await ownerReviewService.reply(Number(storeId), Number(reviewId), { content });
      setDrafts((prev) => ({ ...prev, [reviewId]: "" }));
      setStatus({ tone: "success", message: "답글이 등록되었습니다." });
      await load(pageState.page);
    } catch (e) {
      const serverMsg = String(e?.response?.data?.message ?? "");
      const httpStatus = Number(e?.response?.status ?? 0);

      if (httpStatus === 409 || /already/i.test(serverMsg)) {
        setStatus({ tone: "error", message: "이미 답글이 등록된 리뷰입니다." });
      } else {
        setStatus({
          tone: "error",
          message: e?.response?.data?.message || e?.message || "답글 등록에 실패했습니다.",
        });
      }
    } finally {
      setSubmittingId(null);
    }
  };

  const content = pageState.content;

  const filteredContent = useMemo(() => {
    if (filter === "all") return content;
    return content.filter((r) => {
      const reply = r.replyContent ?? r.reply ?? r.reviewReplyContent ?? "";
      const hasReply = Boolean(String(reply ?? "").trim());
      return filter === "replied" ? hasReply : !hasReply;
    });
  }, [content, filter]);

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <h2 className={styles.title}>리뷰 관리</h2>
        <div className={styles.headerActions}>
          <button type="button" className={styles.outlineBtn} onClick={() => load(pageState.page)} disabled={loading}>
            새로고침
          </button>
        </div>
      </div>

      <InlineMessage tone={status?.tone}>{status?.message}</InlineMessage>
      {loading ? <div className={styles.muted}>불러오는 중...</div> : null}

      <div className={styles.filterRow}>
        <button
          type="button"
          className={filter === "all" ? styles.filterBtnActive : styles.filterBtn}
          onClick={() => setFilter("all")}
        >
          전체
        </button>
        <button
          type="button"
          className={filter === "unreplied" ? styles.filterBtnActive : styles.filterBtn}
          onClick={() => setFilter("unreplied")}
        >
          미답글
        </button>
        <button
          type="button"
          className={filter === "replied" ? styles.filterBtnActive : styles.filterBtn}
          onClick={() => setFilter("replied")}
        >
          답글완료
        </button>
      </div>

      <div className={styles.pagerRow}>
        <div className={styles.pagerInfo}>
          총 <b>{pageState.totalElements}</b>건 · {pageState.page + 1}/{pageState.totalPages} 페이지
        </div>

        <div className={styles.pagerBtns}>
          <button
            type="button"
            className={styles.outlineBtn}
            onClick={() => load(Math.max(0, pageState.page - 1))}
            disabled={loading || pageState.page <= 0}
          >
            이전
          </button>
          <button
            type="button"
            className={styles.outlineBtn}
            onClick={() => load(Math.min(pageState.totalPages - 1, pageState.page + 1))}
            disabled={loading || pageState.page >= pageState.totalPages - 1}
          >
            다음
          </button>
        </div>
      </div>

      <div className={styles.list}>
        {!loading && filteredContent.length === 0 ? (
          <div className={styles.muted}>리뷰가 없습니다.</div>
        ) : (
          filteredContent.map((r, idx) => {
            const reviewId = r.reviewId ?? r.id ?? idx;
            const nickname =
              r.authorNickname ??
              r.appUserNickname ??
              r.userNickname ??
              r.nickname ??
              r.memberNickname ??
              "";

             const writer = String(nickname).trim() ? String(nickname).trim() : "익명";

            const rating = r.rating ?? r.reviewRating ?? 0;
            const createdAt = r.reviewCreatedAt ?? r.createdAt ?? r.regDate ?? "";
            const text = r.content ?? r.reviewContent ?? "-";
            const reply = r.replyContent ?? r.reply ?? r.reviewReplyContent ?? "";

            const hasReply = Boolean(String(reply ?? "").trim());

            return (
              <div key={reviewId} className={styles.card}>
                <div className={styles.cardTop}>
                  <div className={styles.metaLeft}>
                    <div className={styles.writer}>{writer}</div>
                    <div className={styles.subMeta}>
                      <span className={styles.stars}>{stars(rating)}</span>
                      {createdAt ? <span className={styles.dot}>·</span> : null}
                      {createdAt ? <span className={styles.date}>{formatDate(createdAt)}</span> : null}
                    </div>
                  </div>
                  <div className={hasReply ? styles.replyChipDone : styles.replyChipTodo}>
                    {hasReply ? "답글완료" : "미답글"}
                  </div>
                </div>

                <div className={styles.content}>{text}</div>

                <div className={styles.replyBlock}>
                  <div className={styles.replyTitle}>사장님 답글</div>

                  {hasReply ? (
                    <div className={styles.replyReadOnly}>{reply}</div>
                  ) : (
                    <div className={styles.replyEditor}>
                      <textarea
                        className={styles.textarea}
                        placeholder="답글을 입력해 주세요"
                        value={drafts[reviewId] ?? ""}
                        onChange={(e) => setDrafts((p) => ({ ...p, [reviewId]: e.target.value }))}
                      />
                      <button
                        type="button"
                        className={styles.primaryBtn}
                        onClick={() => submitReply(reviewId)}
                        disabled={loading || submittingId === reviewId}
                      >
                        {submittingId === reviewId ? "등록 중..." : "답글 등록"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
