import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { loadActiveStoreId } from "../../components/owner/OwnerStoreContextBar.jsx";
import useRoleGuard from "../../hooks/useRoleGuard.js";
import styles from "../../styles/ownerPages.module.css";

const fallbackUser = { name: "Owner" };

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

  const [isOpen, setIsOpen] = useState(true);

  const go = (to) => () => navigate(to);

  const storeScoped = (path) => {
    if (!hasStore) return "/owner/stores";
    return path.replace(":storeId", String(storeId));
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
              onClick={() => setIsOpen(true)}
            >
              영업중
            </button>
            <button
              type="button"
              className={`${styles.switchBtn} ${!isOpen ? styles.switchOn : ""}`}
              onClick={() => setIsOpen(false)}
            >
              일시정지
            </button>
          </div>
          <div className={styles.cardHint}>상태 변경 API는 매장관리 화면에서 연동합니다.</div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardTitle}>조리 시간</div>
          <div className={styles.timeRow}>
            <div className={styles.timeValue}>30분</div>
            <button type="button" className={styles.primaryBtn}>
              조리시간 설정
            </button>
          </div>
          <div className={styles.cardHint}>주문 상세에서 조리시간을 조정할 수 있습니다.</div>
        </div>
      </div>

      
      {!hasStore && (
        <div className={styles.card} style={{ marginTop: 16 }}>
          <div className={styles.cardTitle}>매장 등록이 필요합니다</div>
          <div className={styles.cardHint}>처음 로그인하셨다면 먼저 매장을 등록하거나 목록에서 매장을 선택해 주세요.</div>
          <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
            <button type="button" className={styles.primaryBtn} onClick={go("/owner/stores/new")}>매장 등록</button>
            <button type="button" className={styles.outlineBtn} onClick={go("/owner/stores")}>매장 목록</button>
          </div>
        </div>
      )}
      <div className={styles.sectionTitle}>바로가기</div>
      <div className={styles.quickGrid}>
        <button type="button" className={styles.quickTile} onClick={go(storeScoped("/owner/stores/:storeId/reviews"))}>
          <div className={styles.quickLabel}>리뷰관리</div>
          <div className={styles.quickHint}>답글/문의 처리</div>
        </button>

        <button
          type="button"
          className={styles.quickTile}
          onClick={go(storeScoped("/owner/stores/:storeId/menus"))}
        >
          <div className={styles.quickLabel}>메뉴관리</div>
          <div className={styles.quickHint}>메뉴 등록/수정</div>
        </button>

        <button type="button" className={styles.quickTile} onClick={go(storeScoped("/owner/stores/:storeId/payments"))}>
          <div className={styles.quickLabel}>매출조회</div>
          <div className={styles.quickHint}>결제 내역</div>
        </button>

        <button
          type="button"
          className={styles.quickTile}
          onClick={go(storeScoped("/owner/stores/:storeId/edit"))}
        >
          <div className={styles.quickLabel}>가게관리</div>
          <div className={styles.quickHint}>정보/상태 관리</div>
        </button>

        <button
          type="button"
          className={styles.quickTile}
          onClick={go(storeScoped("/owner/stores/:storeId/orders"))}
        >
          <div className={styles.quickLabel}>주문관리</div>
          <div className={styles.quickHint}>신규/완료</div>
        </button>
      </div>
    </div>
  );
}
