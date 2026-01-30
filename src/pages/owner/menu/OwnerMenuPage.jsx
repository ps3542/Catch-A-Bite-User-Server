import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ownerMenuService } from "../../../api/owner/ownerMenuService.js";
import { unwrap } from "../../../utils/apiResponse.js";
import styles from "../../../styles/ownerMenu.module.css";

export default function OwnerMenuPage() {
  const { storeId } = useParams();
  const sid = useMemo(() => Number(storeId), [storeId]);
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await ownerMenuService.list(sid);
      setItems(unwrap(res) ?? []);
    } catch (e) {
      setError(e?.response?.data?.message || "메뉴 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!Number.isFinite(sid)) return;
    load();
  }, [sid]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((m) => String(m.menuName ?? m.name ?? "").toLowerCase().includes(q));
  }, [items, query]);

  const onToggleAvailability = async (menuId, currentIsAvailable) => {
    try {
      await ownerMenuService.changeAvailability(sid, menuId, !currentIsAvailable);
      // optimistic: 바로 로컬 갱신
      setItems((prev) =>
        prev.map((m) => {
          const id = Number(m.menuId ?? m.id);
          if (id !== menuId) return m;
          return { ...m, menuIsAvailable: !currentIsAvailable };
        })
      );
    } catch (e) {
      setError(e?.response?.data?.message || "상태 변경에 실패했습니다.");
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <div className={styles.titleGroup}>
          <div className={styles.burger} aria-hidden="true">
            ☰
          </div>
          <h2 className={styles.title}>메뉴관리</h2>
        </div>

        <div className={styles.headerActions}>
          <button
            type="button"
            className={styles.primaryBtn}
            onClick={() => navigate(`/owner/stores/${sid}/menus/new`)}
          >
            메뉴 등록하기
          </button>
        </div>
      </div>

      <div className={styles.searchRow}>
        <input
          className={styles.searchInput}
          placeholder="메뉴 검색"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {error ? <div className={styles.error}>{error}</div> : null}
      {loading ? <div className={styles.muted}>불러오는 중...</div> : null}

      <div className={styles.list}>
        {!loading && filtered.length === 0 ? (
          <div className={styles.muted}>등록된 메뉴가 없습니다.</div>
        ) : (
          filtered.map((m) => {
            const menuId = Number(m.menuId ?? m.id);
            const isAvailable = Boolean(m.menuIsAvailable ?? true);
            const price = Number(m.menuPrice ?? m.price ?? 0);

            return (
              <div key={menuId} className={styles.card}>
                <div className={styles.thumb}>
                  {(() => {
                    const thumbUrl = m.menuThumbnailUrl ?? m.menuImageUrl;
                    if (!thumbUrl) return <div className={styles.thumbFallback} />;
                    return <img className={styles.thumbImg} src={thumbUrl} alt={m.menuName ?? m.name} />;
                  })()}
                </div>

                <div className={styles.meta}>
                  <div className={styles.name}>{m.menuName ?? m.name}</div>
                  <div className={styles.price}>{price.toLocaleString("ko-KR")}원</div>
                </div>

                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.actionBtn}
                    onClick={() => onToggleAvailability(menuId, isAvailable)}
                    title="판매 가능 여부 변경"
                  >
                    {isAvailable ? "품절" : "판매중"}
                  </button>

                  {/* 백엔드 스펙에 '숨김' 개념이 없음: 디자인 유지 + 비활성 */}
                  <button
                    type="button"
                    className={`${styles.actionBtn} ${styles.disabledBtn}`}
                    disabled
                    title="현재 사용할 수 없습니다."
                  >
                    숨김
                  </button>

                  {/* 백엔드 스펙에 '노출기간' 개념이 없음: 디자인 유지 + 비활성 */}
                  <button
                    type="button"
                    className={`${styles.actionBtn} ${styles.disabledBtn}`}
                    disabled
                    title="현재 사용할 수 없습니다."
                  >
                    노출기간
                  </button>

                  <button
                    type="button"
                    className={styles.editBtn}
                    onClick={() => navigate(`/owner/stores/${sid}/menus/${menuId}/edit`)}
                  >
                    수정하기 <span className={styles.chev}>&gt;</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className={styles.footerRow}>
        <button
          type="button"
          className={styles.outlineBtn}
          onClick={() => navigate(`/owner/stores/${sid}/menus/categories`)}
        >
          카테고리 관리
        </button>
        <button
          type="button"
          className={styles.outlineBtn}
          onClick={() => navigate(`/owner/stores/${sid}/menus/options`)}
        >
          옵션 관리
        </button>
      </div>
    </div>
  );
}
