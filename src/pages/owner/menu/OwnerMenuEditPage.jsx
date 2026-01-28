import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import InlineMessage from "../../../components/InlineMessage.jsx";
import { ownerMenuService } from "../../../api/owner/ownerMenuService.js";
import { ownerMenuCategoryService } from "../../../api/owner/ownerMenuCategoryService.js";
import { unwrap } from "../../../utils/apiResponse.js";
import styles from "../../../styles/ownerMenuEdit.module.css";

export default function OwnerMenuEditPage() {
  const { storeId, menuId } = useParams();
  const sid = useMemo(() => Number(storeId), [storeId]);
  const mid = useMemo(() => (menuId ? Number(menuId) : null), [menuId]);

  const [sp] = useSearchParams();
  const nav = useNavigate();

  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    menuCategoryId: "",
    menuName: "",
    menuDescription: "",
    menuPrice: "",
    menuIsAvailable: true,
  });

  const isEdit = !!mid;

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));
  const setBool = (k) => (v) => setForm((p) => ({ ...p, [k]: v }));

  const loadCategories = async () => {
    try {
      const res = await ownerMenuCategoryService.list(sid);
      const data = unwrap(res);
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      setCategories([]);
    }
  };

  const loadMenu = async () => {
    // 단건 조회 API가 없어서 list → id 매칭으로 채웁니다.
    try {
      const res = await ownerMenuService.list(sid);
      const list = unwrap(res);
      const found = Array.isArray(list) ? list.find((m) => Number(m.menuId ?? m.id) === mid) : null;

      if (!found) {
        setStatus({ tone: "error", message: "메뉴 정보를 찾을 수 없습니다." });
        return;
      }

      setForm({
        menuCategoryId: String(found.menuCategoryId ?? found.categoryId ?? ""),
        menuName: found.menuName ?? found.name ?? "",
        menuDescription: found.menuDescription ?? found.description ?? "",
        menuPrice: String(found.menuPrice ?? found.price ?? ""),
        menuIsAvailable: found.menuIsAvailable ?? true,
      });
    } catch (e) {
      setStatus({ tone: "error", message: e?.message || "메뉴 조회에 실패했습니다." });
    }
  };

  useEffect(() => {
    if (!Number.isFinite(sid)) return;
    loadCategories();
  }, [sid]);

  useEffect(() => {
    if (!isEdit) {
      const cid = sp.get("categoryId");
      if (cid) setForm((p) => ({ ...p, menuCategoryId: String(cid) }));
      return;
    }
    loadMenu();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, mid]);

  const submit = async () => {
    setLoading(true);
    setStatus(null);

    try {
      const payload = {
        storeId: sid,
        menuCategoryId: form.menuCategoryId ? Number(form.menuCategoryId) : null,
        menuName: form.menuName.trim(),
        menuDescription: form.menuDescription.trim(),
        menuPrice: form.menuPrice === "" ? null : Number(form.menuPrice),
        menuIsAvailable: !!form.menuIsAvailable,
      };

      if (!payload.menuName) {
        setStatus({ tone: "error", message: "메뉴명을 입력해 주세요." });
        return;
      }
      if (!payload.menuPrice || Number.isNaN(payload.menuPrice)) {
        setStatus({ tone: "error", message: "가격을 올바르게 입력해 주세요." });
        return;
      }

      if (isEdit) await ownerMenuService.update(sid, mid, payload);
      else await ownerMenuService.create(sid, payload);

      nav(`/owner/stores/${sid}/menus`);
    } catch (e) {
      setStatus({ tone: "error", message: e?.message || "저장에 실패했습니다." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.head}>
        <h2 className={styles.title}>{isEdit ? "메뉴 수정" : "메뉴 등록"}</h2>

        <div className={styles.actions}>
          <button type="button" className={styles.ghostBtn} onClick={() => nav(-1)} disabled={loading}>
            취소
          </button>
          <button type="button" className={styles.primaryBtn} onClick={submit} disabled={loading}>
            저장
          </button>
        </div>
      </div>

      {status && <InlineMessage tone={status.tone} message={status.message} />}

      <div className={styles.form}>
        <div className={styles.field}>
          <label className={styles.label}>카테고리</label>
          <select className={styles.select} value={form.menuCategoryId} onChange={set("menuCategoryId")}>
            <option value="">선택</option>
            {categories.map((c) => (
              <option key={c.menuCategoryId ?? c.id} value={c.menuCategoryId ?? c.id}>
                {c.menuCategoryName ?? c.name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>메뉴명</label>
          <input className={styles.input} value={form.menuName} onChange={set("menuName")} placeholder="메뉴명을 입력하세요" />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>가격</label>
          <input className={styles.input} value={form.menuPrice} onChange={set("menuPrice")} inputMode="numeric" placeholder="예) 11900" />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>설명</label>
          <textarea className={styles.textarea} rows={5} value={form.menuDescription} onChange={set("menuDescription")} placeholder="메뉴 설명을 입력하세요" />
        </div>

        <div className={styles.fieldInline}>
          <label className={styles.label}>판매 상태</label>
          <div className={styles.toggle}>
            <button type="button" className={`${styles.toggleBtn} ${form.menuIsAvailable ? styles.toggleOn : ""}`} onClick={() => setBool("menuIsAvailable")(true)}>
              판매중
            </button>
            <button type="button" className={`${styles.toggleBtn} ${!form.menuIsAvailable ? styles.toggleOn : ""}`} onClick={() => setBool("menuIsAvailable")(false)}>
              판매중지
            </button>
          </div>
        </div>

        <div className={styles.bottom}>
          <button type="button" className={styles.primaryBtnWide} onClick={submit} disabled={loading}>
            {isEdit ? "수정 완료" : "등록 완료"}
          </button>
        </div>
      </div>
    </div>
  );
}
