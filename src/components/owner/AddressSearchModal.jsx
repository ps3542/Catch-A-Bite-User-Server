import { useEffect, useRef, useState } from "react";
import styles from "../../styles/ownerStoreEdit.module.css";
import KakaoAddressMap from "./KaKaoAddressMap.jsx";

const DAUM_POSTCODE_ID = "daum-postcode-sdk";

export default function AddressSearchModal({ isOpen, onClose, onConfirm, initialAddress = "" }) {
  const wrapRef = useRef(null);
  const [selectedAddress, setSelectedAddress] = useState(initialAddress);

  useEffect(() => {
    if (!isOpen) return;
    setSelectedAddress(initialAddress);

    const loadDaumPostcode = () =>
      new Promise((resolve, reject) => {
        if (window.daum?.Postcode) return resolve();

        const existing = document.getElementById(DAUM_POSTCODE_ID);
        if (existing) {
          existing.addEventListener("load", () => resolve());
          existing.addEventListener("error", () => reject());
          return;
        }

        const script = document.createElement("script");
        script.id = DAUM_POSTCODE_ID;
        script.src = "https://t1.daumcdn.net/mapjsapi/bundle/postcode/prod/postcode.v2.js";
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject();
        document.head.appendChild(script);
      });

    loadDaumPostcode()
      .then(() => {
        if (!wrapRef.current) return;
        wrapRef.current.innerHTML = "";

        new window.daum.Postcode({
          oncomplete: (data) => {
            const addr = data.roadAddress || data.jibunAddress || "";
            setSelectedAddress(addr);
          },
          width: "100%",
          height: "100%",
        }).embed(wrapRef.current);
      })
      .catch(() => console.error("daum postcode load error"));
  }, [isOpen, initialAddress]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (!selectedAddress?.trim()) return;
    onConfirm(selectedAddress);
    onClose();
  };

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true">
      <div className={styles.modal} style={{ width: 980, maxWidth: "95vw" }}>
        <div className={styles.modalTop}>
          <div className={styles.modalTitle}>주소 검색</div>
          <button type="button" className={styles.modalClose} onClick={onClose}>
            ✕
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, height: 520 }}>
          <div style={{ border: "1px solid #eee", borderRadius: 12, overflow: "hidden" }}>
            <div ref={wrapRef} style={{ width: "100%", height: "100%" }} />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <input className={styles.input} value={selectedAddress} readOnly />

            <div style={{ flex: 1, borderRadius: 12, overflow: "hidden" }}>
              <KakaoAddressMap address={selectedAddress || ""} />
            </div>

            <div className={styles.actionRow} style={{ justifyContent: "flex-end" }}>
              <button type="button" className={styles.outlineBtn} onClick={onClose}>
                취소
              </button>
              <button type="button" className={styles.primaryBtn} onClick={handleConfirm}>
                적용
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
