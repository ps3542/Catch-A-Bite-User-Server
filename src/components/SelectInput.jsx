import { useId } from "react";
import InlineMessage from "./InlineMessage.jsx";
import styles from "../styles/auth.module.css";

export default function SelectInput({
  label,
  value,
  onChange,
  name,
  options,
  placeholder,
  message,
  messageTone,
  disabled,
}) {
  const selectId = useId();

  return (
    <div className={styles.field}>
      {label ? (
        <label className={styles.label} htmlFor={selectId}>
          {label}
        </label>
      ) : null}
      <select
        id={selectId}
        name={name}
        value={value}
        onChange={onChange}
        className={styles.select}
        disabled={disabled}
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <InlineMessage tone={messageTone}>{message}</InlineMessage>
    </div>
  );
}
