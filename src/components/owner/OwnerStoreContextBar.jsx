import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import { ownerStoreService } from "../../api/owner/ownerStoreService";
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

const notifyActiveStoreIdChanged = (storeId) => {
  try {
    window.dispatchEvent(
      new CustomEvent("owner:store-change", { detail: { storeId } })
    );
  } catch {
    // ignore
  }
};

/**
 * 현재 매장 컨텍스트 바
 * - 기존: storeId 수동 입력(사용성이 낮아 화면에서 아무 것도 못하는 상황이 자주 발생)
 * - 개선: 내 매장 목록을 불러와 드롭다운으로 선택 + storeId 자동 세팅
 */
export default function OwnerStoreContextBar({ fixedStoreId, onChange }) {
  const navigate = useNavigate();

  const initial = useMemo(() => {
    if (fixedStoreId) return Number(fixedStoreId);
    return loadActiveStoreId();
  }, [fixedStoreId]);

  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState("");
  const [storeId, setStoreId] = useState(initial ?? "");

  const appliedRef = useRef(false);

  useEffect(() => {
    if (fixedStoreId) {
      setStoreId(Number(fixedStoreId));
    }
  }, [fixedStoreId]);

  useEffect(() => {
    let active = true;

    const fetchStores = async () => {
      try {
        setLoading(true);
        setErrorText("");
        const res = await ownerStoreService.list();
        const list = res?.data?.data ?? [];
        if (!active) return;
        setStores(Array.isArray(list) ? list : []);

        // ✅ active storeId가 없으면 첫 매장을 자동 적용
        if (!fixedStoreId) {
          const current = loadActiveStoreId();
          const next = current ?? (Array.isArray(list) && list[0]?.storeId);
          if (next && !appliedRef.current) {
            appliedRef.current = true;
            saveActiveStoreId(next);
            setStoreId(next);
            notifyActiveStoreIdChanged(next);
            onChange?.(next);
          }
        }
      } catch (e) {
        if (!active) return;
        setStores([]);
        const status = e?.response?.status;
        // 로그인 전이면 조용히
        if (status === 401 || status === 403) {
          setErrorText("");
        } else {
          setErrorText("매장 목록을 불러오지 못했습니다.");
        }
      } finally {
        if (!active) return;
        setLoading(false);
      }
    };

    fetchStores();
    return () => {
      active = false;
    };
  }, [fixedStoreId, onChange]);

  const handleApply = (nextId) => {
    const next = Number(nextId);
    if (!Number.isFinite(next) || next <= 0) return;
    saveActiveStoreId(next);
    setStoreId(next);
    notifyActiveStoreIdChanged(next);
    onChange?.(next);
  };

  const selectedId = Number(storeId);
  const hasStores = Array.isArray(stores) && stores.length > 0;

  return (
    <div className={styles.storeContextBar}>
      <div className={styles.storeContextTitle}>현재 매장</div>

      <div className={styles.storeContextControls}>
        {fixedStoreId ? (
          <div className={styles.storeContextFixedValue}>{fixedStoreId}</div>
        ) : (
          <>
            <select
              className={styles.storeSelect}
              value={storeId}
              onChange={(e) => setStoreId(e.target.value)}
              disabled={loading}
            >
              <option value="">{loading ? "불러오는 중…" : "매장 선택"}</option>
              {hasStores &&
                stores.map((s) => (
                  <option key={s.storeId} value={s.storeId}>
                    {s.storeName ?? "매장"} (#{s.storeId})
                  </option>
                ))}
            </select>

            <button
              type="button"
              className={styles.primaryButton}
              onClick={() => handleApply(storeId)}
              disabled={!selectedId}
            >
              적용
            </button>

            {!loading && !hasStores && (
              <button
                type="button"
                className={styles.outlineButton}
                onClick={() => navigate("/owner/stores/new")}
              >
                매장 등록
              </button>
            )}
          </>
        )}

        <div className={styles.storeContextHint}>

        </div>

        {errorText ? (
          <div className={styles.storeContextError}>{errorText}</div>
        ) : null}
      </div>
    </div>
  );
}
