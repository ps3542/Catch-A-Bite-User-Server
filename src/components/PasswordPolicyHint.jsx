import {
  PASSWORD_POLICY_MESSAGE,
  getPasswordPolicyChecks,
} from "../utils/passwordPolicy";
import styles from "../styles/auth.module.css";

const POLICY_ITEMS = [
  { key: "length", label: "8자 이상" },
  { key: "letter", label: "영문 포함" },
  { key: "number", label: "숫자 포함" },
  { key: "special", label: "특수문자 포함" },
];

export default function PasswordPolicyHint({ password }) {
  const checks = getPasswordPolicyChecks(password);

  return (
    <div className={styles.passwordPolicy}>
      <div className={styles.passwordPolicyMessage}>
        {PASSWORD_POLICY_MESSAGE}
      </div>
      <ul className={styles.passwordPolicyList}>
        {POLICY_ITEMS.map((item) => {
          const isMet = checks[item.key];
          return (
            <li
              key={item.key}
              className={
                isMet
                  ? `${styles.passwordPolicyItem} ${styles.passwordPolicyItemOk}`
                  : styles.passwordPolicyItem
              }
            >
              <span className={styles.passwordPolicyIcon} aria-hidden="true">
                {isMet ? "✓" : "•"}
              </span>
              <span>{item.label}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
