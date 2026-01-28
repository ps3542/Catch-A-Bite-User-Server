import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ownerMenuCategoryService } from "../../../api/owner/ownerMenuCategoryService.js";
import { unwrap } from "../../../utils/apiResponse.js";
import styles from "../../../styles/ownerMenu.module.css";

export default function OwnerMenuCategoryPage() {
  const { storeId } = useParams();
  const sid = useMemo(() => Number(storeId), [storeId]);
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const load = async () => {
    setError("");
    try {
      const res = await ownerMenuCategoryService.list(sid);
      setItems(unwrap(res) ?? []);
    } catch (e) {
      setError(e?.response?.data?.message || "카테고리 목록 조회 실패");
    }
  };

  useEffect(() => {
    if (!Number.isFinite(sid)) return;
    load();
  }, [sid]);

  const add = async () => {
    if (!name.trim()) return;
    await ownerMenuCategoryService.create(sid, { menuCategoryName: name.trim() });
    setName("");
    load();
  };

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <h2 className={styles.title}>카테고리 관리</h2>
        <button type="button" className={styles.primaryBtn} onClick={() => navigate(-1)}>
          뒤로
        </button>
      </div>

      {error ? <div className={styles.error}>{error}</div> : null}

      <div className={styles.inlineForm}>
        <input
          className={styles.input}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="카테고리명"
        />
        <button type="button" className={styles.blackBtn} onClick={add}>
          추가
        </button>
      </div>

      <div className={styles.list}>
        {items.length === 0 ? (
          <div className={styles.muted}>카테고리가 없습니다.</div>
        ) : (
          items.map((c) => (
            <div key={c.menuCategoryId ?? c.id} className={styles.item}>
              <div className={styles.meta}>
                <div className={styles.name}>{c.menuCategoryName ?? c.name}</div>
              </div>
              <button
                type="button"
                className={styles.dangerBtn}
                onClick={async () => {
                  await ownerMenuCategoryService.remove(sid, c.menuCategoryId ?? c.id);
                  load();
                }}
              >
                삭제
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
