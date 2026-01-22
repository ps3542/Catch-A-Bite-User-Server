import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkRiderEmailExists, signupRider } from "../services/authService";
import BrandPanel from "../components/BrandPanel.jsx";
import InlineMessage from "../components/InlineMessage.jsx";
import PasswordPolicyHint from "../components/PasswordPolicyHint.jsx";
import SelectInput from "../components/SelectInput.jsx";
import TextInput from "../components/TextInput.jsx";
import styles from "../styles/auth.module.css";
import {
  isPasswordPolicyMet,
  PASSWORD_POLICY_MESSAGE,
} from "../utils/passwordPolicy";

const initialForm = {
  loginId: "",
  password: "",
  passwordConfirm: "",
  name: "",
  mobile: "",
  vehicleType: "",
  licenseNumber: "",
  vehicleNumber: "",
};

const vehicleOptions = [
  { value: "WALKING", label: "도보" },
  { value: "BICYCLE", label: "자전거" },
  { value: "MOTORBIKE", label: "오토바이" },
  { value: "CAR", label: "자동차" },
];

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

const buildPayload = (form) => {
  const needsVehicleInfo =
    form.vehicleType === "MOTORBIKE" || form.vehicleType === "CAR";

  return {
    email: form.loginId.trim(),
    password: form.password,
    confirmPassword: form.passwordConfirm,
    name: form.name.trim(),
    mobile: form.mobile.trim(),
    vehicleType: form.vehicleType,
    licenseNumber: needsVehicleInfo ? form.licenseNumber.trim() : null,
    vehicleNumber: needsVehicleInfo ? form.vehicleNumber.trim() : null,
  };
};

export default function SignupRiderPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);
  const [emailStatus, setEmailStatus] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  const needsVehicleInfo =
    form.vehicleType === "MOTORBIKE" || form.vehicleType === "CAR";

  const handleChange = (field) => (event) => {
    const value = event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
    setStatus(null);
    if (field === "loginId") {
      setEmailStatus(null);
    }
  };

  const handleCheckEmail = async () => {
    if (!form.loginId.trim()) {
      setErrors((prev) => ({
        ...prev,
        loginId: "이메일을 입력해주세요.",
      }));
      return;
    }

    setIsCheckingEmail(true);
    setEmailStatus(null);

    try {
      const response = await checkRiderEmailExists(form.loginId.trim());
      const existsValue = resolveExistsValue(response.data);
      if (existsValue === null) {
        setEmailStatus({
          tone: "error",
          message: "이메일 중복확인 응답을 확인해주세요.",
        });
        return;
      }
      if (existsValue) {
        setEmailStatus({
          tone: "error",
          message: "이미 사용 중인 이메일입니다.",
        });
      } else {
        setEmailStatus({
          tone: "success",
          message: "사용 가능한 이메일입니다.",
        });
      }
    } catch (error) {
      setEmailStatus({
        tone: "error",
        message: "이메일 중복확인에 실패했습니다.",
      });
    } finally {
      setIsCheckingEmail(false);
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
    if (!form.name.trim()) {
      nextErrors.name = "이름을 입력해주세요.";
    }
    if (!form.mobile.trim()) {
      nextErrors.mobile = "휴대폰 번호를 입력해주세요.";
    }
    if (!form.vehicleType) {
      nextErrors.vehicleType = "이동수단을 선택해주세요.";
    }
    if (needsVehicleInfo && !form.licenseNumber.trim()) {
      nextErrors.licenseNumber = "면허번호를 입력해주세요.";
    }
    if (needsVehicleInfo && !form.vehicleNumber.trim()) {
      nextErrors.vehicleNumber = "차량번호를 입력해주세요.";
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
      await signupRider(buildPayload(form));
      navigate("/rider/login");
    } catch (error) {
      setStatus({
        tone: "error",
        message: "회원가입에 실패했습니다. 잠시 후 다시 시도해주세요.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const emailMessage = errors.loginId || emailStatus?.message;
  const emailTone = errors.loginId ? "error" : emailStatus?.tone;
  const isPasswordValid = isPasswordPolicyMet(form.password);
  const passwordMismatch =
    form.passwordConfirm && form.password !== form.passwordConfirm;
  const passwordConfirmMessage =
    errors.passwordConfirm ||
    (passwordMismatch ? "비밀번호가 일치하지 않습니다." : "");

  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <BrandPanel title="회원가입" />
        <div className={styles.formPanel}>
          <form className={styles.form} onSubmit={handleSubmit}>
            <TextInput
              label="이메일"
              value={form.loginId}
              onChange={handleChange("loginId")}
              name="loginId"
              autoComplete="email"
              message={emailMessage}
              messageTone={emailTone}
              rightElement={
                <button
                  type="button"
                  className={styles.secondaryButton}
                  onClick={handleCheckEmail}
                  disabled={isCheckingEmail}
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
            <SelectInput
              label="이동수단"
              value={form.vehicleType}
              onChange={handleChange("vehicleType")}
              name="vehicleType"
              options={vehicleOptions}
              placeholder="선택"
              message={errors.vehicleType}
              messageTone="error"
            />
            {needsVehicleInfo ? (
              <>
                <TextInput
                  label="면허번호"
                  value={form.licenseNumber}
                  onChange={handleChange("licenseNumber")}
                  name="licenseNumber"
                  message={errors.licenseNumber}
                  messageTone="error"
                />
                <TextInput
                  label="차량번호"
                  value={form.vehicleNumber}
                  onChange={handleChange("vehicleNumber")}
                  name="vehicleNumber"
                  message={errors.vehicleNumber}
                  messageTone="error"
                />
              </>
            ) : null}
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
