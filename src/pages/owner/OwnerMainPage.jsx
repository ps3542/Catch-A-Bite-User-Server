import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadActiveStoreId } from "../../components/owner/OwnerStoreContextBar.jsx";
import useRoleGuard from "../../hooks/useRoleGuard.js";
import { ownerStoreService } from "../../api/owner/ownerStoreService.js";
import styles from "../../styles/ownerPages.module.css";

const fallbackUser = { name: "Owner" };

const PAUSE_OPTIONS = [
  { label: "30분", value: 30 },
  { label: "1시간", value: 60 },
  { label: "1시간 30분", value: 90 },
  { label: "2시간", value: 120 },
];

const pauseKey = (storeId) => `owner_store_pause_until_${storeId}`;

const formatRemain = (ms) => {
  if (ms <= 0) return "0분";
  const totalMin = Math.ceil(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h <= 0) return `${totalMin}분`;
  if (m === 0) return `${h}시간`;
  return `${h}시간 ${m}분`;
};

export default function OwnerMainPage() {
  const navigate = useNavigate();
  const { user } = useRoleGuard("OWNER", fallbackUser);

  const storeId = loadActiveStoreId();
  const hasStore = storeId !== null && storeId !== undefined && String(storeId).trim() !== "";

  const todayText = useMemo(
    () =>
      new Date().toLocaleDateString("ko-KR", {
        month: "long",
        day: "numeric",
        weekday: "short",
      }),
    []
  );

  const [isOpen, setIsOpen] = useState(true); // UI 표시용
  const [loadingStatus, setLoadingStatus] = useState(false);

  // 일시정지 선택 UI
  const [showPausePicker, setShowPausePicker] = useState(false);
  const [pauseMin, setPauseMin] = useState(30);
  const [pauseRemainText, setPauseRemainText] = useState("");

  const go = (to) => () => navigate(to);

  const storeScoped = (path) => {
    if (!hasStore) return "/owner/stores";
    return path.replace(":storeId", String(storeId));
  };

  const readPauseUntil = () => {
    if (!hasStore) return null;
    const raw = window.localStorage.getItem(pauseKey(storeId));
    const ts = Number(raw);
    if (!Number.isFinite(ts) || ts <= 0) return null;
    return ts;
  };

  const clearPauseUntil = () => {
    if (!hasStore) return;
    window.localStorage.removeItem(pauseKey(storeId));
  };

  const writePauseUntil = (minutes) => {
    if (!hasStore) return;
    const until = Date.now() + minutes * 60 * 1000;
    window.localStorage.setItem(pauseKey(storeId), String(until));
  };

  // 백엔드 현재 상태 동기화
  useEffect(() => {
    const run = async () => {
      if (!hasStore) {
        setIsOpen(true);
        setShowPausePicker(false);
        setPauseRemainText("");
        return;
      }
      try {
        const res = await ownerStoreService.get(storeId);
        const data = ownerStoreService._pickData(res);
        const v = (data?.storeOpenStatus ?? "").toString().toLowerCase(); // "open" | "close"
        setIsOpen(v !== "close");
      } catch (e) {
        // 실패 시에는 UI 상태를 유지합니다.
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]);

  // 일시정지 남은 시간 표시 + 만료 시 자동 복구(open 시도)
  useEffect(() => {
    if (!hasStore) return;

    const tick = async () => {
      const until = readPauseUntil();
      if (!until) {
        setPauseRemainText("");
        return;
      }

      const remain = until - Date.now();
      if (remain <= 0) {
        clearPauseUntil();
        setPauseRemainText("");
        // 자동 open 시도
        try {
          await ownerStoreService.changeStatus(storeId, { storeOpenStatus: "open" });
          setIsOpen(true);
        } catch (e) {
          // 실패해도 일단 로컬 타이머는 종료 처리
        }
        return;
      }

      setPauseRemainText(formatRemain(remain));
    };

    tick();
    const t = window.setInterval(tick, 10000);
    return () => window.clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]);

  const applyOpen = async () => {
    if (!hasStore) {
      navigate("/owner/stores");
      return;
    }
    setLoadingStatus(true);
    try {
      await ownerStoreService.changeStatus(storeId, { storeOpenStatus: "open" });
      clearPauseUntil();
      setPauseRemainText("");
      setIsOpen(true);
      setShowPausePicker(false);
    } finally {
      setLoadingStatus(false);
    }
  };

  const openPausePicker = () => {
    if (!hasStore) {
      navigate("/owner/stores");
      return;
    }
    setShowPausePicker(true);
    setIsOpen(false); // UI상 선택 중에도 일시정지 탭이 선택된 것처럼 보이게
  };

  const applyPause = async () => {
    if (!hasStore) {
      navigate("/owner/stores");
      return;
    }
    setLoadingStatus(true);
    try {
      // 백엔드에는 duration이 없어서, status는 close로 변경하고 duration은 프론트에서만 관리합니다.
      await ownerStoreService.changeStatus(storeId, { storeOpenStatus: "close" });
      writePauseUntil(pauseMin);
      setIsOpen(false);
      setShowPausePicker(false);
      setPauseRemainText(formatRemain(pauseMin * 60 * 1000));
    } finally {
      setLoadingStatus(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.topRow}>
        <div className={styles.titleBlock}>
          <div className={styles.pageTitle}>마이페이지</div>
          <div className={styles.subTitle}>{todayText}</div>
        </div>

        <div className={styles.profileBlock}>
          <div className={styles.profileIcon}></div>
          <div className={styles.profileName}>{user?.name ?? "사장님"}</div>
        </div>
      </div>

      <div className={styles.cardGrid}>
        <div className={styles.card}>
          <div className={styles.cardTitle}>영업 상태</div>

          <div className={styles.switchRow}>
            <button
              type="button"
              className={`${styles.switchBtn} ${isOpen ? styles.switchOn : ""}`}
              onClick={applyOpen}
              disabled={loadingStatus}
            >
              영업중
            </button>

            <button
              type="button"
              className={`${styles.switchBtn} ${!isOpen ? styles.switchOn : ""}`}
              onClick={openPausePicker}
              disabled={loadingStatus}
            >
              일시정지
            </button>
          </div>

          {showPausePicker ? (
            <div className={styles.modalOverlay} role="dialog" aria-modal="true">
              <div className={styles.modal}>
                <div className={styles.modalTop}>
                  <div className={styles.modalTitle}>일시정지 시간을 선택해 주세요</div>
                  <button
                    type="button"
                    className={styles.modalClose}
                    onClick={() => setShowPausePicker(false)}
                    aria-label="닫기"
                    disabled={loadingStatus}
                  >
                    ✕
                  </button>
                </div>

                <div className={styles.optionGrid}>
                  {PAUSE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      className={`${styles.optionBtn} ${pauseMin === opt.value ? styles.optionBtnActive : ""}`}
                      onClick={() => setPauseMin(opt.value)}
                      disabled={loadingStatus}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>

                <div className={styles.modalActions}>
                  <button type="button" className={styles.outlineBtn} onClick={() => setShowPausePicker(false)} disabled={loadingStatus}>
                    취소
                  </button>
                  <button type="button" className={styles.primaryBtn} onClick={applyPause} disabled={loadingStatus}>
                    적용
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          <div className={styles.cardHint}>
            {!hasStore ? "매장을 선택/등록해 주세요." : null}
            {hasStore && pauseRemainText ? `일시정지 종료까지 ${pauseRemainText} 남음` : null}
          </div>
        </div>

        {/* ✅ 조리시간 카드 제거(요청사항) */}
      </div>

      {!hasStore && (
        <div className={styles.card} style={{ marginTop: 16 }}>
          <div className={styles.cardTitle}>매장 등록이 필요합니다</div>
          <div className={styles.cardHint}>
            처음 로그인하셨다면 먼저 매장을 등록하거나 목록에서 매장을 선택해 주세요.
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button type="button" className={styles.primaryBtn} onClick={go("/owner/stores/new")}>
              매장 등록
            </button>
            <button type="button" className={styles.outlineBtn} onClick={go("/owner/stores")}>
              매장 목록
            </button>
          </div>
        </div>
      )}

      <div className={styles.sectionTitle}>바로가기</div>
      <div className={styles.quickGrid}>
        <button type="button" className={styles.quickTile} onClick={go(storeScoped("/owner/stores/:storeId/reviews"))}>
          <div className={styles.quickLabel}>리뷰관리</div>
          <div className={styles.quickHint}>답글/문의 처리</div>
        </button>

        <button type="button" className={styles.quickTile} onClick={go(storeScoped("/owner/stores/:storeId/menus"))}>
          <div className={styles.quickLabel}>메뉴관리</div>
          <div className={styles.quickHint}>메뉴 등록/수정</div>
        </button>

        <button type="button" className={styles.quickTile} onClick={go(storeScoped("/owner/stores/:storeId/payments"))}>
          <div className={styles.quickLabel}>매출조회</div>
          <div className={styles.quickHint}>결제 내역</div>
        </button>

        <button type="button" className={styles.quickTile} onClick={go(storeScoped("/owner/stores/:storeId/edit"))}>
          <div className={styles.quickLabel}>가게관리</div>
          <div className={styles.quickHint}>정보/상태 관리</div>
        </button>

        <button type="button" className={styles.quickTile} onClick={go(storeScoped("/owner/stores/:storeId/orders"))}>
          <div className={styles.quickLabel}>주문관리</div>
          <div className={styles.quickHint}>주문 확인/처리</div>
        </button>



        <button type="button" className={styles.quickTile} onClick={go(storeScoped("/owner/stores/:storeId/transactions"))}>
          <div className={styles.quickLabel}>정산내역</div>
          <div className={styles.quickHint}>정산 진행 확인</div>
        </button>
      </div>
    </div>
  );
}
