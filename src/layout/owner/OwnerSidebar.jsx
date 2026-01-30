// src/layout/owner/OwnerSidebar.jsx
import { NavLink } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import styles from "./ownerLayout.module.css";
import { loadActiveStoreId } from "../../components/owner/OwnerStoreContextBar.jsx";
import logoDark from "../../assets/logo-dark.png";
import logoLight from "../../assets/logo-light.png";

const STORAGE_KEY = "owner_sidebar_groups_v1";

const OwnerSidebar = () => {
  // store id가 없을 수 있습니다(첫 로그인/매장 미등록 등).
  // 없는 경우에는 매장 목록으로 유도해서 "없는 storeId로 호출 → 오류"를 막습니다.
  const storeId = loadActiveStoreId();

  const storeSpecific = (suffix) =>
    storeId ? `/owner/stores/${storeId}${suffix}` : `/owner/stores`;

  const linkClass = ({ isActive }) =>
    `${styles.navLink} ${isActive ? styles.navLinkActive : ""}`;

  const groups = useMemo(
    () => [
      {
        key: "ops",
        title: "운영",
        items: [
          { to: "/owner", label: "대시보드" },
          { to: storeSpecific("/orders"), label: "주문 관리" },
          { to: storeSpecific("/reviews"), label: "리뷰 관리" },
        ],
      },
      {
        key: "settlement",
        title: "정산",
        items: [
          { to: storeSpecific("/payments"), label: "결제 내역" },
          { to: storeSpecific("/transactions"), label: "정산 내역" },
        ],
      },
      {
        key: "store",
        title: "매장",
        items: [
          { to: "/owner/stores", label: "매장 목록" },
          { to: "/owner/stores/new", label: "매장 등록" },
          { to: storeSpecific("/edit"), label: "매장 관리" },
          { to: storeSpecific("/images"), label: "매장 이미지" },
        ],
      },
      {
        key: "menu",
        title: "메뉴",
        items: [
          { to: storeSpecific("/menus"), label: "메뉴 관리" },
          { to: storeSpecific("/menus/categories"), label: "카테고리 관리" },
          // 옵션 관리는 메뉴 선택이 필요하므로 store 기준 진입 후 페이지에서 메뉴를 선택
          { to: storeSpecific("/menus/options"), label: "옵션 관리" },
        ],
      },
    ],
    [storeId]
  );

  const [openMap, setOpenMap] = useState(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        // 기본: 운영/정산만 펼침
        return { ops: true, settlement: true, store: false, menu: false };
      }
      return JSON.parse(raw);
    } catch {
      return { ops: true, settlement: true, store: false, menu: false };
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(openMap));
    } catch {
      // ignore
    }
  }, [openMap]);

  const toggle = (key) => {
    setOpenMap((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <aside className={styles.sidebar}>
      <div>
        <NavLink to="/owner" className={styles.sidebarLogoLink} aria-label="대시보드로 이동">
          <div className={styles.sidebarLogoWrap} aria-label="Catch-a-Bite logo">
            <img
              className={`${styles.sidebarLogo} ${styles.sidebarLogoLight}`}
              src={logoLight}
              alt="Catch-a-Bite"
            />
            <img
              className={`${styles.sidebarLogo} ${styles.sidebarLogoDark}`}
              src={logoDark}
              alt="Catch-a-Bite"
            />
          </div>
        </NavLink>
          </div>

      <div className={styles.nav}>
        {groups.map((g) => {
          const isOpen = !!openMap[g.key];
          return (
            <div key={g.key} className={styles.navGroup}>
              <button
                type="button"
                className={styles.navGroupHeader}
                aria-expanded={isOpen}
                onClick={() => toggle(g.key)}
              >
                {g.title}
              </button>

              <div
                className={`${styles.navGroupLinks} ${
                  isOpen ? styles.navGroupLinksOpen : styles.navGroupLinksClosed
                }`}
              >
                {g.items.map((it) => (
                  <NavLink key={it.to} to={it.to} className={linkClass}>
                    <span className={styles.navLinkText}>{it.label}</span>
                  </NavLink>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.sidebarBottom}>
        <div className={styles.sidebarBottomHint}>Catch-A-Bite</div>
      </div>
    </aside>
  );
};

export default OwnerSidebar;
