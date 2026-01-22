import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMe } from "../../services/authService";
import {
  createAddress,
  deleteAddress,
  getMyAddresses,
  setDefault,
  updateAddress,
} from "../../services/addressService";
import styles from "../../styles/mypage.module.css";

const emptyForm = {
  addressDetail: "",
  addressNickname: "",
  addressEntranceMethod: "",
  isDefault: false,
};

export default function AddressListPage() {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  const isEditing = useMemo(() => editingId !== null, [editingId]);

  const fetchAddresses = async () => {
    try {
      // API: GET /api/v1/addresses/me
      const response = await getMyAddresses();
      const data = response.data?.data || response.data || [];
      setAddresses(Array.isArray(data) ? data : []);
    } catch (error) {
      setStatus(error?.message || "주소 정보를 불러오지 못했습니다.");
    }
  };

  useEffect(() => {
    let active = true;

    const ensureAuthAndFetch = async () => {
      try {
        // API: GET /api/v1/auth/me
        await getMe();
        if (active) {
          await fetchAddresses();
        }
      } catch (error) {
        const statusCode = error?.response?.status;
        if (statusCode === 401 || statusCode === 403) {
          navigate("/select", { replace: true });
          return;
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    ensureAuthAndFetch();
    return () => {
      active = false;
    };
  }, [navigate]);

  const handleChange = (field) => (event) => {
    const value = field === "isDefault" ? event.target.checked : event.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus(null);

    if (!form.addressDetail.trim()) {
      setStatus("주소를 입력해주세요.");
      return;
    }

    const payload = {
      addressDetail: form.addressDetail.trim(),
      addressNickname: form.addressNickname.trim() || null,
      addressEntranceMethod: form.addressEntranceMethod.trim() || null,
      isDefault: form.isDefault,
    };

    try {
      if (isEditing) {
        // API: PATCH /api/v1/addresses/{id}
        await updateAddress(editingId, payload);
      } else {
        // API: POST /api/v1/addresses
        await createAddress(payload);
      }
      await fetchAddresses();
      resetForm();
    } catch (error) {
      setStatus(error?.message || "요청 처리 중 오류가 발생했습니다.");
    }
  };

  const handleEdit = (address) => {
    setEditingId(address.addressId);
    setForm({
      addressDetail: address.addressDetail || "",
      addressNickname: address.addressNickname || "",
      addressEntranceMethod: address.addressEntranceMethod || "",
      isDefault: Boolean(address.isDefault),
    });
  };

  const handleDelete = async (addressId) => {
    setStatus(null);
    try {
      // API: DELETE /api/v1/addresses/{id}
      await deleteAddress(addressId);
      await fetchAddresses();
    } catch (error) {
      setStatus(error?.message || "삭제에 실패했습니다.");
    }
  };

  const handleSetDefault = async (addressId) => {
    setStatus(null);
    try {
      // API: POST /api/v1/addresses/{id}/default
      await setDefault(addressId);
      await fetchAddresses();
    } catch (error) {
      setStatus(error?.message || "기본주소 설정에 실패했습니다.");
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <header className={styles.topBar}>
          <button
            className={styles.iconButton}
            type="button"
            onClick={() => navigate(-1)}
            aria-label="뒤로가기"
          >
            ←
          </button>
          <span className={styles.topBarTitle}>주소 관리</span>
          <div className={styles.rightIcons} />
        </header>

        <section className={styles.pageBody}>
          <h2 className={styles.sectionTitle}>
            {isEditing ? "주소 수정" : "주소 추가"}
          </h2>
          {loading ? (
            <p className={styles.loadingText}>주소 정보를 불러오는 중...</p>
          ) : (
            <form className={styles.form} onSubmit={handleSubmit}>
              <input
                className={styles.input}
                value={form.addressDetail}
                onChange={handleChange("addressDetail")}
                placeholder="기본 주소"
              />
              <input
                className={styles.input}
                value={form.addressNickname}
                onChange={handleChange("addressNickname")}
                placeholder="주소 별칭 (예: 집, 회사)"
              />
              <input
                className={styles.input}
                value={form.addressEntranceMethod}
                onChange={handleChange("addressEntranceMethod")}
                placeholder="출입 방법 안내"
              />
              <label className={styles.checkboxRow}>
                <input
                  type="checkbox"
                  checked={form.isDefault}
                  onChange={handleChange("isDefault")}
                />
                기본 주소로 설정
              </label>
              {status ? <p className={styles.errorText}>{status}</p> : null}
              {isEditing ? (
                <div className={styles.buttonRow}>
                  <button className={styles.primaryButton} type="submit">
                    저장
                  </button>
                  <button
                    className={styles.secondaryButton}
                    type="button"
                    onClick={resetForm}
                  >
                    취소
                  </button>
                </div>
              ) : (
                <button className={styles.primaryButton} type="submit">
                  추가
                </button>
              )}
            </form>
          )}
        </section>

        <section className={styles.pageBody}>
          <h2 className={styles.sectionTitle}>내 주소 목록</h2>
          <div className={styles.addressList}>
            {addresses.length === 0 ? (
              <p className={styles.loadingText}>등록된 주소가 없습니다.</p>
            ) : (
              addresses.map((address) => (
                <article key={address.addressId} className={styles.addressCard}>
                  <div className={styles.addressHeader}>
                    <span className={styles.addressTitle}>
                      {address.addressNickname || "주소"}
                    </span>
                    {address.isDefault ? (
                      <span className={styles.defaultBadge}>기본</span>
                    ) : null}
                  </div>
                  <div className={styles.addressText}>{address.addressDetail}</div>
                  {address.addressEntranceMethod ? (
                    <div className={styles.addressMeta}>
                      출입: {address.addressEntranceMethod}
                    </div>
                  ) : null}
                  {address.createdDate ? (
                    <div className={styles.addressMeta}>
                      등록일: {address.createdDate}
                    </div>
                  ) : null}
                  <div className={styles.cardActions}>
                    <button
                      className={`${styles.smallButton} ${styles.smallButtonPrimary}`}
                      type="button"
                      onClick={() => handleEdit(address)}
                    >
                      수정
                    </button>
                    <button
                      className={styles.smallButton}
                      type="button"
                      onClick={() => handleDelete(address.addressId)}
                    >
                      삭제
                    </button>
                    {!address.isDefault ? (
                      <button
                        className={styles.smallButton}
                        type="button"
                        onClick={() => handleSetDefault(address.addressId)}
                      >
                        기본 설정
                      </button>
                    ) : null}
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
