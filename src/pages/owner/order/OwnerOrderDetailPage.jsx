import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ownerOrderService } from "../../../api/owner/ownerOrderService.js";
import { unwrap } from "../../../utils/apiResponse.js";
import styles from "../../../styles/ownerOrder.module.css";
import { ownerOrderStatusLabel } from "../../../utils/orderStatus.js";


// 백엔드(OrderStatus) 흐름(OwnerOrderServiceImpl 기준):
// PENDING -> COOKING -> COOKED -> (PAYMENTCONFIRMED) -> DELIVERED (REJECTED는 PENDING에서 분기)
const steps = [
  { key: "PENDING", label: "접수대기" },
  { key: "COOKING", label: "조리중" },
  { key: "COOKED", label: "조리완료" },
  { key: "DELIVERING", label: "배달중" },
  { key: "DELIVERED", label: "배달완료" },
];

function normalizeStatus(raw) {
  const v = String(raw ?? "").trim();
  if (!v) return "PENDING";

  // 백엔드 응답은 getValue()라서 소문자(pending/cooking/...)가 올 수 있음
  const lower = v.toLowerCase();
  if (lower === "pending") return "PENDING";
  if (lower === "cooking") return "COOKING";
  if (lower === "cooked") return "COOKED";
  if (lower === "delivered") return "DELIVERED";
  if (lower === "rejected") return "REJECTED";
  if (lower === "payment_confirmed" || lower === "paymentconfirmed") return "PAYMENTCONFIRMED";

  // 혹시 enum name(PENDING/COOKING/...)로 내려오는 경우도 수용
  const upper = v.toUpperCase();
  if (["PENDING", "COOKING", "COOKED", "DELIVERED", "REJECTED", "PAYMENTCONFIRMED"].includes(upper)) {
    return upper;
  }

  return "PENDING";
}

function stepIndex(statusKey) {
  const idx = steps.findIndex((x) => x.key === statusKey);
  return idx < 0 ? 0 : idx;
}

function formatDate(v) {
  if (!v) return "-";
  const s = String(v);
  return s.length > 16 ? s.slice(0, 16) : s;
}

function formatMoney(v) {
  const n = Number(v ?? 0);
  if (!Number.isFinite(n)) return "-";
  return `${n.toLocaleString("ko-KR")}원`;
}

function optionSum(options) {
  if (!Array.isArray(options)) return 0;
  return options.reduce((acc, o) => acc + Number(o?.menuOptionPrice ?? o?.orderOptionExtraPrice ?? 0), 0);
}

function normalizeItems(order) {
  const raw = order?.items ?? order?.orderItems ?? order?.orderItemList ?? order?.orderItemDtos;
  return Array.isArray(raw) ? raw : [];
}

function normalizeItemOptions(item) {
  const raw = item?.options ?? item?.orderOptions ?? item?.orderItemOptions ?? item?.menuOptions;
  return Array.isArray(raw) ? raw : [];
}

export default function OwnerOrderDetailPage() {
  const { storeId, orderId } = useParams();
  const sid = useMemo(() => Number(storeId), [storeId]);
  const oid = useMemo(() => Number(orderId), [orderId]);
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  // 피그마: 조리시간 선택 UI (백엔드에 전달 스펙 없음 → 프론트 UI에서만 보관)
  const [prepOpen, setPrepOpen] = useState(false);
  const [prepMin, setPrepMin] = useState(30);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const load = async () => {
    setError("");
    try {
      const res = await ownerOrderService.detail(sid, oid);
      setData(unwrap(res));
    } catch (e) {
      setError(e?.response?.data?.message || "주문 상세 조회 실패");
    }
  };

  useEffect(() => {
    if (!Number.isFinite(sid) || !Number.isFinite(oid)) return;
    load();
  }, [sid, oid]);

  if (error) return <div className={styles.error}>{error}</div>;
  if (!data) return <div className={styles.muted}>불러오는 중...</div>;

  const orderNo = data.orderNo ?? data.orderCode ?? data.orderId ?? oid;
  const rawStatus = data.orderStatus ?? data.status ?? "pending";
  const statusKey = normalizeStatus(rawStatus);
  const activeStep = stepIndex(statusKey);

  const orderAt = data.orderCreatedAt ?? data.orderDate ?? data.createdAt;
  const onAccept = async () => {
    // 백엔드 accept 스펙에는 조리시간 payload가 없음(Controller 기준).
    // 따라서 prepMin은 UI 표시/경험용으로만 사용하고, 요청에는 포함하지 않습니다.
    await ownerOrderService.accept(sid, oid);
    setPrepOpen(false);
    load();
  };

  const onReject = async () => {
    const reason = String(rejectReason ?? "").trim();
    if (!reason) return;
    await ownerOrderService.reject(sid, oid, { reason });
    setRejectOpen(false);
    setRejectReason("");
    load();
  };

  const onCooked = async () => {
    await ownerOrderService.cooked(sid, oid);
    load();
  };

  const items = normalizeItems(data);
  const deliveryFee = Number(data?.deliveryFee ?? data?.deliveryPrice ?? 0);
  const discountPrice = Number(data?.discountPrice ?? data?.discountAmount ?? data?.discount ?? 0);

  const calcLineTotal = (it) => {
    const base = Number(it?.menuPrice ?? it?.price ?? it?.menuAmount ?? 0);
    const qty = Number(it?.quantity ?? it?.qty ?? it?.count ?? 0);
    const opt = optionSum(normalizeItemOptions(it));
    return (base + opt) * qty;
  };

  const itemsTotal = items.reduce((acc, it) => acc + calcLineTotal(it), 0);
  const finalTotal = Number(
    data?.orderTotalPrice ??
      data?.totalPrice ??
      data?.amount ??
      itemsTotal + deliveryFee - discountPrice
  );

  const addressText =
    data.orderAddress ?? data.deliveryAddress ?? data.address ?? data.roadAddress ?? data.detailAddress ?? "-";

  return (
    <div className={styles.page}>
      <div className={styles.detailHeader}>
        <button type="button" className={styles.backBtn} onClick={() => navigate(-1)} aria-label="뒤로가기">
          뒤로
        </button>
        <div className={styles.detailTitle}>주문번호 {orderNo}</div>
        <div className={styles.detailHeaderSpacer} />
      </div>


      {/* 진행 상태 카드 */}
      <div className={styles.progressCard}>
        <div className={styles.progressTitle}>
          {statusKey === "PENDING" ? "주문이 들어왔습니다" : null}
          {statusKey === "COOKING" ? "조리 중입니다" : null}
          {statusKey === "COOKED" ? "조리가 완료되었습니다" : null}
          {statusKey === "PAYMENTCONFIRMED" ? "결제가 확인되었습니다" : null}
          {statusKey === "DELIVERED" ? "배달이 완료되었습니다" : null}
          {statusKey === "REJECTED" ? "거절된 주문입니다" : null}
        </div>

        <div className={styles.progressBar}>
          {steps.map((s, idx) => {
            const isActive = idx === activeStep;
            const isDone = idx < activeStep;
            return (
              <div key={s.key} className={styles.progressStep}>
                <div
                  className={`${styles.dot} ${isActive ? styles.dotActive : ""} ${
                    isDone ? styles.dotDone : ""
                  }`}
                />
                <div className={`${styles.stepLabel} ${isActive ? styles.stepLabelActive : ""}`}>{s.label}</div>
              </div>
            );
          })}
          <div className={styles.progressLine} />
        </div>

        <button type="button" className={`${styles.bigBlackBtn} ${styles.disabledBtn}`} disabled>
          라이더 위치 불러오기
        </button>
      </div>

      {/* 주문 이력 카드 */}
      <div className={styles.historyTitle}>주문이력</div>

      <div className={styles.historyCard}>
        <div className={styles.historyHeader}>주문번호 {orderNo}</div>

        <div className={styles.historyGrid}>
          <div className={styles.historyKey}>주문일시</div>
          <div className={styles.historyVal}>{formatDate(orderAt)}</div>

          <div className={styles.historyKey}>상태</div>
          <div className={styles.historyVal}>{ownerOrderStatusLabel(data.orderStatus)}</div>


          <div className={styles.historyKey}>조리시간</div>
          <div className={styles.historyVal}>{prepMin}분</div>

          <div className={styles.historyKey}>주소</div>
          <div className={styles.historyVal}>{addressText}</div>
        </div>

        <button type="button" className={styles.bigOutlineBtn} onClick={() => setPrepOpen(true)}>
          조리시간 설정
        </button>

        {/* 상태별 액션 */}
        {statusKey === "PENDING" ? (
          <div className={styles.detailActions}>
            <button type="button" className={styles.bigBlackBtn} onClick={() => setPrepOpen(true)}>
              접수하기
            </button>
            <button type="button" className={styles.bigDangerBtn} onClick={() => setRejectOpen(true)}>
              거절하기
            </button>
          </div>
        ) : null}

        {statusKey === "COOKING" ? (
          <div className={styles.detailActionsSingle}>
            <button type="button" className={styles.bigBlackBtn} onClick={onCooked}>
              조리 완료
            </button>
          </div>
        ) : null}

        </div>

      {/* 주문 상세(메뉴/옵션) */}
      <div className={styles.sectionTitle}>주문 내역</div>
      <div className={styles.orderDetailCard}>
        {items.length === 0 ? (
          <div className={styles.muted}>주문 내역이 없습니다.</div>
        ) : (
          <div className={styles.itemList}>
            {items.map((it) => {
              const qty = Number(it?.quantity ?? it?.qty ?? it?.count ?? 0);
              const name = it?.menuName ?? it?.name ?? it?.menu?.menuName ?? "메뉴";
              const base = Number(it?.menuPrice ?? it?.price ?? it?.menuAmount ?? 0);
              const opts = normalizeItemOptions(it);
              const opt = optionSum(opts);
              const line = (base + opt) * qty;
              return (
                <div key={it.orderItemId ?? it.id ?? `${name}-${qty}`} className={styles.itemRow}>
                  <div className={styles.itemMain}>
                    <div className={styles.itemName}>
                      {name}
                      <span className={styles.itemQty}>x{qty}</span>
                    </div>
                    {opts.length ? (
                      <div className={styles.optionList}>
                        {opts.map((op) => (
                          <div key={op.orderOptionId ?? op.id ?? op.menuOptionName ?? op.name} className={styles.optionRow}>
                            <span className={styles.optionName}>{op.menuOptionName ?? op.name ?? "옵션"}</span>
                            <span className={styles.optionPrice}>
                              {formatMoney(op.menuOptionPrice ?? op.price ?? op.orderOptionExtraPrice ?? op.extraPrice ?? 0)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </div>
                  <div className={styles.itemPrice}>{formatMoney(line)}</div>
                </div>
              );
            })}
          </div>
        )}

        <div className={styles.divider} />

        <div className={styles.totalGrid}>
          <div className={styles.totalKey}>주문금액</div>
          <div className={styles.totalVal}>{formatMoney(data?.orderTotalPrice ?? data?.totalPrice ?? itemsTotal)}</div>

          <div className={styles.totalKey}>배달비</div>
          <div className={styles.totalVal}>{formatMoney(deliveryFee)}</div>

          <div className={styles.totalKey}>할인</div>
          <div className={styles.totalVal}>{formatMoney(discountPrice)}</div>

          <div className={styles.totalKey}>최종금액</div>
          <div className={styles.totalVal}>{formatMoney(finalTotal)}</div>
        </div>
      </div>

      {/* 거절 사유 모달 */}
      {rejectOpen ? (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modal}>
            <div className={styles.modalTop}>
              <div className={styles.modalTitle}>거절 사유</div>
              <button
                type="button"
                className={styles.modalClose}
                onClick={() => {
                  setRejectOpen(false);
                  setRejectReason("");
                }}
              >
                ✕
              </button>
            </div>

            <textarea
              className={styles.textarea}
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="거절 사유를 입력하세요"
              rows={4}
            />

            <div className={styles.modalActions}>
              <button type="button" className={styles.bigOutlineBtn} onClick={() => setRejectOpen(false)}>
                취소
              </button>
              <button type="button" className={styles.bigDangerBtn} onClick={onReject}>
                거절 처리
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* 피그마: 조리시간 선택(별도 화면) → PC UX로는 모달로 재해석 */}
      {prepOpen ? (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modal}>
            <div className={styles.modalTop}>
              <div className={styles.modalTitle}>준비시간을 선택해주세요</div>
              <button type="button" className={styles.modalClose} onClick={() => setPrepOpen(false)}>
                ✕
              </button>
            </div>

            <div className={styles.timePicker}>
              <button
                type="button"
                className={styles.timeBtn}
                onClick={() => setPrepMin((p) => Math.max(0, p - 5))}
              >
                -
              </button>
              <div className={styles.timeValue}>{prepMin}분</div>
              <button type="button" className={styles.timeBtn} onClick={() => setPrepMin((p) => p + 5)}>
                +
              </button>
            </div>

            <button type="button" className={styles.bigBlackBtn} onClick={onAccept}>
              접수하기
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
