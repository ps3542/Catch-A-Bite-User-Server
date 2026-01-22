import { Link } from "react-router-dom";
import BrandPanel from "../components/BrandPanel.jsx";
import styles from "../styles/auth.module.css";

const roles = [
  {
    title: "유저로 시작하기",
    description: "일반 주문/배달 서비스를 이용합니다.",
    path: "/user/login",
  },
  {
    title: "사업자로 시작하기",
    description: "매장 운영자를 위한 시작입니다.",
    path: "/owner/login",
  },
  {
    title: "라이더로 시작하기",
    description: "배달 파트너 전용 시작입니다.",
    path: "/rider/login",
  },
];

export default function RoleSelectPage() {
  return (
    <div className={styles.page}>
      <div className={styles.panel}>
        <BrandPanel title="시작하기" />
        <div className={styles.formPanel}>
          <div className={styles.roleList}>
            <div className={styles.roleIntro}>역할을 선택해주세요.</div>
            {roles.map((role) => (
              <Link key={role.path} className={styles.roleButton} to={role.path}>
                <span className={styles.roleTitle}>{role.title}</span>
                <span className={styles.roleDesc}>{role.description}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
