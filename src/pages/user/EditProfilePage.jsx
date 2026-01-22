import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMe } from "../../services/authService";
import { updateMyProfile } from "../../services/userService";
import styles from "../../styles/mypage.module.css";

export default function EditProfilePage() {
  const navigate = useNavigate();
  const [nickname, setNickname] = useState("");
  const [status, setStatus] = useState(null);
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
        setNickname(response.data?.nickname || "");
      } catch (error) {
        const statusCode = error?.response?.status;
        if (statusCode === 401 || statusCode === 403) {
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus(null);

    try {
      // API: PATCH /api/v1/users/me/profile
      await updateMyProfile(nickname);
      navigate("/user/mypage");
    } catch (error) {
      setStatus(error?.message || "수정에 실패했습니다.");
    }
  };

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
          <span className={styles.topBarTitle}>개인정보 수정</span>
          <div className={styles.rightIcons} />
        </header>

        <section className={styles.pageBody}>
          <h2 className={styles.sectionTitle}>닉네임 변경</h2>
          {loading ? (
            <p className={styles.loadingText}>정보를 불러오는 중...</p>
          ) : (
            <form className={styles.form} onSubmit={handleSubmit}>
              <input
                className={styles.input}
                value={nickname}
                onChange={(event) => setNickname(event.target.value)}
                placeholder="새 닉네임"
              />
              {status ? <p className={styles.errorText}>{status}</p> : null}
              <button className={styles.primaryButton} type="submit">
                저장
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  );
}
