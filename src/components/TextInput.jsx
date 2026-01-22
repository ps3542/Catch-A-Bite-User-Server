import { useId } from "react";
import InlineMessage from "./InlineMessage.jsx";
import styles from "../styles/auth.module.css";

export default function TextInput({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  name,
  message,
  messageTone,
  disabled,
  inputMode,
  autoComplete,
  rightElement,
}) {
  const inputId = useId();

  return (
    <div className={styles.field}>
      {label ? (
        <label className={styles.label} htmlFor={inputId}>
          {label}
        </label>
      ) : null}
      <div className={styles.inputRow}>
        <input
          id={inputId}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={styles.input}
          disabled={disabled}
          inputMode={inputMode}
          autoComplete={autoComplete}
        />
        {rightElement ? (
          <div className={styles.inputAction}>{rightElement}</div>
        ) : null}
      </div>
      <InlineMessage tone={messageTone}>{message}</InlineMessage>
    </div>
  );
}
