import { useEffect, useState } from "react";
import { getMe } from "../../services/authService";
import { useNavigate } from "react-router-dom";
import "./UserProfile.css";



export default function UserProfile() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await getMe();
        setUser(res.data);
      } catch (err) {
        console.error("유저 정보 불러오기 실패", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return <div className="profile-container">로딩중...</div>;
  }

  return (
    <div className="profile-container">

      {/* 프로필 카드 */}
      <div className="profile-card">
        <div className="profile-avatar">
          <span className="material-symbols-outlined">
            person
          </span>
        </div>

        <div>
          <div className="profile-nickname">
            {user?.nickname || user?.name || "사용자"}
          </div>
        </div>
      </div>

      {/* 메뉴 */}
      <div className="profile-menu">

        <MenuItem
          icon="person"
          text="개인정보 수정"
          onClick={() => navigate("../edit-profile")}
        />

        <MenuItem
          icon="location_on"
          text="주소 관리"
          onClick={() => navigate("../address-edit")}
        />


        <MenuItem
          icon="favorite"
          text="즐겨찾기"
          onClick={() => navigate("../favorite")}
        />

        <MenuItem icon="credit_card" text="결제 관리" />
        <MenuItem icon="redeem" text="진행 중인 이벤트" />
        <MenuItem icon="settings" text="설정" />
        <MenuItem icon="notifications" text="공지사항" />

      </div>
    </div>
  );
}

/* 메뉴 컴포넌트 분리 */
function MenuItem({ icon, text, onClick }) {
  return (
    <div className="profile-item" onClick={onClick} style={{ cursor: "pointer" }}>
      <span className="menu-left">
        <span className="material-symbols-outlined">{icon}</span>
        {text}
      </span>
      <span className="material-symbols-outlined">
        chevron_right
      </span>
    </div>
  );
}

