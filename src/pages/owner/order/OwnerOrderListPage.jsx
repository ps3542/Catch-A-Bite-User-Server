import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ownerOrderService } from "../../../api/owner/ownerOrderService.js";
import { unwrap } from "../../../utils/apiResponse.js";
import { ownerOrderStatusLabel } from "../../../utils/orderStatus.js";
import styles from "../../../styles/ownerOrder.module.css";

// 백엔드(OrderStatus) 기준:
// PENDING | COOKING | COOKED | PAYMENTCONFIRMED | DELIVERED | REJECTED
// 응답(orderStatus)은 getValue()로 내려오므로 소문자(pending/cooking/...) 입니다.

// 처리중 탭은 백엔드가 단일 status 필터만 지원하므로,
// status 미전달(=전체 조회) 후 클라이언트에서 처리중 상태만 필터링합니다.
const tabToStatus = {
  processing: "", // 처리중: 서버 필터 없이 조회 후 클라이언트 필터
  done: "DELIVERED", // 완료: 서버 필터
};

// 백엔드 getValue() 형태가 payment_confirmed / paymentconfirmed 둘 다 올 수 있어 둘 다 허용합니다.
const processingValues = new Set(["pending", "cooking", "cooked", "delivering"]);

function formatMoney(v) {
  const n = Number(v ?? 0);
  if (!Number.isFinite(n)) return "-";
  return `${n.toLocaleString("ko-KR")}원`;
}

function buildSummary(order) {
  const items = order?.orderItems ?? order?.items ?? [];
  if (!Array.isArray(items) || items.length === 0) return "주문 내역";
  const first = items[0];
  const firstName = first?.menuName ?? first?.name ?? "메뉴";
  const rest = items.length - 1;
  return rest > 0 ? `${firstName} 외 ${rest}건` : `${firstName}`;
}

export default function OwnerOrderListPage() {
  const { storeId } = useParams();
  const sid = useMemo(() => Number(storeId), [storeId]);
  const navigate = useNavigate();

  const [tab, setTab] = useState("processing");
  const [statusFilter, setStatusFilter] = useState("processing_all");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [page, setPage] = useState(0);
  const [size] = useState(20);
  const [pageInfo, setPageInfo] = useState({ page: 0, totalPages: 0, totalElements: 0, hasNext: false });
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setError("");
    setLoading(true);
    try {
      const status = tabToStatus[tab];

      const params = {
        page,
        size,
      };

      if (from) params.from = from;
      if (to) params.to = to;

      // 완료 탭: 서버 status 필터 사용
      if (status) params.status = status;

      // 처리중 탭: 기본은 전체 조회 후 클라이언트 필터
      // 단, 상태를 특정하면 서버 status 필터를 사용(페이징 정확)
      if (tab === "processing") {
        if (statusFilter !== "processing_all") {
          params.status = statusFilter;
        } else {
          // 전체 처리중은 기간/페이징 기준으로 최근 목록을 가져오고,
          // 화면에서는 처리중 상태만 필터링하여 보여줍니다.
          // (서버가 status 단일 필터만 제공하므로 불가피)
          delete params.status;
        }
      }

      const res = await ownerOrderService.list(sid, params);
      const data = unwrap(res);
      const content = data?.content ?? data?.items ?? data ?? [];

      let next = Array.isArray(content) ? content : [];

      // 처리중 탭은 서버 필터 없이 받은 뒤 상태값으로 필터링
      if (tab === "processing" && statusFilter === "processing_all") {
        next = next.filter((o) => processingValues.has(String(o?.orderStatus ?? "").trim().toLowerCase()));
      }

      setItems(next);

      // page meta
      const currentPage = data?.page ?? data?.number ?? 0;
      const totalPages = data?.totalPages ?? 0;
      const hasNext =
        !!data?.hasNext ||
        (typeof data?.last === "boolean" ? !data.last : false) ||
        (totalPages ? currentPage + 1 < totalPages : false);

      setPageInfo({
        page: currentPage,
        totalPages,
        totalElements: data?.totalElements ?? data?.total ?? 0,
        hasNext,
      });
    } catch (e) {
      setError(e?.response?.data?.message || "주문 목록 조회 실패");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!Number.isFinite(sid)) return;
    load();
  }, [sid, tab, statusFilter, page]);

  // 탭 변경 시 페이지 리셋
  useEffect(() => {
    setPage(0);
    if (tab === "done") {
      setStatusFilter("processing_all");
    }
  }, [tab]);



  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <h2 className={styles.title}>주문관리</h2>
      </div>

      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tab} ${tab === "processing" ? styles.tabActive : ""}`}
          onClick={() => setTab("processing")}
        >
          신규 처리중
        </button>
        <button
          type="button"
          className={`${styles.tab} ${tab === "done" ? styles.tabActive : ""}`}
          onClick={() => setTab("done")}
        >
          완료
        </button>
      </div>

      <div className={styles.filters}>
        {tab === "processing" ? (
          <select
            className={styles.select}
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(0);
            }}
          >
            <option value="processing_all">처리중 전체</option>
            <option value="PENDING">접수대기</option>
            <option value="COOKING">조리중</option>
            <option value="COOKED">조리완료</option>
            <option value="PAYMENTCONFIRMED">결제확인</option>
            <option value="REJECTED">거절</option>
          </select>
        ) : (
          <div className={styles.filterHint}>상태: 배달완료</div>
        )}

        <div className={styles.dateRange}>
          <input className={styles.dateInput} type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <span className={styles.rangeSep}>~</span>
          <input className={styles.dateInput} type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>

        <button
          type="button"
          className={styles.applyBtn}
          onClick={() => {
            setPage(0);
            load();
          }}
        >
          적용
        </button>
      </div>

      {error ? <div className={styles.error}>{error}</div> : null}
      {loading ? <div className={styles.muted}>불러오는 중...</div> : null}

      <div className={styles.list}>
        {!loading && items.length === 0 ? (
          <div className={styles.muted}>표시할 주문이 없습니다.</div>
        ) : (
          items.map((o) => {
            const oid = o.orderId ?? o.id;
            const orderNo = o.orderNo ?? o.orderCode ?? oid;
            const summary = buildSummary(o);
            const totalPrice = o.orderTotalPrice ?? o.totalPrice ?? o.amount;
            const address = o.orderAddress ?? o.deliveryAddress ?? o.address ?? o.roadAddress ?? "-";

            return (
              <div key={oid} className={styles.orderCard}>
                <div className={styles.orderLeft}>
                  <div className={styles.orderNoRow}>
                    <div className={styles.orderNo}>주문번호 {orderNo}</div>
                    <div className={styles.statusBadge}>{ownerOrderStatusLabel(o?.orderStatus)}</div>
                  </div>
                  <div className={styles.orderSummary}>{summary}</div>
                  <div className={styles.orderPrice}>{formatMoney(totalPrice)}</div>
                  <div className={styles.orderAddr}>{address}</div>
                </div>

                <div className={styles.orderRight}>
                  <button
                    type="button"
                    className={styles.outlineArrowBtn}
                    onClick={() => navigate(`/owner/stores/${sid}/orders/${oid}`)}
                  >
                    {tab === "processing" ? "배달 접수" : "상세 보기"} <span className={styles.chev}>&gt;</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className={styles.pagination}>
        <button
          type="button"
          className={styles.pageBtn}
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page <= 0 || loading}
        >
          이전
        </button>
        <div className={styles.pageInfo}>
          {pageInfo.totalPages ? `${pageInfo.page + 1} / ${pageInfo.totalPages}` : "1 / 1"}
        </div>
        <button
          type="button"
          className={styles.pageBtn}
          onClick={() => setPage((p) => p + 1)}
          disabled={!pageInfo.hasNext || loading}
        >
          다음
        </button>
      </div>
    </div>
  );
}
