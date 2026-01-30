import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import InlineMessage from "../../../components/InlineMessage.jsx";
import { ownerDeliveryService } from "../../../api/owner/ownerDeliveryService.js";
import ownerStyles from "../../../styles/owner.module.css";
import { toDeliveryStatusLabel, toDeliveryGroupKeyByStatus, deliveryStatusGroups } from "../../../constants/deliveryStatusMap.js";

function unwrap(res) {
  const body = res?.data ?? null;
  return body?.data ?? body ?? null;
}

export default function OwnerDeliveryDetailPage() {
  const { deliveryId } = useParams();
  const did = Number(deliveryId);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [data, setData] = useState(null);

  const invalidId = !Number.isFinite(did) || did <= 0;

  const load = async () => {
    if (invalidId) return;
    setLoading(true);
    setStatus(null);
    try {
      const res = await ownerDeliveryService.detail(did);
      setData(unwrap(res));
    } catch (e) {
      const code = e?.response?.status;
      const msg =
        code === 404
          ? "해당 배달 내역을 찾을 수 없습니다."
          : e?.response?.data?.message || e?.message || "배달 상세 조회에 실패했습니다.";
      setStatus({ tone: "error", message: msg });
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [did]);

  const statusRaw = String(data?.orderDeliveryStatus ?? "");
  const groupKey = toDeliveryGroupKeyByStatus(statusRaw);
  const groupLabel = useMemo(
    () => (deliveryStatusGroups.find((g) => g.key === groupKey)?.label ?? "-"),
    [groupKey],
  );

  const toDateText = (v) => {
    if (!v) return "-";
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return String(v);
    return d.toLocaleString("ko-KR");
  };

  const toMeterText = (v) => {
    if (v === null || v === undefined || v === "") return "-";
    const n = Number(v);
    if (Number.isNaN(n)) return String(v);
    if (n >= 1000) return `${(n / 1000).toFixed(1)}km`;
    return `${n}m`;
  };

  const toMinuteText = (v) => {
    if (v === null || v === undefined || v === "") return "-";
    const n = Number(v);
    if (Number.isNaN(n)) return String(v);
    return `${n}분`;
  };

  return (
    <div>
      <div className={ownerStyles.detailHeader}>
        <div>
          <div className={ownerStyles.detailTitle}>배달 상세</div>
          <div className={ownerStyles.mutedText}>
            {invalidId ? "잘못된 배달번호입니다." : `배달번호 ${did}`}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" className={ownerStyles.outlineButton} onClick={() => navigate(-1)}>
            목록으로
          </button>
          <button type="button" className={ownerStyles.outlineButton} onClick={load} disabled={loading || invalidId}>
            새로고침
          </button>
        </div>
      </div>

      {invalidId ? (
        <InlineMessage tone="error">배달번호가 올바르지 않습니다.</InlineMessage>
      ) : null}

      <InlineMessage tone={status?.tone}>{status?.message}</InlineMessage>
      {loading ? <div className={ownerStyles.mutedText}>불러오는 중...</div> : null}

      <div className={ownerStyles.detailCard}>
        {!data ? (
          <div className={ownerStyles.mutedText}>데이터가 없습니다.</div>
        ) : (
          <>
            <div className={ownerStyles.detailHeader}>
              <div className={ownerStyles.detailTitle}>요약</div>
              <span className={ownerStyles.badge}>
                {groupLabel} · {toDeliveryStatusLabel(statusRaw)}
              </span>
            </div>
            <div className={ownerStyles.detailGrid}>
              <KeyVal k="배달번호" v={data.deliveryId} />
              <KeyVal k="주문번호" v={data.orderId} />
              <KeyVal k="라이더" v={data.delivererId ?? "-"} />
              <KeyVal k="생성" v={toDateText(data.orderDeliveryCreatedDate)} />
            </div>
          </>
        )}
      </div>

      {data ? (
        <div className={ownerStyles.detailCard}>
          <div className={ownerStyles.detailHeader}>
            <div className={ownerStyles.detailTitle}>진행 정보</div>
          </div>
          <div className={ownerStyles.detailGrid}>
            <KeyVal k="주문 접수" v={toDateText(data.orderAcceptTime)} />
            <KeyVal k="픽업" v={toDateText(data.orderDeliveryPickupTime)} />
            <KeyVal k="배달 시작" v={toDateText(data.orderDeliveryStartTime)} />
            <KeyVal k="배달 완료" v={toDateText(data.orderDeliveryCompleteTime)} />
            <KeyVal k="거리" v={toMeterText(data.orderDeliveryDistance)} />
            <KeyVal k="예상 소요" v={toMinuteText(data.orderDeliveryEstTime)} />
            <KeyVal k="실제 소요" v={toMinuteText(data.orderDeliveryActTime)} />
          </div>
        </div>
      ) : null}
    </div>
  );
}

function KeyVal({ k, v }) {
  return (
    <>
      <div className={ownerStyles.detailKey}>{k}</div>
      <div className={ownerStyles.detailVal}>{v ?? "-"}</div>
    </>
  );
}
