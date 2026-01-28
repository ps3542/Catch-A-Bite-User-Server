// src/layout/owner/OwnerLayout.jsx
import { Outlet, useLocation } from "react-router-dom";
import OwnerSidebar from "./OwnerSidebar";
import OwnerHeader from "./OwnerHeader";
import OwnerStoreContextBar from "../../components/owner/OwnerStoreContextBar.jsx";
import styles from "./ownerLayout.module.css";

const OwnerLayout = () => {
  const location = useLocation();

  return (
    <div className={styles.shell}>
      <OwnerSidebar />

      <div className={styles.main}>
        <OwnerHeader pathname={location.pathname} />

        {/* 로그인 백엔드 전/후 모두 동작: storeId는 localStorage 기반 */}
        <div className={styles.contextBarWrap}>
          <OwnerStoreContextBar />
        </div>

        <div className={styles.content}>
          <div className={styles.page}>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OwnerLayout;
