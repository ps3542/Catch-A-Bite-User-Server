import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppUserAddressService from "../../api/appuser/AddressService";
import "./UserAddressEdit.css";
import useRoleGuard from "../../hooks/useRoleGuard";

export default function UserAddressEdit() {

  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [newName, setNewName] = useState("");
  const [newAddress, setNewAddress] = useState("");

  // 로그인 정보
  const { user, loading: authLoading } = useRoleGuard("USER");
  const userId = user?.appUserId;

  console.log("유저:", user);

  // ======================
  // 주소 조회
  // ======================
  const fetchAddresses = async () => {

    if (!userId) return;

    try {
      const res = await AppUserAddressService.getMyAddresses(userId);

      console.log("주소 응답:", res);

      setAddresses(res.data || []);

    } catch (err) {
      console.error("주소 불러오기 실패", err);
    }
  };


  // ======================
  // userId 생기면 실행
  // ======================
  useEffect(() => {

    if (!userId) return;

    fetchAddresses();

  }, [userId]);



  if (authLoading) {
    return <div>로딩중...</div>;
  }


  // ======================
  // 주소 추가
  // ======================
  const handleAdd = async () => {

    if (!newName || !newAddress) {
      alert("이름과 주소를 입력하세요");
      return;
    }

    try {

      const data = {
        addressNickname: newName,   // 서버 필드명 맞춤
        addressDetail: newAddress,
        appUserId: userId,
        addressIsDefault: addresses.length === 0 ? "Y" : "N",
        addressVisible: "Y"
      };

      await AppUserAddressService.createAddress(data);

      alert("주소 등록 완료");

      setNewName("");
      setNewAddress("");

      fetchAddresses();

    } catch (err) {
      console.error("주소 등록 실패", err);
      alert("주소 등록 실패");
    }
  };


  // ======================
  // 주소 삭제
  // ======================
  const handleDelete = async (id) => {

    if (!window.confirm("삭제하시겠습니까?")) return;

    try {

      await AppUserAddressService.deleteAddress(id);

      alert("삭제 완료");

      fetchAddresses();

    } catch (err) {
      console.error("삭제 실패", err);
      alert("삭제 실패");
    }
  };


  return (
    <div className="address-container">

      <h2 className="address-title">주소 관리</h2>


      {/* 추가 */}
      <div className="address-add">

        <input
          type="text"
          placeholder="이름 (집, 회사 등)"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />

        <input
          type="text"
          placeholder="주소 입력"
          value={newAddress}
          onChange={(e) => setNewAddress(e.target.value)}
        />

        <button onClick={handleAdd}>
          추가
        </button>

      </div>


      {/* 목록 */}
      <div className="address-list">

        {addresses.length === 0 && (
          <p>등록된 주소가 없습니다.</p>
        )}

        {addresses.map((item) => (
          <div key={item.addressId} className="address-item">

            <div>
              <div className="address-name">
                {item.addressNickname || "이름없음"}
              </div>

              <div className="address-text">
                {item.addressDetail}
              </div>
            </div>

            <button
              className="delete-btn"
              onClick={() => handleDelete(item.addressId)}
            >
              삭제
            </button>

          </div>
        ))}

      </div>

    </div>
  );
}
