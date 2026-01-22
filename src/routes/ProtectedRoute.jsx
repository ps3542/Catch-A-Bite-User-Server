import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { getMe } from "../services/authService";
import { ACCOUNT_TYPES, ROLES } from "../constants/roles.js";
import styles from "../styles/mypage.module.css";

const ALLOWED_ROLE_NAMES = {
  USER: [ROLES.USER],
  OWNER: [ROLES.OWNER, "ROLE_STORE_OWNER"],
  RIDER: [ROLES.RIDER],
};

export default function ProtectedRoute({ expectedRole = "USER", redirectTo = "/select" }) {
  const location = useLocation();
  const [state, setState] = useState({ loading: true, allowed: false });

  useEffect(() => {
    let active = true;

    const checkSession = async () => {
      try {
        // API: GET /api/v1/auth/me (session-based auth check)
        const response = await getMe();
        const data = response?.data || {};
        const accountType = data.accountType;
        const roleName = data.roleName;
        const allowedRoles = ALLOWED_ROLE_NAMES[expectedRole] || [];
        const allowed =
          !expectedRole ||
          accountType === (ACCOUNT_TYPES[expectedRole] || expectedRole) ||
          (roleName && allowedRoles.includes(roleName));

        if (active) {
          setState({ loading: false, allowed });
        }
      } catch (error) {
        if (active) {
          setState({ loading: false, allowed: false });
        }
      }
    };

    checkSession();
    return () => {
      active = false;
    };
  }, [expectedRole]);

  if (state.loading) {
    return (
      <div className={styles.page}>
        <div className={styles.container}>
          <p className={styles.loadingText}>세션 확인 중...</p>
        </div>
      </div>
    );
  }

  if (!state.allowed) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  return <Outlet />;
}
