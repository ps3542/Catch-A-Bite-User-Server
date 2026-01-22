import styles from "../styles/auth.module.css";

export default function InlineMessage({ tone = "info", children }) {
  if (!children) {
    return null;
  }

  const toneClass =
    tone === "error"
      ? styles.messageError
      : tone === "success"
        ? styles.messageSuccess
        : styles.messageInfo;

  return <div className={`${styles.message} ${toneClass}`}>{children}</div>;
}
