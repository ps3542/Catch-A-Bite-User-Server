import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import InlineMessage from "../../../components/InlineMessage.jsx";
import { ownerDeliveryService } from "../../../api/owner/ownerDeliveryService.js";
import ownerStyles from "../../../styles/owner.module.css";
import { deliveryStatusGroups, toDeliveryStatusLabel } from "../../../constants/deliveryStatusMap.js";

// NOTE: Owner 화면은 백엔드 enum을 그대로 노출하지 않고,
// 사업자 관점의 그룹(전체/배차 대기/진행 중/완료/취소)으로 필터링합니다.

function unwrap(res) {
  const body = res?.data ?? null;
  return body?.data ?? body ?? null;
}

export default function OwnerDeliveryListPage() {
  const navigate = useNavigate();
  const [groupKey, setGroupKey] = useState("all");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const [items, setItems] = useState([]);

  const load = async () => {
    setLoading(true);
    setStatus(null);
    try {
      // 목록은 한 번에 가져오고, 그룹(진행 중 등)은 클라이언트에서 안전하게 필터링합니다.
      const res = await ownerDeliveryService.list();
      const data = unwrap(res);
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setStatus({ tone: "error", message: e?.response?.data?.message || e?.message || "배달 목록 조회에 실패했습니다." });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeGroup = useMemo(
    () => deliveryStatusGroups.find((g) => g.key === groupKey) ?? deliveryStatusGroups[0],
    [groupKey],
  );

  const toDateText = (v) => {
    if (!v) return "-";
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) return String(v);
    return d.toLocaleString("ko-KR");
  };

  const rows = useMemo(() => {
    const arr = Array.isArray(items) ? [...items] : [];
    const filtered = activeGroup?.statuses
      ? arr.filter((x) => activeGroup.statuses.includes(String(x?.orderDeliveryStatus ?? "")))
      : arr;
    // newest first if created date exists
    filtered.sort((a, b) => {
      const at = a?.orderDeliveryCreatedDate ? new Date(a.orderDeliveryCreatedDate).getTime() : 0;
      const bt = b?.orderDeliveryCreatedDate ? new Date(b.orderDeliveryCreatedDate).getTime() : 0;
      return bt - at;
    });
    return filtered.map((d, idx) => ({
      key: d?.deliveryId ?? idx,
      deliveryId: d?.deliveryId ?? "-",
      orderId: d?.orderId ?? "-",
      delivererId: d?.delivererId ?? "-",
      statusRaw: d?.orderDeliveryStatus ?? "-",
      createdAt: d?.orderDeliveryCreatedDate ?? "",
    }));
  }, [items, activeGroup]);

  return (
    <div>
      <h2>배달 관리</h2>

      <div className={ownerStyles.toolbar}>
        <select className={ownerStyles.input} value={groupKey} onChange={(e) => setGroupKey(e.target.value)}>
          {deliveryStatusGroups.map((g) => (
            <option key={g.key} value={g.key}>
              {g.label}
            </option>
          ))}
        </select>
        <button type="button" className={ownerStyles.primaryButton} onClick={load} disabled={loading}>
          새로고침
        </button>
        <div style={{ marginLeft: "auto", fontSize: 12, opacity: 0.7 }}>
          {loading ? "조회 중..." : `총 ${rows.length}건`}
        </div>
      </div>

      <InlineMessage tone={status?.tone}>{status?.message}</InlineMessage>

      <table className={ownerStyles.table}>
        <thead>
          <tr>
            <th className={ownerStyles.th}>배달번호</th>
            <th className={ownerStyles.th}>주문번호</th>
            <th className={ownerStyles.th}>라이더</th>
            <th className={ownerStyles.th}>상태</th>
            <th className={ownerStyles.th}>생성일</th>
          </tr>
        </thead>
        <tbody>
          {!loading && rows.length === 0 ? (
            <tr>
              <td className={ownerStyles.td} colSpan={5} style={{ textAlign: "center", opacity: 0.7 }}>
                배달 내역이 없습니다.
              </td>
            </tr>
          ) : null}
          {rows.map((r) => (
            <tr
              key={r.key}
              className={ownerStyles.rowClickable}
              onClick={() => (r.deliveryId !== "-" ? navigate(`/owner/deliveries/${r.deliveryId}`) : null)}
              title="상세 보기"
            >
              <td className={ownerStyles.td}>{r.deliveryId}</td>
              <td className={ownerStyles.td}>{r.orderId}</td>
              <td className={ownerStyles.td}>{r.delivererId ?? "-"}</td>
              <td className={ownerStyles.td}><span className={ownerStyles.badge}>{toDeliveryStatusLabel(r.statusRaw)}</span></td>
              <td className={ownerStyles.td}>{toDateText(r.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
