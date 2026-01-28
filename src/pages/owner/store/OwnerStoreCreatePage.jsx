import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { saveActiveStoreId } from "../../../components/owner/OwnerStoreContextBar.jsx";
import { ownerStoreService } from "../../../api/owner/ownerStoreService.js";
import { unwrap } from "../../../utils/apiResponse.js";
import styles from "../../../styles/ownerForm.module.css";

export default function OwnerStoreCreatePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    storeName: "",
    storePhone: "",
    storeAddress: "",
    storeCategory: "",
    storeIntro: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const storeCategories = [
    { value: "korean", label: "한식" },
    { value: "japanese", label: "일식" },
    { value: "chinese", label: "중식" },
    { value: "western", label: "양식" },
    { value: "snack", label: "분식" },
    { value: "chicken", label: "치킨" },
    { value: "pizza", label: "피자" },
    { value: "cafe_dessert", label: "카페/디저트" },
    { value: "late_night", label: "야식" },
    { value: "etc", label: "기타" },
  ];

  const onlyDigits = (v) => String(v ?? "").replace(/\D/g, "");

  const onChange = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const validate = () => {
    if (!form.storeName.trim()) return "매장명은 필수입니다.";
    if (!form.storePhone.trim()) return "전화번호는 필수입니다.";
    if (!form.storeAddress.trim()) return "주소는 필수입니다.";
    if (!form.storeCategory.trim()) return "카테고리는 필수입니다.";
    return null;
  };


  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }
    setSaving(true);
    try {
      const res = await ownerStoreService.create(form);
      const created = unwrap(res);
      const storeId = created?.storeId ?? created?.id;
      if (storeId) saveActiveStoreId(storeId);
      navigate(storeId ? `/owner/stores/${storeId}/edit` : "/owner/stores");
    } catch (err) {
      setError(err?.response?.data?.message || "매장 등록에 실패했습니다.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.wrap}>
      <h2 className={styles.title}>매장 등록</h2>
      <form className={styles.form} onSubmit={onSubmit}>
        <label className={styles.label}>
          매장명
          <input className={styles.input} value={form.storeName} onChange={onChange("storeName")} />
        </label>

        <label className={styles.label}>
          전화번호
          <input
            className={styles.input}
            inputMode="numeric"
            placeholder="숫자만 입력"
            value={form.storePhone}
            onChange={(e) => setForm((p) => ({ ...p, storePhone: onlyDigits(e.target.value).slice(0, 10) }))}
          />
        </label>

        <label className={styles.label}>
          카테고리
          <select
            className={styles.select}
            value={form.storeCategory}
            onChange={onChange("storeCategory")}
          >
            <option value="" disabled>
              카테고리를 선택해 주세요
            </option>
            {storeCategories.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.label}>
          주소
          <input
            className={styles.input}
            value={form.storeAddress}
            onChange={onChange("storeAddress")}
          />
        </label>

        <label className={styles.label}>
          소개
          <textarea
            className={styles.textarea}
            rows="4"
            value={form.storeIntro}
            onChange={onChange("storeIntro")}
          />
        </label>

        {error ? <div className={styles.error}>{error}</div> : null}

        <div className={styles.actions}>
          <button type="button" className={styles.outlineBtn} onClick={() => navigate(-1)}>
            취소
          </button>
          <button type="submit" className={styles.primaryBtn} disabled={saving}>
            {saving ? "등록 중..." : "등록"}
          </button>
        </div>
      </form>
    </div>
  );
}
