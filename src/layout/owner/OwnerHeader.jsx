// src/layout/owner/OwnerHeader.jsx
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/authService"; // 경로 확인: layout/owner 기준
import styles from "./ownerLayout.module.css";

const titleByPath = (pathname) => {
  const p = pathname || "";
  if (p.startsWith("/owner/main")) return "대시보드";
  if (p.startsWith("/owner/stores") && p.includes("/orders")) return "주문 관리";
  if (p.startsWith("/owner/stores") && p.includes("/menus")) return "메뉴 관리";
  if (p.startsWith("/owner/reviews")) return "리뷰 관리";
  if (p.startsWith("/owner/payments")) return "결제 내역";
  if (p.startsWith("/owner/transactions")) return "정산 내역";
  if (p.startsWith("/owner/stores")) return "매장 관리";
  return "사장님 페이지";
};

const OwnerHeader = ({ pathname }) => {
  const title = titleByPath(pathname);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authService.logout(); // ✅ 세션 끊기
    } catch (e) {
      // 로그아웃 실패해도 화면 이동은 하도록 처리(UX)
    } finally {
      // ✅ 로컬스토리지 정리(선택매장/일시정지 등)
      try {
        window.localStorage.removeItem("owner_active_store_id");
      } catch {}

      // ✅ 로그인 페이지로
      navigate("/owner/login", { replace: true });
    }
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerTitle}>{title}</div>
      <div className={styles.headerRight}>
        <button type="button" className={styles.logoutBtn} onClick={handleLogout}>
          로그아웃
        </button>
      </div>
    </header>
  );
};

export default OwnerHeader;
