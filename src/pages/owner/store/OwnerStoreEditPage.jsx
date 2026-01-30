import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import InlineMessage from "../../../components/InlineMessage.jsx";
import { ownerStoreService } from "../../../api/owner/ownerStoreService.js";
import { ownerStoreImageService } from "../../../api/owner/ownerStoreImageService.js";
import styles from "../../../styles/ownerStoreEdit.module.css";

const pickData = (res) => res?.data?.data ?? res?.data ?? null;

const onlyDigits = (v) => String(v ?? "").replace(/\D/g, "");

const hhmmToText = (v) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return "";
  const hh = String(Math.floor(n / 100)).padStart(2, "0");
  const mm = String(n % 100).padStart(2, "0");
  return `${hh}:${mm}`;
};

const textToHhmm = (t) => {
  if (!t) return null;
  const [h, m] = String(t).split(":");
  const hh = Number(h);
  const mm = Number(m);
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return null;
  return hh * 100 + mm;
};

function SectionCard({ title, onEdit, editing, children, disabledEdit, subtitle }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHead}>
        <div className={styles.cardTitleWrap}>
          <div className={styles.cardTitle}>{title}</div>
          {subtitle ? <div className={styles.cardSub}>{subtitle}</div> : null}
        </div>
        <button
          type="button"
          className={`${styles.editBtn} ${disabledEdit ? styles.editBtnDisabled : ""}`}
          onClick={onEdit}
          disabled={disabledEdit}
          title={disabledEdit ? "현재 수정할 수 없습니다." : "수정"}
        >
          ✏ <span className={styles.editText}>수정</span>
        </button>
      </div>
      <div className={styles.cardBody}>{children}</div>
      {editing ? <div className={styles.cardEditingHint}></div> : null}
    </div>
  );
}

export default function OwnerStoreEditPage() {
  const { storeId } = useParams();
  const sid = useMemo(() => Number(storeId), [storeId]);

  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const [store, setStore] = useState(null);
  const [images, setImages] = useState([]);

  const [businessInfo, setBusinessInfo] = useState(null);
  const [originLabel, setOriginLabel] = useState("");

  // 섹션별 편집 상태
  const [editing, setEditing] = useState({
    phone: false,
    hours: false,
    address: false,
    intro: false,
    delivery: false,
    business: false,
    origin: false,
  });

  // draft
  const [draft, setDraft] = useState({
    storePhone: "",
    openTime: "",
    closeTime: "",
    storeAddress: "",
    storeIntro: "",
    storeMinOrder: "",
    storeMaxDist: "",
    storeDeliveryFee: "",

    ownerName: "",
    businessName: "",
    businessAddress: "",
    businessRegistrationNo: "",
    originLabel: "",
  });

  // 이미지 url 추가 모달
  const [imgModalOpen, setImgModalOpen] = useState(false);
  const [imgUrl, setImgUrl] = useState("");

  const load = async () => {
    if (!Number.isFinite(sid)) return;
    setLoading(true);
    setStatus(null);
    try {
      const sRes = await ownerStoreService.get(sid);
      const s = pickData(sRes);

      const iRes = await ownerStoreImageService.list(sid);
      const imgs = pickData(iRes) ?? [];

      const [bRes, oRes] = await Promise.allSettled([
        ownerStoreService.getBusinessInfo(sid),
        ownerStoreService.getOriginLabel(sid),
      ]);

      const b = bRes.status === "fulfilled" ? pickData(bRes.value) : null;
      const o = oRes.status === "fulfilled" ? pickData(oRes.value) : null;

      setStore(s);
      setImages(Array.isArray(imgs) ? imgs : []);
      setBusinessInfo(b);
      setOriginLabel(o?.originLabel ?? "");

      setDraft({
        storePhone: s?.storePhone ?? "",
        openTime: hhmmToText(s?.storeOpenTime),
        closeTime: hhmmToText(s?.storeCloseTime),
        storeAddress: s?.storeAddress ?? "",
        storeIntro: s?.storeIntro ?? "",
        storeMinOrder: String(s?.storeMinOrder ?? ""),
        storeMaxDist: String(s?.storeMaxDist ?? ""),
        storeDeliveryFee: String(s?.storeDeliveryFee ?? ""),

        ownerName: b?.ownerName ?? "",
        businessName: b?.businessName ?? "",
        businessAddress: b?.businessAddress ?? "",
        businessRegistrationNo: b?.businessRegistrationNo ?? "",
        originLabel: o?.originLabel ?? "",
      });
    } catch (e) {
      setStatus({
        tone: "error",
        message: e?.response?.data?.message || e?.message || "가게 정보를 불러오지 못했습니다.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sid]);

  const toggleEdit = (key) => {
    setEditing((prev) => ({ ...prev, [key]: !prev[key] }));
    setStatus(null);
  };

  const savePatch = async (payload, closeKey) => {
    setStatus(null);
    try {
      const res = await ownerStoreService.patch(sid, payload);
      const next = pickData(res);
      setStore(next);
      setEditing((p) => ({ ...p, [closeKey]: false }));
      setStatus({ tone: "success", message: "저장되었습니다." });
    } catch (e) {
      setStatus({ tone: "error", message: e?.response?.data?.message || "저장에 실패했습니다." });
    }
  };

  const saveDelivery = async () => {
    setStatus(null);
    try {
      const payload = {
        storeMinOrder: draft.storeMinOrder === "" ? null : Number(draft.storeMinOrder),
        storeMaxDist: draft.storeMaxDist === "" ? null : Number(draft.storeMaxDist),
        storeDeliveryFee: draft.storeDeliveryFee === "" ? null : Number(draft.storeDeliveryFee),
      };
      const res = await ownerStoreService.patchDeliveryCondition(sid, payload);
      const next = pickData(res);
      setStore(next);
      setEditing((p) => ({ ...p, delivery: false }));
      setStatus({ tone: "success", message: "배달 조건이 저장되었습니다." });
    } catch (e) {
      setStatus({ tone: "error", message: e?.response?.data?.message || "저장에 실패했습니다." });
    }
  };

  const saveHours = async () => {
    // 운영시간은 PATCH DTO에 없어서, PUT(StoreDTO)로 반영합니다.
    setStatus(null);
    try {
      const payload = {
        storeId: sid,
        storeName: store.storeName,
        storePhone: store.storePhone,
        storeAddress: store.storeAddress,
        storeCategory: store.storeCategory,
        storeMinOrder: store.storeMinOrder,
        storeMaxDist: store.storeMaxDist,
        storeDeliveryFee: store.storeDeliveryFee,
        storeOpenTime: textToHhmm(draft.openTime),
        storeCloseTime: textToHhmm(draft.closeTime),
        storeOpenStatus: store.storeOpenStatus,
        storeIntro: store.storeIntro,
      };

      const res = await ownerStoreService.update(sid, payload);
      const next = pickData(res);
      setStore(next);
      setEditing((p) => ({ ...p, hours: false }));
      setStatus({ tone: "success", message: "운영시간이 저장되었습니다." });
    } catch (e) {
      setStatus({ tone: "error", message: e?.response?.data?.message || "운영시간 저장에 실패했습니다." });
    }
  };

const saveBusinessInfo = async () => {
  setStatus(null);
  try {
    const payload = {
      ownerName: draft.ownerName || null,
      businessName: draft.businessName || null,
      businessAddress: draft.businessAddress || null,
      businessRegistrationNo: draft.businessRegistrationNo || null,
    };
    const res = await ownerStoreService.patchBusinessInfo(sid, payload);
    const next = pickData(res);
    setBusinessInfo(next);
    setEditing((p) => ({ ...p, business: false }));
    setStatus({ tone: "success", message: "사업자 정보가 저장되었습니다." });
  } catch (e) {
    setStatus({ tone: "error", message: e?.response?.data?.message || "저장에 실패했습니다." });
  }
};

const saveOriginLabel = async () => {
  setStatus(null);
  try {
    const payload = { originLabel: draft.originLabel ?? "" };
    const res = await ownerStoreService.patchOriginLabel(sid, payload);
    const next = pickData(res);
    setOriginLabel(next?.originLabel ?? "");
    setEditing((p) => ({ ...p, origin: false }));
    setStatus({ tone: "success", message: "원산지 표기가 저장되었습니다." });
  } catch (e) {
    setStatus({ tone: "error", message: e?.response?.data?.message || "저장에 실패했습니다." });
  }
};

  const toggleOpenStatus = async () => {
    setStatus(null);
    try {
      const current = String(store?.storeOpenStatus ?? "").toLowerCase();
      const next = current === "open" ? "close" : "open";
      await ownerStoreService.changeStatus(sid, { storeOpenStatus: next });
      setStore((p) => ({ ...p, storeOpenStatus: next }));
      setStatus({ tone: "success", message: "영업 상태가 변경되었습니다." });
    } catch (e) {
      setStatus({ tone: "error", message: e?.response?.data?.message || "영업 상태 변경 실패" });
    }
  };

  const openImageModal = () => {
    setImgUrl("");
    setImgModalOpen(true);
  };

  const addImageByUrl = async () => {
    const url = String(imgUrl ?? "").trim();
    if (!url) {
      setStatus({ tone: "error", message: "이미지 URL을 입력해 주세요." });
      return;
    }
    setStatus(null);
    try {
      const res = await ownerStoreImageService.create(sid, { storeImageUrl: url });
      const created = pickData(res);
      if (created) setImages((prev) => [created, ...prev]);
      setImgModalOpen(false);
      setStatus({ tone: "success", message: "이미지가 추가되었습니다." });
    } catch (e) {
      setStatus({ tone: "error", message: e?.response?.data?.message || "이미지 추가 실패" });
    }
  };

  const 대표이미지 = images?.[0]?.storeImageUrl ?? "";

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <h2 className={styles.pageTitle}>가게관리</h2>

        <button
          type="button"
          className={styles.statusBtn}
          onClick={toggleOpenStatus}
          disabled={!store}
          title="영업 상태 변경"
        >
          {String(store?.storeOpenStatus ?? "").toLowerCase() === "open" ? "영업중" : "영업종료"}
        </button>
      </div>

      <InlineMessage tone={status?.tone}>{status?.message}</InlineMessage>
      {loading ? <div className={styles.muted}>불러오는 중...</div> : null}
      {!loading && !store ? <div className={styles.muted}>표시할 가게 정보가 없습니다.</div> : null}

      {store ? (
        <div className={styles.grid}>
          {/* 가게 전화번호 */}
          <SectionCard title="가게 전화번호" editing={editing.phone} onEdit={() => toggleEdit("phone")}>
            {!editing.phone ? (
              <div className={styles.readValue}>{store.storePhone || "-"}</div>
            ) : (
              <div className={styles.formRow}>
                <div className={styles.label}>대표번호</div>
                <input
                  className={styles.input}
                  value={draft.storePhone}
                  onChange={(e) => setDraft((p) => ({ ...p, storePhone: onlyDigits(e.target.value) }))}
                  placeholder="숫자만 입력 (예: 01012345678)"
                />
                <div className={styles.actionRow}>
                  <button
                    type="button"
                    className={styles.primaryBtn}
                    onClick={() => savePatch({ storePhone: draft.storePhone }, "phone")}
                  >
                    저장
                  </button>
                  <button type="button" className={styles.outlineBtn} onClick={() => toggleEdit("phone")}>
                    취소
                  </button>
                </div>
              </div>
            )}
          </SectionCard>

          {/* 운영시간 */}
          <SectionCard title="운영시간" editing={editing.hours} onEdit={() => toggleEdit("hours")}>
            {!editing.hours ? (
              <div className={styles.readValue}>
                {store.storeOpenTime != null && store.storeCloseTime != null
                  ? `${hhmmToText(store.storeOpenTime)} ~ ${hhmmToText(store.storeCloseTime)}`
                  : "운영 시간을 설정해 주세요."}
              </div>
            ) : (
              <div className={styles.formRow}>
                <div className={styles.inline2}>
                  <div className={styles.inlineField}>
                    <div className={styles.label}>오픈</div>
                    <input
                      className={styles.input}
                      type="time"
                      value={draft.openTime}
                      onChange={(e) => setDraft((p) => ({ ...p, openTime: e.target.value }))}
                    />
                  </div>
                  <div className={styles.inlineField}>
                    <div className={styles.label}>마감</div>
                    <input
                      className={styles.input}
                      type="time"
                      value={draft.closeTime}
                      onChange={(e) => setDraft((p) => ({ ...p, closeTime: e.target.value }))}
                    />
                  </div>
                </div>

                <div className={styles.actionRow}>
                  <button type="button" className={styles.primaryBtn} onClick={saveHours}>
                    저장
                  </button>
                  <button type="button" className={styles.outlineBtn} onClick={() => toggleEdit("hours")}>
                    취소
                  </button>
                </div>

                <div className={styles.hint}>
                 
                </div>
              </div>
            )}
          </SectionCard>

          {/* 주소 */}
          <SectionCard title="주소" editing={editing.address} onEdit={() => toggleEdit("address")}>
            {!editing.address ? (
              <>
                <div className={styles.readValue}>{store.storeAddress || "-"}</div>
                <div className={styles.mapBox} aria-hidden="true" />
              </>
            ) : (
              <div className={styles.formRow}>
                <div className={styles.label}>주소</div>
                <input
                  className={styles.input}
                  value={draft.storeAddress}
                  onChange={(e) => setDraft((p) => ({ ...p, storeAddress: e.target.value }))}
                  placeholder="주소를 입력해 주세요"
                />
                <div className={styles.actionRow}>
                  <button
                    type="button"
                    className={styles.primaryBtn}
                    onClick={() => savePatch({ storeAddress: draft.storeAddress }, "address")}
                  >
                    저장
                  </button>
                  <button type="button" className={styles.outlineBtn} onClick={() => toggleEdit("address")}>
                    취소
                  </button>
                </div>
                <div className={styles.hint}>지도는 피그마 형태만 유지(회색 박스)했습니다.</div>
              </div>
            )}
          </SectionCard>

          {/* 가게소개 */}
          <SectionCard title="가게소개" editing={editing.intro} onEdit={() => toggleEdit("intro")}>
            <div className={styles.introRow}>
              <div className={styles.introLeft}>
                {대표이미지 ? (
                  <img className={styles.introImg} src={대표이미지} alt="대표 이미지" />
                ) : (
                  <button type="button" className={styles.addPhotoBox} onClick={openImageModal}>
                    <div className={styles.plus}>＋</div>
                    <div className={styles.addPhotoText}>사진 추가</div>
                  </button>
                )}
              </div>

              <div className={styles.introRight}>
                {!editing.intro ? (
                  <div className={styles.readValue}>{store.storeIntro || "가게에 대해 소개해 주세요."}</div>
                ) : (
                  <>
                    <textarea
                      className={styles.textarea}
                      value={draft.storeIntro}
                      onChange={(e) => setDraft((p) => ({ ...p, storeIntro: e.target.value }))}
                      placeholder="가게 소개를 입력해 주세요"
                    />
                    <div className={styles.actionRow}>
                      <button
                        type="button"
                        className={styles.primaryBtn}
                        onClick={() => savePatch({ storeIntro: draft.storeIntro }, "intro")}
                      >
                        저장
                      </button>
                      <button type="button" className={styles.outlineBtn} onClick={() => toggleEdit("intro")}>
                        취소
                      </button>
                    </div>
                  </>
                )}

                <div className={styles.smallActions}>
                  <button type="button" className={styles.outlineBtn} onClick={openImageModal}>
                    이미지 URL 추가
                  </button>
                  <span className={styles.hint}>
                    백엔드는 파일 업로드가 아니라 URL 저장(StoreImageDTO) 방식입니다.
                  </span>
                </div>
              </div>
            </div>
          </SectionCard>

<SectionCard
  title="사업자 정보"
  subtitle="대표자명 / 상호명 / 사업자주소 / 사업자등록번호"
  editing={editing.business}
  onEdit={() => toggleEdit("business")}
>
  {!editing.business ? (
    <>
      <div className={styles.bizGrid}>
        <div className={styles.bizKey}>대표자명</div>
        <div className={styles.bizVal}>{businessInfo?.ownerName ?? "-"}</div>

        <div className={styles.bizKey}>상호명</div>
        <div className={styles.bizVal}>{businessInfo?.businessName ?? "-"}</div>

        <div className={styles.bizKey}>사업자주소</div>
        <div className={styles.bizVal}>{businessInfo?.businessAddress ?? "-"}</div>

        <div className={styles.bizKey}>사업자등록번호</div>
        <div className={styles.bizVal}>{businessInfo?.businessRegistrationNo ?? "-"}</div>
      </div>
      <div className={styles.hint}></div>
    </>
  ) : (
    <div className={styles.formRow}>
      <div>
        <div className={styles.label}>대표자명</div>
        <input
          className={styles.input}
          value={draft.ownerName}
          onChange={(e) => setDraft((p) => ({ ...p, ownerName: e.target.value }))}
          placeholder="대표자명을 입력하세요"
        />
      </div>
      <div>
        <div className={styles.label}>상호명</div>
        <input
          className={styles.input}
          value={draft.businessName}
          onChange={(e) => setDraft((p) => ({ ...p, businessName: e.target.value }))}
          placeholder="상호명을 입력하세요"
        />
      </div>
      <div>
        <div className={styles.label}>사업자주소</div>
        <input
          className={styles.input}
          value={draft.businessAddress}
          onChange={(e) => setDraft((p) => ({ ...p, businessAddress: e.target.value }))}
          placeholder="사업자주소를 입력하세요"
        />
      </div>
      <div>
        <div className={styles.label}>사업자등록번호</div>
        <input
          className={styles.input}
          value={draft.businessRegistrationNo}
          onChange={(e) => setDraft((p) => ({ ...p, businessRegistrationNo: e.target.value }))}
          placeholder="사업자등록번호를 입력하세요"
        />
      </div>

      <div className={styles.actionRow}>
        <button type="button" className={styles.primaryBtn} onClick={saveBusinessInfo}>
          저장
        </button>
        <button type="button" className={styles.outlineBtn} onClick={() => toggleEdit("business")}>
          취소
        </button>
      </div>
    </div>
  )}
</SectionCard>

          {/* 배달 조건 (피그마에 직접 없더라도, 백엔드 기능이므로 가게관리 하단 카드로 포함) */}
          <SectionCard
            title="배달 조건"
            subtitle="최소주문금액 / 최대배달거리 / 배달비"
            editing={editing.delivery}
            onEdit={() => toggleEdit("delivery")}
          >
            {!editing.delivery ? (
              <div className={styles.readList}>
                <div className={styles.readItem}>
                  <span className={styles.readLabel}>최소 주문 금액</span>
                  <b>{(store.storeMinOrder ?? 0).toLocaleString("ko-KR")}원</b>
                </div>
                <div className={styles.readItem}>
                  <span className={styles.readLabel}>최대 배달 거리</span>
                  <b>{store.storeMaxDist ?? 0}m</b>
                </div>
                <div className={styles.readItem}>
                  <span className={styles.readLabel}>배달비</span>
                  <b>{(store.storeDeliveryFee ?? 0).toLocaleString("ko-KR")}원</b>
                </div>
              </div>
            ) : (
              <div className={styles.formRow}>
                <div className={styles.inline3}>
                  <div className={styles.inlineField}>
                    <div className={styles.label}>최소 주문(원)</div>
                    <input
                      className={styles.input}
                      value={draft.storeMinOrder}
                      onChange={(e) => setDraft((p) => ({ ...p, storeMinOrder: onlyDigits(e.target.value) }))}
                      placeholder="예: 12000"
                    />
                  </div>
                  <div className={styles.inlineField}>
                    <div className={styles.label}>최대 거리(m)</div>
                    <input
                      className={styles.input}
                      value={draft.storeMaxDist}
                      onChange={(e) => setDraft((p) => ({ ...p, storeMaxDist: onlyDigits(e.target.value) }))}
                      placeholder="예: 3000"
                    />
                  </div>
                  <div className={styles.inlineField}>
                    <div className={styles.label}>배달비(원)</div>
                    <input
                      className={styles.input}
                      value={draft.storeDeliveryFee}
                      onChange={(e) => setDraft((p) => ({ ...p, storeDeliveryFee: onlyDigits(e.target.value) }))}
                      placeholder="예: 2000"
                    />
                  </div>
                </div>

                <div className={styles.actionRow}>
                  <button type="button" className={styles.primaryBtn} onClick={saveDelivery}>
                    저장
                  </button>
                  <button type="button" className={styles.outlineBtn} onClick={() => toggleEdit("delivery")}>
                    취소
                  </button>
                </div>
              </div>
            )}
          </SectionCard>

<SectionCard
  title="원산지 표기"
  editing={editing.origin}
  onEdit={() => toggleEdit("origin")}
>
  {!editing.origin ? (
    <>
      <div className={styles.readValue}>
        {originLabel ? originLabel : "등록된 원산지 표기가 없습니다."}
      </div>
      <div className={styles.hint}></div>
    </>
  ) : (
    <div className={styles.formRow}>
      <div>
        <div className={styles.label}></div>
        <textarea
          className={styles.textarea}
          value={draft.originLabel}
          onChange={(e) => setDraft((p) => ({ ...p, originLabel: e.target.value }))}
          placeholder="최대 4000자까지 입력 가능합니다."
        />
      </div>

      <div className={styles.actionRow}>
        <button type="button" className={styles.primaryBtn} onClick={saveOriginLabel}>
          저장
        </button>
        <button type="button" className={styles.outlineBtn} onClick={() => toggleEdit("origin")}>
          취소
        </button>
      </div>
    </div>
  )}
</SectionCard>

        </div>
      ) : null}

      {/* 이미지 URL 추가 모달 */}
      {imgModalOpen ? (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modal}>
            <div className={styles.modalTop}>
              <div className={styles.modalTitle}>이미지 URL 추가</div>
              <button type="button" className={styles.modalClose} onClick={() => setImgModalOpen(false)}>
                ✕
              </button>
            </div>

            <input
              className={styles.input}
              value={imgUrl}
              onChange={(e) => setImgUrl(e.target.value)}
              placeholder="https://..."
            />

            <button type="button" className={styles.primaryBtn} onClick={addImageByUrl}>
              추가
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
