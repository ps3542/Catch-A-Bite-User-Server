import { useEffect, useState } from "react";
import { getMe } from "./services/authService";
import AppRouter from "./routes/AppRouter.jsx";
import styles from "./styles/auth.module.css";

const initialAuth = {
  isAuthenticated: false,
  accountType: null,
  roleName: null,
  loading: true,
};

export default function App() {
  const [authState, setAuthState] = useState(initialAuth);

  const refreshMe = async () => {
    try {
      const response = await getMe();
      setAuthState({
        isAuthenticated: true,
        accountType: response.data?.accountType ?? null,
        roleName: response.data?.roleName ?? null,
        loading: false,
      });
      return response.data;
    } catch (error) {
      setAuthState({
        isAuthenticated: false,
        accountType: null,
        roleName: null,
        loading: false,
      });
      throw error;
    }
  };

  useEffect(() => {
    refreshMe().catch(() => {});
  }, []);

  const statusText = authState.loading
    ? "세션 확인 중..."
    : authState.isAuthenticated
      ? `로그인됨: ${authState.accountType ?? authState.roleName ?? "-"}`
      : "비로그인";

  return (
    <>
      <div className={styles.statusBadge}>{statusText}</div>
      <AppRouter onAuthRefresh={refreshMe} />
    </>
  );
}
