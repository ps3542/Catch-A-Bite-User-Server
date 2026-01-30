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
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await ownerMenuCategoryService.list(sid);
      const data = unwrap(res);
      setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setItems([]);
      setError(e?.response?.data?.message || "카테고리 목록 조회 실패");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!Number.isFinite(sid)) return;
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sid]);

  const startEdit = (c) => {
    const id = Number(c.menuCategoryId ?? c.id);
    setEditingId(id);
    setEditingName(String(c.menuCategoryName ?? c.name ?? ""));
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingName("");
  };

  const add = async () => {
    const v = name.trim();
    if (!v) return;
    setError("");
    try {
      await ownerMenuCategoryService.create(sid, { menuCategoryName: v });
      setName("");
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "카테고리 추가 실패");
    }
  };

  const saveEdit = async () => {
    const v = editingName.trim();
    if (!editingId || !v) return;
    setError("");
    try {
      await ownerMenuCategoryService.update(sid, editingId, { menuCategoryName: v });
      cancelEdit();
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "카테고리 수정 실패");
    }
  };

  const remove = async (c) => {
    const id = Number(c.menuCategoryId ?? c.id);
    if (!id) return;
    if (!confirm("카테고리를 삭제하시겠습니까? (연결된 메뉴가 있으면 실패할 수 있습니다)")) return;

    setError("");
    try {
      await ownerMenuCategoryService.remove(sid, id);
      if (editingId === id) cancelEdit();
      await load();
    } catch (e) {
      setError(e?.response?.data?.message || "카테고리 삭제 실패");
    }
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
      {loading ? <div className={styles.muted}>불러오는 중...</div> : null}

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
        {!loading && items.length === 0 ? (
          <div className={styles.muted}>카테고리가 없습니다.</div>
        ) : (
          items.map((c) => {
            const id = Number(c.menuCategoryId ?? c.id);
            const isEditing = editingId === id;

            return (
              <div key={id} className={styles.item}>
                <div className={styles.meta} style={{ flex: 1 }}>
                  {isEditing ? (
                    <input
                      className={styles.input}
                      value={editingName}
                      onChange={(e) => setEditingName(e.target.value)}
                      placeholder="카테고리명"
                    />
                  ) : (
                    <div className={styles.name}>{c.menuCategoryName ?? c.name}</div>
                  )}
                </div>

                {isEditing ? (
                  <>
                    <button type="button" className={styles.blackBtn} onClick={saveEdit}>
                      저장
                    </button>
                    <button type="button" className={styles.outlineBtn} onClick={cancelEdit}>
                      취소
                    </button>
                  </>
                ) : (
                  <>
                    <button type="button" className={styles.outlineBtn} onClick={() => startEdit(c)}>
                      수정
                    </button>
                    <button type="button" className={styles.dangerBtn} onClick={() => remove(c)}>
                      삭제
                    </button>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
