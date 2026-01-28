import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import InlineMessage from "../../../components/InlineMessage.jsx";
import { ownerDeliveryService } from "../../../api/owner/ownerDeliveryService.js";
import styles from "../../../styles/ownerOrder.module.css";

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

  const load = async () => {
    if (!Number.isFinite(did) || did <= 0) return;
    setLoading(true);
    setStatus(null);
    try {
      const res = await ownerDeliveryService.detail(did);
      setData(unwrap(res));
    } catch (e) {
      setStatus({ tone: "error", message: e?.response?.data?.message || e?.message || "배달 상세 조회에 실패했습니다." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [did]);

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <h2 className={styles.title}>배달 상세</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <button type="button" className={styles.outlineBtn} onClick={() => navigate(-1)}>뒤로</button>
          <button type="button" className={styles.outlineBtn} onClick={load} disabled={loading}>새로고침</button>
        </div>
      </div>

      <InlineMessage tone={status?.tone}>{status?.message}</InlineMessage>
      {loading ? <div className={styles.muted}>불러오는 중...</div> : null}

      <div className={styles.card}>
        {!data ? (
          <div className={styles.muted}>데이터가 없습니다.</div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <Info label="deliveryId" value={data.deliveryId} />
            <Info label="orderId" value={data.orderId} />
            <Info label="delivererId" value={data.delivererId} />
            <Info label="status" value={data.orderDeliveryStatus} />
            <Info label="acceptTime" value={data.orderAcceptTime} />
            <Info label="pickupTime" value={data.orderDeliveryPickupTime} />
            <Info label="startTime" value={data.orderDeliveryStartTime} />
            <Info label="completeTime" value={data.orderDeliveryCompleteTime} />
            <Info label="distance" value={data.orderDeliveryDistance} />
            <Info label="estTime" value={data.orderDeliveryEstTime} />
            <Info label="actTime" value={data.orderDeliveryActTime} />
            <Info label="created" value={data.orderDeliveryCreatedDate} />
          </div>
        )}
      </div>
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, padding: 12 }}>
      <div style={{ fontSize: 12, opacity: 0.7 }}>{label}</div>
      <div style={{ marginTop: 6, fontWeight: 700, wordBreak: "break-word" }}>{value ?? "-"}</div>
    </div>
  );
}
