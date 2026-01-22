export const PASSWORD_POLICY_MESSAGE =
  "비밀번호는 8자 이상이며, 영문·숫자·특수문자를 포함해야 합니다.";

export const PASSWORD_POLICY_REGEX = new RegExp(
  "^(?=.*[a-zA-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+\\-=[\\]{};':\"\\\\|,.<>/?]).{8,}$"
);

const SPECIAL_CHAR_REGEX = new RegExp(
  "[!@#$%^&*()_+\\-=[\\]{};':\"\\\\|,.<>/?]"
);

export const getPasswordPolicyChecks = (password) => {
  const value = password ?? "";

  return {
    length: value.length >= 8,
    letter: /[a-zA-Z]/.test(value),
    number: /\d/.test(value),
    special: SPECIAL_CHAR_REGEX.test(value),
  };
};

export const isPasswordPolicyMet = (password) =>
  PASSWORD_POLICY_REGEX.test(password ?? "");
