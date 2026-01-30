import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ownerStoreService } from "../../../api/owner/ownerStoreService.js";
import { unwrap } from "../../../utils/apiResponse.js";
import { saveActiveStoreId } from "../../../components/owner/OwnerStoreContextBar.jsx";
import styles from "../../../styles/owner.module.css";

export default function OwnerStoreListPage() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await ownerStoreService.list();
      setItems(unwrap(res) ?? []);
    } catch (e) {
      setError(e?.response?.data?.message || "매장 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handlePick = (storeId) => {
    saveActiveStoreId(storeId);
    navigate(`/owner/stores/${storeId}/edit`);
  };

  return (
    <div>
      <h2 style={{ margin: "0 0 14px" }}>매장 관리</h2>

      {error ? <div style={{ color: "#dc2626", marginBottom: 12 }}>{error}</div> : null}

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <button
          type="button"
          className={styles.primaryButton}
          onClick={() => navigate("/owner/stores/new")}
        >
          매장 등록
        </button>
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>store_id</th>
            <th>매장명</th>
            <th>상태</th>
            <th>관리</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="4" style={{ padding: 16, color: "#6b7280" }}>
                불러오는 중...
              </td>
            </tr>
          ) : items.length === 0 ? (
            <tr>
              <td colSpan="4" style={{ padding: 16, color: "#6b7280" }}>
                등록된 매장이 없습니다.
              </td>
            </tr>
          ) : (
            items.map((s) => (
              <tr key={s.storeId ?? s.id}>
                <td>{s.storeId ?? s.id}</td>
                <td>{s.storeName ?? s.name ?? "-"}</td>
                <td>{s.storeOpenStatus ?? s.storeStatus ?? s.status ?? "-"}</td>
                <td>
                  <button
                    type="button"
                    className={styles.primaryButton}
                    onClick={() => handlePick(s.storeId ?? s.id)}
                  >
                    열기
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
