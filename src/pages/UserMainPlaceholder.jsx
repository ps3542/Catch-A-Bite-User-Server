import BrandPanel from "../components/BrandPanel.jsx";
import styles from "../styles/auth.module.css";

export default function UserMainPlaceholder() {
  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <BrandPanel title="메인" />
        <div className={`${styles.formPanel} ${styles.placeholderPanel}`}>
          <div className={styles.placeholderText}>USER MAIN (TEMP)</div>
        </div>
      </div>
    </div>
  );
}
