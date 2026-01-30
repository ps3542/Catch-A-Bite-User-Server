import styles from "../styles/auth.module.css";
import logoDark from "../assets/logo-dark.png";

export default function BrandPanel({ title }) {
  return (
    <div className={styles.brandPanel}>
      <img className={styles.brandLogo} src={logoDark} alt="Catch-a-Bite" />
      <div className={styles.brandTitle}>{title}</div>
    </div>
  );
}
