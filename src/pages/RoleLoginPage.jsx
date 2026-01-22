import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMe, login } from "../services/authService";
import BrandPanel from "../components/BrandPanel.jsx";
import InlineMessage from "../components/InlineMessage.jsx";
import TextInput from "../components/TextInput.jsx";
import { ACCOUNT_TYPES, ROLES } from "../constants/roles.js";
import { MAIN_ROUTES } from "../constants/routes.js";
import styles from "../styles/auth.module.css";

const initialForm = {
  loginId: "",
  password: "",
};

const signupRoutes = {
  USER: "/user/signup",
  OWNER: "/owner/signup",
  RIDER: "/rider/signup",
};

export default function RoleLoginPage({ role, onAuthRefresh }) {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const signupPath = useMemo(
    () => signupRoutes[role] ?? "/select",
    [role]
  );

  const handleChange = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setStatus(null);
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.loginId.trim()) {
      nextErrors.loginId = "ID를 입력해주세요.";
    }
    if (!form.password) {
      nextErrors.password = "비밀번호를 입력해주세요.";
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const resolveAccountInfo = async () => {
    if (onAuthRefresh) {
      const meData = await onAuthRefresh();
      return {
        accountType: meData?.accountType,
        roleName: meData?.roleName,
      };
    }
    const response = await getMe();
    return {
      accountType: response.data?.accountType,
      roleName: response.data?.roleName,
    };
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    try {
      try {
        await login({
          loginKey: form.loginId.trim(),
          password: form.password,
          accountType: ACCOUNT_TYPES[role] ?? role,
        });
      } catch (error) {
        const statusCode = error?.response?.status;
        const message =
          statusCode === 401 || statusCode === 403
            ? "아이디 또는 비밀번호가 올바르지 않습니다."
            : "로그인에 실패했습니다. 잠시 후 다시 시도해주세요.";
        setStatus({ tone: "error", message });
        return;
      }

      try {
        const { accountType, roleName } = await resolveAccountInfo();
        const routeKey = accountType || roleName;
        const targetRoute = routeKey ? MAIN_ROUTES[routeKey] : null;

        if (!targetRoute) {
          setStatus({
            tone: "error",
            message: "권한 정보를 확인할 수 없습니다.",
          });
          return;
        }

        if (accountType && role && ACCOUNT_TYPES[role] !== accountType) {
          console.warn("Account type mismatch:", { expected: role, accountType });
        }

        const expectedRoleNames = [];
        if (role && ROLES[role]) {
          expectedRoleNames.push(ROLES[role]);
        }
        if (role === "OWNER") {
          expectedRoleNames.push("ROLE_STORE_OWNER");
        }
        if (
          expectedRoleNames.length > 0 &&
          roleName &&
          !expectedRoleNames.includes(roleName)
        ) {
          console.warn("Role mismatch:", { expectedRoleNames, roleName });
        }

        navigate(targetRoute);
      } catch (error) {
        setStatus({
          tone: "error",
          message: "세션 정보를 확인할 수 없습니다.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <BrandPanel title="로그인" />
        <div className={styles.formPanel}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <TextInput
              placeholder="ID"
              value={form.loginId}
              onChange={handleChange("loginId")}
              name="loginId"
              autoComplete="username"
              message={errors.loginId}
              messageTone="error"
            />
            <TextInput
              placeholder="PW"
              type="password"
              value={form.password}
              onChange={handleChange("password")}
              name="password"
              autoComplete="current-password"
              message={errors.password}
              messageTone="error"
            />
            <button
              type="submit"
              className={styles.primaryButton}
              disabled={isSubmitting}
            >
              로그인
            </button>
            <InlineMessage tone={status?.tone}>{status?.message}</InlineMessage>
            <div className={styles.helperText}>
              아직 회원이 아니신가요?{" "}
              <Link className={styles.link} to={signupPath}>
                회원가입
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
