import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

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

// 현재 pathname에서 /owner/stores/:id 부분이 있으면 id만 교체
// 없으면 기본 랜딩(/owner/stores/:id/edit)으로 보냄
const OWNER_STORES_PREFIX = "/owner/stores";

const buildNextPath = (pathname, nextStoreId) => {
  const re = new RegExp(`^(${OWNER_STORES_PREFIX}/)(\\d+)(/.*)?$`);
  const m = String(pathname ?? "").match(re);

  if (m) {
    const suffix = m[3] ?? "";
    return `${m[1]}${nextStoreId}${suffix}`;
  }

  // 현재 경로가 storeId를 포함하지 않는 경우(예: /owner/stores 목록 등)
  return `${OWNER_STORES_PREFIX}/${nextStoreId}/edit`;
};

/**
 * 현재 매장 컨텍스트 바
 * - 내 매장 목록을 불러와 드롭다운으로 선택 + storeId 자동 세팅
 * - 적용 시: active store 저장 + 이벤트 발행 + (가능하면) 현재 화면을 같은 기능 화면으로 storeId만 교체하여 이동
 */
export default function OwnerStoreContextBar({ fixedStoreId, onChange }) {
  const navigate = useNavigate();
  const location = useLocation();

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
            // 자동 적용 시에도 현재 화면을 storeId 기준 화면으로 맞춰주고 싶으면 아래 주석 해제
            // const nextPath = buildNextPath(location.pathname, next);
            // navigate(`${nextPath}${location.search}`, { replace: true });
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
    // location/navigate는 자동적용 navigate 주석 해제 시 deps에 넣는 게 맞습니다.
  }, [fixedStoreId, onChange]);

  const handleApply = (nextId) => {
    const next = Number(nextId);
    if (!Number.isFinite(next) || next <= 0) return;

    // 상태/스토리지/이벤트
    saveActiveStoreId(next);
    setStoreId(next);
    notifyActiveStoreIdChanged(next);
    onChange?.(next);

    // ✅ 여기서 “바로 화면 이동” 처리
    if (!fixedStoreId) {
      const nextPath = buildNextPath(location.pathname, next);
      navigate(`${nextPath}${location.search}`, { replace: true });
    }
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

        <div className={styles.storeContextHint}></div>

        {errorText ? (
          <div className={styles.storeContextError}>{errorText}</div>
        ) : null}
      </div>
    </div>
  );
}
