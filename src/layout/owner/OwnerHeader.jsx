// src/layout/owner/OwnerHeader.jsx
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

  return (
    <header className={styles.header}>
      <div className={styles.headerTitle}>{title}</div>
      <div className={styles.headerRight}>
        <button type="button" className={styles.logoutBtn}>
          로그아웃
        </button>
      </div>
    </header>
  );
};

export default OwnerHeader;
