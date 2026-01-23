import { useEffect, useMemo, useState } from "react";
import styles from "../../styles/owner.module.css";

const STORAGE_KEY = "owner_active_store_id";

export const loadActiveStoreId = () => {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  const value = Number(raw);
  return Number.isFinite(value) && value > 0 ? value : null;
};

export const saveActiveStoreId = (storeId) => {
  window.localStorage.setItem(STORAGE_KEY, String(storeId));
};

export default function OwnerStoreContextBar({ fixedStoreId, onChange }) {
  const initial = useMemo(() => {
    if (fixedStoreId) return fixedStoreId;
    return loadActiveStoreId();
  }, [fixedStoreId]);

  const [storeId, setStoreId] = useState(initial ?? "");

  useEffect(() => {
    if (fixedStoreId) {
      setStoreId(fixedStoreId);
    }
  }, [fixedStoreId]);

  const handleApply = () => {
    const next = Number(storeId);
    if (!Number.isFinite(next) || next <= 0) return;
    saveActiveStoreId(next);
    onChange?.(next);
  };

  return (
    <div className={styles.storeContextBar}>
      <div className={styles.storeContextTitle}>현재 매장</div>
      <div className={styles.storeContextControls}>
        <input
          className={styles.storeIdInput}
          type="number"
          min="1"
          value={storeId}
          onChange={(e) => setStoreId(e.target.value)}
          placeholder="storeId"
          disabled={Boolean(fixedStoreId)}
        />
        <button
          type="button"
          className={styles.primaryButton}
          onClick={handleApply}
          disabled={Boolean(fixedStoreId)}
        >
          적용
        </button>
        <div className={styles.storeContextHint}>
          리뷰/결제/정산 API는 storeId가 필요합니다.
        </div>
      </div>
    </div>
  );
}
