// src/layout/owner/OwnerSidebar.jsx
import { NavLink } from "react-router-dom";
import styles from "./ownerLayout.module.css";
import { loadActiveStoreId } from "../../components/owner/OwnerStoreContextBar.jsx";

const icon = (t) => <span className={styles.navIcon}>{t}</span>;

const OwnerSidebar = () => {
  // store id가 없을 수 있습니다(첫 로그인/매장 미등록 등).
  // 없는 경우에는 매장 목록으로 유도해서 "없는 storeId로 호출 → 오류"를 막습니다.
  const storeId = loadActiveStoreId();

  const storeSpecific = (suffix) =>
    storeId ? `/owner/stores/${storeId}${suffix}` : `/owner/stores`;

  const linkClass = ({ isActive }) =>
    `${styles.navLink} ${isActive ? styles.active : ""}`;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.navSection}>
        <NavLink to="/owner" className={linkClass}>
          {icon("")} 대시보드
        </NavLink>

        {/* 매장: 피그마에 없더라도 실제 필요한 동선 */}
        <NavLink to="/owner/stores" className={linkClass}>
          {icon("")} 매장 목록
        </NavLink>
        <NavLink to="/owner/stores/new" className={linkClass}>
          {icon("")} 매장 등록
        </NavLink>
      </div>

      <div className={styles.navSection}>
        <NavLink to={storeSpecific("/orders")} className={linkClass}>
          {icon("")} 주문 관리
        </NavLink>
        <NavLink to="/owner/deliveries" className={linkClass}>
          {icon("")} 배달 관리
        </NavLink>
        <NavLink to={storeSpecific("/reviews")} className={linkClass}>
          {icon("")} 리뷰 관리
        </NavLink>
        <NavLink to={storeSpecific("/payments")} className={linkClass}>
          {icon("")} 결제 내역
        </NavLink>
        <NavLink to={storeSpecific("/transactions")} className={linkClass}>
          {icon("")} 정산 내역
        </NavLink>
      </div>

      <div className={styles.navSection}>
        <NavLink to={storeSpecific("/menus")} className={linkClass}>
          {icon("️")} 메뉴 관리
        </NavLink>
        <NavLink to={storeSpecific("/menus/categories")} className={linkClass}>
          {icon("️")} 카테고리 관리
        </NavLink>
        {/* 옵션 관리는 메뉴 선택이 필요하므로 store 기준 진입 후 페이지에서 메뉴를 선택 */}
        <NavLink to={storeSpecific("/menus/options")} className={linkClass}>
          {icon("")} 옵션 관리
        </NavLink>
      </div>

      <div className={styles.navSection}>
        <NavLink to={storeSpecific("/edit")} className={linkClass}>
          {icon("")} 매장 관리
        </NavLink>
        <NavLink to={storeSpecific("/images")} className={linkClass}>
          {icon("️")} 매장 이미지
        </NavLink>
      </div>
    </aside>
  );
};

export default OwnerSidebar;
