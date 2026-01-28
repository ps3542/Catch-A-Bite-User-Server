import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ownerOrderService } from "../../../api/owner/ownerOrderService.js";
import { unwrap } from "../../../utils/apiResponse.js";
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

const processingValues = new Set(["pending", "cooking", "cooked", "payment_confirmed"]);

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
  const [items, setItems] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setError("");
    setLoading(true);
    try {
      const status = tabToStatus[tab];
      const params = status ? { status } : {};
      const res = await ownerOrderService.list(sid, params);
      const data = unwrap(res);
      const content = data?.content ?? data?.items ?? data ?? [];

      let next = Array.isArray(content) ? content : [];

      // 처리중 탭은 서버 필터 없이 받은 뒤 상태값으로 필터링
      if (tab === "processing") {
        next = next.filter((o) => processingValues.has(String(o?.orderStatus ?? "").trim().toLowerCase()));
      }

      setItems(next);
    } catch (e) {
      setError(e?.response?.data?.message || "주문 목록 조회 실패");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!Number.isFinite(sid)) return;
    load();
  }, [sid, tab]);

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
                  <div className={styles.orderNo}>주문번호 {orderNo}</div>
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
    </div>
  );
}
