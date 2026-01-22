import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkLoginIdExists, signupUser } from "../services/authService";
import BrandPanel from "../components/BrandPanel.jsx";
import InlineMessage from "../components/InlineMessage.jsx";
import PasswordPolicyHint from "../components/PasswordPolicyHint.jsx";
import TextInput from "../components/TextInput.jsx";
import styles from "../styles/auth.module.css";
import {
  isPasswordPolicyMet,
  PASSWORD_POLICY_MESSAGE,
} from "../utils/passwordPolicy";

const ROLE_CONFIG = {
  USER: {
    title: "회원가입",
  },
};

const initialForm = {
  loginId: "",
  password: "",
  passwordConfirm: "",
  nickname: "",
  name: "",
  mobile: "",
  requiredTermsAccepted: false,
  marketingTermsAccepted: false,
};

const resolveExistsValue = (data) => {
  if (typeof data === "boolean") {
    return data;
  }
  if (data && typeof data.data === "boolean") {
    return data.data;
  }
  if (data && typeof data.exists === "boolean") {
    return data.exists;
  }
  if (data && typeof data.isDuplicate === "boolean") {
    return data.isDuplicate;
  }
  if (data && typeof data.available === "boolean") {
    return !data.available;
  }
  return null;
};

const buildPayload = (form) => ({
  loginId: form.loginId.trim(),
  mobile: form.mobile.trim(),
  password: form.password,
  confirmPassword: form.passwordConfirm,
  nickname: form.nickname.trim(),
  name: form.name.trim(),
  requiredTermsAccepted: form.requiredTermsAccepted,
  marketingTermsAccepted: form.marketingTermsAccepted,
});

export default function SignupUserPage() {
  const navigate = useNavigate();
  const [activeRole] = useState("USER");
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [loginIdStatus, setLoginIdStatus] = useState(null);
  const [status, setStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setStatus(null);
    if (field === "loginId") {
      setLoginIdStatus(null);
    }
  };

  const handleCheckboxChange = (field) => (event) => {
    const checked = event.target.checked;
    setForm((prev) => ({ ...prev, [field]: checked }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setStatus(null);
  };

  const handleCheckLoginId = async () => {
    if (!form.loginId.trim()) {
      setErrors((prev) => ({
        ...prev,
        loginId: "이메일을 입력해주세요.",
      }));
      return;
    }

    setIsChecking(true);
    setLoginIdStatus(null);

    try {
      const response = await checkLoginIdExists(form.loginId.trim());
      const existsValue = resolveExistsValue(response.data);
      if (existsValue === null) {
        setLoginIdStatus({
          tone: "error",
          message: "아이디 중복확인 응답을 확인해주세요.",
        });
        return;
      }
      if (existsValue) {
        setLoginIdStatus({
          tone: "error",
          message: "이미 사용 중인 이메일입니다.",
        });
      } else {
        setLoginIdStatus({
          tone: "success",
          message: "사용 가능한 이메일입니다.",
        });
      }
    } catch (error) {
      setLoginIdStatus({
        tone: "error",
        message: "아이디 중복확인에 실패했습니다.",
      });
    } finally {
      setIsChecking(false);
    }
  };

  const validate = () => {
    const nextErrors = {};

    if (!form.loginId.trim()) {
      nextErrors.loginId = "이메일을 입력해주세요.";
    }
    if (!form.password) {
      nextErrors.password = "비밀번호를 입력해주세요.";
    } else if (!isPasswordPolicyMet(form.password)) {
      nextErrors.password = PASSWORD_POLICY_MESSAGE;
    }
    if (!form.passwordConfirm) {
      nextErrors.passwordConfirm = "비밀번호 재확인을 입력해주세요.";
    }
    if (form.password && form.passwordConfirm && form.password !== form.passwordConfirm) {
      nextErrors.passwordConfirm = "비밀번호가 일치하지 않습니다.";
    }
    if (!form.nickname.trim()) {
      nextErrors.nickname = "닉네임을 입력해주세요.";
    }
    if (!form.name.trim()) {
      nextErrors.name = "이름을 입력해주세요.";
    }
    if (!form.mobile.trim()) {
      nextErrors.mobile = "휴대폰 번호를 입력해주세요.";
    }
    if (!form.requiredTermsAccepted) {
      nextErrors.requiredTermsAccepted = "필수 약관에 동의해주세요.";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setStatus(null);

    try {
      await signupUser(buildPayload(form));
      navigate("/user/login");
    } catch (error) {
      setStatus({
        tone: "error",
        message: "회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const loginIdMessage = errors.loginId || loginIdStatus?.message;
  const loginIdTone = errors.loginId ? "error" : loginIdStatus?.tone;
  const isPasswordValid = isPasswordPolicyMet(form.password);
  const passwordMismatch =
    form.passwordConfirm && form.password !== form.passwordConfirm;
  const passwordConfirmMessage =
    errors.passwordConfirm ||
    (passwordMismatch ? "비밀번호가 일치하지 않습니다." : "");

  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <BrandPanel title={ROLE_CONFIG[activeRole].title} />
        <div className={styles.formPanel}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <TextInput
              label="이메일"
              value={form.loginId}
              onChange={handleChange("loginId")}
              name="loginId"
              autoComplete="email"
              message={loginIdMessage}
              messageTone={loginIdTone}
              rightElement={
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={handleCheckLoginId}
                  disabled={isChecking}
                >
                  중복확인
                </button>
              }
            />
            <TextInput
              label="비밀번호"
              type="password"
              value={form.password}
              onChange={handleChange("password")}
              name="password"
              autoComplete="new-password"
              message={errors.password}
              messageTone="error"
            />
            <PasswordPolicyHint password={form.password} />
            <TextInput
              label="비밀번호 재확인"
              type="password"
              value={form.passwordConfirm}
              onChange={handleChange("passwordConfirm")}
              name="passwordConfirm"
              autoComplete="new-password"
              message={passwordConfirmMessage}
              messageTone="error"
            />
            <TextInput
              label="닉네임"
              value={form.nickname}
              onChange={handleChange("nickname")}
              name="nickname"
              message={errors.nickname}
              messageTone="error"
            />
            <TextInput
              label="이름"
              value={form.name}
              onChange={handleChange("name")}
              name="name"
              autoComplete="name"
              message={errors.name}
              messageTone="error"
            />
            <TextInput
              label="휴대폰 번호"
              value={form.mobile}
              onChange={handleChange("mobile")}
              name="mobile"
              inputMode="numeric"
              message={errors.mobile}
              messageTone="error"
            />
            <div className={styles.checkboxGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={form.requiredTermsAccepted}
                  onChange={handleCheckboxChange("requiredTermsAccepted")}
                />
                필수 약관에 동의합니다.
              </label>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={form.marketingTermsAccepted}
                  onChange={handleCheckboxChange("marketingTermsAccepted")}
                />
                마케팅 수신 동의(선택)
              </label>
              <InlineMessage tone="error">
                {errors.requiredTermsAccepted}
              </InlineMessage>
            </div>
            <button
              type="submit"
              className={styles.primaryButton}
              disabled={isSubmitting || !isPasswordValid}
            >
              회원가입
            </button>
            <InlineMessage tone={status?.tone}>{status?.message}</InlineMessage>
          </form>
        </div>
      </div>
    </div>
  );
}
