import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getMe } from "../../services/authService";
import styles from "../../styles/mypage.module.css";

const menuItems = [
  { label: "개인정보 수정", path: "/user/profile/edit", active: true },
  { label: "주소 관리", path: "/user/addresses", active: true },
  { label: "즐겨찾기" },
  { label: "결제관리" },
  { label: "진행중인 이벤트" },
  { label: "설정" },
  { label: "공지사항" },
];

export default function MyPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const fetchMe = async () => {
      try {
        // API: GET /api/v1/auth/me
        const response = await getMe();
        if (!active) {
          return;
        }
        setProfile(response.data || {});
      } catch (error) {
        const status = error?.response?.status;
        if (status === 401 || status === 403) {
          navigate("/select", { replace: true });
          return;
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    fetchMe();
    return () => {
      active = false;
    };
  }, [navigate]);

  const nickname = profile?.nickname || profile?.name || "사용자";
  const loginId = profile?.loginId || profile?.loginKey || "";

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.topBar}>
          <button
            className={styles.iconButton}
            type="button"
            onClick={() => navigate(-1)}
            aria-label="뒤로가기"
          >
            ←
          </button>
          <span className={styles.topBarTitle}>마이페이지</span>
          <div className={styles.rightIcons}>
            <button className={styles.iconButton} type="button" aria-label="알림">
              🔔
            </button>
            <button className={styles.iconButton} type="button" aria-label="검색">
              🔍
            </button>
          </div>
        </header>

        <section className={styles.profileBlock}>
          {loading ? (
            <p className={styles.loadingText}>사용자 정보를 불러오는 중...</p>
          ) : (
            <>
              <div className={styles.nickname}>{nickname}</div>
              <div className={styles.loginId}>{loginId}</div>
            </>
          )}
        </section>

        <section className={styles.menuList}>
          {menuItems.map((item) => {
            if (item.active && item.path) {
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`${styles.menuButton} ${styles.menuLink}`}
                >
                  <span className={styles.bullet} />
                  {item.label}
                </Link>
              );
            }
            return (
              <button
                key={item.label}
                type="button"
                className={styles.menuButton}
                onClick={() => alert("준비중입니다")}
              >
                <span className={styles.bullet} />
                {item.label}
              </button>
            );
          })}
        </section>
      </div>

      <nav className={styles.bottomNav}>
        <Link to="/user/main" className={styles.navItem}>
          <span className={styles.navIcon}>🏠</span>
          홈
        </Link>
        <button
          type="button"
          className={styles.navItem}
          onClick={() => alert("준비중입니다")}
        >
          <span className={styles.navIcon}>🔍</span>
          검색
        </button>
        <button
          type="button"
          className={styles.navItem}
          onClick={() => alert("준비중입니다")}
        >
          <span className={styles.navIcon}>♡</span>
          즐겨찾기
        </button>
        <button
          type="button"
          className={styles.navItem}
          onClick={() => alert("준비중입니다")}
        >
          <span className={styles.navIcon}>🧾</span>
          주문내역
        </button>
        <Link to="/user/mypage" className={styles.navItem}>
          <span className={styles.navIcon}>👤</span>
          마이
        </Link>
      </nav>
    </div>
  );
}
