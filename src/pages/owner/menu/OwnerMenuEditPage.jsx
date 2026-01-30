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

  // 이미지(기존)
  const [existingImages, setExistingImages] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);

  // ===== 메뉴 이미지: 매장관리처럼(모달 → 즉시 저장) =====
  const [imgModalOpen, setImgModalOpen] = useState(false);
  const [imgUrl, setImgUrl] = useState("");

  // 등록 화면에선 menuId가 없어서 즉시 저장 불가 → “추가 예정”으로만 관리
  const [draftUrls, setDraftUrls] = useState([]);

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

  const loadImages = async () => {
    if (!isEdit || !Number.isFinite(sid) || !mid) return;
    setLoadingImages(true);
    try {
      const res = await ownerMenuService.listImages(sid, mid);
      const data = unwrap(res);
      setExistingImages(Array.isArray(data) ? data : []);
    } catch {
      setExistingImages([]);
    } finally {
      setLoadingImages(false);
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
    loadImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, mid]);

  const validate = (payload) => {
    if (!payload.menuName) return "메뉴명을 입력해 주세요.";
    if (!payload.menuCategoryId) return "카테고리를 선택해 주세요.";
    if (!Number.isFinite(payload.menuPrice) || payload.menuPrice < 0) return "가격을 올바르게 입력해 주세요.";
    return null;
  };

  // ===== 이미지 모달(매장관리 방식) =====
  const openImageModal = () => {
    setImgUrl("");
    setImgModalOpen(true);
  };

  const closeImageModal = () => {
    setImgModalOpen(false);
    setImgUrl("");
  };

  const preloadImage = (url) =>
    new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => reject(new Error("load_failed"));
      img.src = url;
    });

  const addImageByUrlLikeStore = async () => {
    const url = String(imgUrl ?? "").trim();

    if (!url) {
      setStatus({ tone: "error", message: "이미지 URL을 입력해 주세요." });
      return;
    }

    // URL 형식 체크
    try {
      const u = new URL(url);
      if (u.protocol !== "http:" && u.protocol !== "https:") {
        setStatus({ tone: "error", message: "http/https URL만 입력해 주세요." });
        return;
      }
    } catch {
      setStatus({ tone: "error", message: "올바른 URL 형식이 아닙니다." });
      return;
    }

    // 미리보기 가능한 이미지인지 확인(매장관리처럼 “바로 뜨게”)
    try {
      await preloadImage(url);
    } catch {
      setStatus({ tone: "error", message: "이미지로 로드되지 않는 URL입니다. 원본 이미지 파일 URL을 넣어 주세요." });
      return;
    }

    // ✅ 수정 화면: 즉시 서버 저장(매장관리 방식)
    if (isEdit && Number.isFinite(sid) && mid) {
      setStatus(null);
      try {
        const hasMain = existingImages.some((x) => !!x.menuImageIsMain);
        const menuImageIsMain = !hasMain; // 첫 이미지면 대표로

        const res = await ownerMenuService.addImageByUrl(sid, mid, {
          menuImageUrl: url,
          menuImageIsMain,
        });

        const created = unwrap(res);
        if (created) {
          setExistingImages((prev) => [created, ...prev]);
        } else {
          // 응답 바디가 없으면 안전하게 reload
          await loadImages();
        }

        closeImageModal();
        setStatus({ tone: "success", message: "이미지가 추가되었습니다." });
      } catch (e) {
        setStatus({ tone: "error", message: e?.response?.data?.message || "이미지 추가 실패" });
      }
      return;
    }

    // ✅ 등록 화면: menuId 없어서 즉시 저장 불가 → 추가 예정으로만
    setDraftUrls((prev) => (prev.includes(url) ? prev : [url, ...prev]));
    closeImageModal();
    setStatus({ tone: "success", message: "추가 예정 이미지에 등록되었습니다. 저장 시 서버에 등록됩니다." });
  };

  const removeDraftUrl = (idx) => {
    setDraftUrls((prev) => prev.filter((_, i) => i !== idx));
  };

  const submit = async () => {
    setLoading(true);
    setStatus(null);

    try {
      const payload = {
        menuCategoryId: form.menuCategoryId ? Number(form.menuCategoryId) : null,
        menuName: form.menuName.trim(),
        menuDescription: form.menuDescription.trim(),
        menuPrice: form.menuPrice === "" ? NaN : Number(form.menuPrice),
        menuIsAvailable: !!form.menuIsAvailable,
      };

      const msg = validate(payload);
      if (msg) {
        setStatus({ tone: "error", message: msg });
        return;
      }

      // 등록
      if (!isEdit) {
        const res = await ownerMenuService.create(sid, payload);
        const created = unwrap(res);
        const createdMenuId = Number(created?.menuId ?? created?.id);

        // 등록 화면에서만: draftUrls를 저장 시 등록
        if (draftUrls.length > 0 && Number.isFinite(createdMenuId)) {
          await ownerMenuService.addImagesByUrl(sid, createdMenuId, draftUrls, true);
        }

        nav(`/owner/stores/${sid}/menus`);
        return;
      }

      // 수정
      await ownerMenuService.update(sid, mid, payload);

      // 수정 화면은 이미지가 “즉시 저장”이라 submit에서 이미지 업로드/등록 안 함
      await loadMenu();
      await loadImages();
      setStatus({ tone: "success", message: "저장되었습니다." });
    } catch (e) {
      setStatus({ tone: "error", message: e?.response?.data?.message || e?.message || "저장에 실패했습니다." });
    } finally {
      setLoading(false);
    }
  };

  const onSetMain = async (img) => {
    if (!isEdit || !mid) return;
    try {
      await ownerMenuService.setMainImage(sid, mid, img.menuImageId);
      await loadImages();
    } catch (e) {
      setStatus({ tone: "error", message: e?.response?.data?.message || "대표 이미지 변경 실패" });
    }
  };

  const onDeleteImage = async (img) => {
    if (!isEdit || !mid) return;
    if (!confirm("이미지를 삭제하시겠습니까?")) return;
    try {
      await ownerMenuService.deleteImage(sid, mid, img.menuImageId);
      await loadImages();
    } catch (e) {
      setStatus({ tone: "error", message: e?.response?.data?.message || "이미지 삭제 실패" });
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
            <button
              type="button"
              className={`${styles.toggleBtn} ${form.menuIsAvailable ? styles.toggleOn : ""}`}
              onClick={() => setBool("menuIsAvailable")(true)}
            >
              판매중
            </button>
            <button
              type="button"
              className={`${styles.toggleBtn} ${!form.menuIsAvailable ? styles.toggleOn : ""}`}
              onClick={() => setBool("menuIsAvailable")(false)}
            >
              판매중지
            </button>
          </div>
        </div>

        {/* ===== 메뉴 이미지(매장관리처럼: 모달 추가 → 즉시 저장) ===== */}
        <div className={styles.field}>
          <label className={styles.label}>메뉴 이미지</label>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button type="button" className={styles.ghostBtn} onClick={openImageModal}>
              이미지 URL 추가
            </button>
            <span style={{ fontSize: 13, opacity: 0.75 }}>
              {isEdit ? "추가하면 즉시 등록됩니다." : "메뉴 저장 후 등록됩니다."}
            </span>
          </div>

          {/* 등록 화면에서만: 추가 예정 목록 */}
          {!isEdit && draftUrls.length > 0 ? (
            <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ fontWeight: 900, fontSize: 13 }}>추가 예정 이미지</div>
              {draftUrls.map((url, idx) => (
                <div key={`${url}-${idx}`} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div style={{ width: 64, height: 64, borderRadius: 10, overflow: "hidden", background: "#f3f4f6" }}>
                    <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>

                  <div
                    style={{
                      flex: 1,
                      fontSize: 13,
                      opacity: 0.85,
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    title={url}
                  >
                    {url}
                  </div>

                  <button type="button" className={styles.ghostBtn} onClick={() => removeDraftUrl(idx)}>
                    삭제
                  </button>
                </div>
              ))}
              <div style={{ marginTop: 4, fontSize: 12, opacity: 0.65 }}>* 저장 버튼을 누르면 위 URL이 서버에 등록됩니다.</div>
            </div>
          ) : null}

          {/* 수정 화면: 기존 이미지(즉시 등록 결과가 바로 여기에 쌓임) */}
          {isEdit ? (
            <div style={{ marginTop: 12 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{ fontWeight: 700 }}>기존 이미지</div>
                <button type="button" className={styles.ghostBtn} onClick={loadImages} disabled={loadingImages}>
                  새로고침
                </button>
              </div>

              {loadingImages ? <div style={{ marginTop: 8, opacity: 0.7 }}>불러오는 중...</div> : null}
              {!loadingImages && existingImages.length === 0 ? (
                <div style={{ marginTop: 8, opacity: 0.7 }}>등록된 이미지가 없습니다.</div>
              ) : (
                <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 10 }}>
                  {existingImages.map((img) => (
                    <div key={img.menuImageId} style={{ display: "flex", gap: 10, alignItems: "center" }}>
                      <div style={{ width: 64, height: 64, borderRadius: 10, overflow: "hidden", background: "#f3f4f6" }}>
                        {img.menuImageUrl ? (
                          <img src={img.menuImageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        ) : null}
                      </div>
                      <div
                        style={{
                          flex: 1,
                          fontSize: 13,
                          opacity: 0.85,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={img.menuImageUrl}
                      >
                        {img.menuImageIsMain ? <b>(대표)</b> : null} {img.menuImageUrl}
                      </div>
                      <button type="button" className={styles.ghostBtn} onClick={() => onSetMain(img)} disabled={!!img.menuImageIsMain}>
                        대표
                      </button>
                      <button type="button" className={styles.ghostBtn} onClick={() => onDeleteImage(img)}>
                        삭제
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : null}

          {/* 이미지 URL 추가 모달(스토어 페이지 스타일 그대로) */}
          {imgModalOpen ? (
            <div className={styles.modalOverlay} role="dialog" aria-modal="true">
              <div className={styles.modal}>
                <div className={styles.modalTop}>
                  <div className={styles.modalTitle}>이미지 URL 추가</div>
                  <button type="button" className={styles.modalClose} onClick={closeImageModal}>
                    ✕
                  </button>
                </div>

                <input
                  className={styles.input}
                  value={imgUrl}
                  onChange={(e) => setImgUrl(e.target.value)}
                  placeholder="https://..."
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") addImageByUrlLikeStore();
                    if (e.key === "Escape") closeImageModal();
                  }}
                />

                <button type="button" className={styles.primaryBtn} onClick={addImageByUrlLikeStore} disabled={!String(imgUrl ?? "").trim()}>
                  추가
                </button>
              </div>
            </div>
          ) : null}
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
