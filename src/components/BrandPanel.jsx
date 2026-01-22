import styles from "../styles/auth.module.css";

export default function BrandPanel({ title }) {
  return (
    <div className={styles.brandPanel}>
      <div className={styles.brandText}>
        <span>Catch</span>
        <span>A</span>
        <span>Bite</span>
      </div>
      <div className={styles.brandTitle}>{title}</div>
    </div>
  );
}
