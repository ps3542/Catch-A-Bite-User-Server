import authStyles from "../styles/auth.module.css";
import styles from "../styles/dashboard.module.css";

export default function DashboardLayout({
  roleLabel,
  userName,
  dateText,
  quickActions,
  summaryCards,
  activities,
  notices,
  isLoading,
}) {
  const displayName = userName || "게스트";

  return (
    <div className={authStyles.page}>
      <div className={`${authStyles.panel} ${styles.dashboardPanel}`}>
        <header className={styles.header}>
          <div>
            <div className={styles.roleTag}>{roleLabel}</div>
            <div className={styles.greeting}>
              안녕하세요, <span className={styles.greetingName}>{displayName}</span>님
            </div>
            <div className={styles.subText}>
              오늘도 안정적인 운영을 위해 준비했습니다.
            </div>
            {isLoading ? (
              <div className={styles.loadingText}>정보를 불러오는 중...</div>
            ) : null}
          </div>
          <div className={styles.dateBox}>{dateText}</div>
        </header>

        <div className={styles.grid}>
          <section className={styles.section}>
            <div className={styles.sectionTitle}>요약</div>
            <div className={styles.summaryGrid}>
              {summaryCards.map((card) => (
                <div key={card.title} className={styles.card}>
                  <div className={styles.cardLabel}>{card.title}</div>
                  <div className={styles.cardValue}>{card.value}</div>
                  <div className={styles.cardMeta}>{card.meta}</div>
                </div>
              ))}
            </div>

            <div className={styles.sectionTitle}>최근 활동</div>
            <div className={styles.list}>
              {activities.map((item) => (
                <div key={item.title} className={styles.listItem}>
                  <div>
                    <div className={styles.listTitle}>{item.title}</div>
                    <div className={styles.listMeta}>{item.time}</div>
                  </div>
                  <div className={styles.statusTag}>{item.status}</div>
                </div>
              ))}
            </div>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionTitle}>빠른 액션</div>
            <div className={styles.quickActions}>
              {quickActions.map((action) => (
                <button
                  type="button"
                  key={action.label}
                  className={styles.actionButton}
                >
                  {action.label}
                  <span className={styles.actionHint}>{action.hint}</span>
                </button>
              ))}
            </div>

            <div className={styles.sectionTitle}>공지/알림</div>
            <div className={styles.noticeCard}>
              {notices.map((notice) => (
                <div key={notice.title}>
                  <div className={styles.noticeTitle}>{notice.title}</div>
                  <div className={styles.noticeDetail}>{notice.detail}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
