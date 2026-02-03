import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ownerStoreImageService } from "../../../api/owner/ownerStoreImageService.js";
import { unwrap } from "../../../utils/apiResponse.js";
import styles from "../../../styles/ownerForm.module.css";

export default function OwnerStoreImagePage() {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const sid = useMemo(() => Number(storeId), [storeId]);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await ownerStoreImageService.list(sid);
      setItems(unwrap(res) ?? []);
    } catch (e) {
      setError(e?.response?.data?.message || "이미지를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!Number.isFinite(sid)) return;
    load();
  }, [sid]);

  return (
    <div className={styles.wrap}>
      <div className={styles.headerRow}>
        <h2 className={styles.title}>매장 이미지</h2>
        <button type="button" className={styles.outlineBtn} onClick={() => navigate(-1)}>
          뒤로
        </button>
      </div>

      {error ? <div className={styles.error}>{error}</div> : null}

      {loading ? <div style={{ marginTop: 8, color: "#6b7280" }}>불러오는 중...</div> : null}

      <div className={styles.imageGrid}>
        {items.length === 0 ? (
          <div style={{ color: "#6b7280" }}>등록된 이미지가 없습니다.</div>
        ) : (
          items.map((img) => (
            <div key={img.storeImageId ?? img.id} className={styles.imageCard}>
              <img
                alt="store"
                src={img.storeImageUrl ?? img.imageUrl ?? img.url}
                className={styles.image}
              />
              <button
                type="button"
                className={styles.dangerBtn}
                onClick={async () => {
                  await ownerStoreImageService.delete(sid, img.storeImageId ?? img.id);
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
