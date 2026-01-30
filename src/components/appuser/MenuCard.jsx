// 리액트 및 유틸리티 임포트
import React from "react";
import "./MenuCard.css"; // 스타일 파일 임포트

// --- 메뉴 카드 컴포넌트 ---
// 개별 메뉴 아이템을 카드 형태로 보여줍니다.
// 클릭 시 부모 컴포넌트에서 전달받은 onClick 핸들러를 실행합니다.
const MenuCard = ({ menu, onClick }) => {
  // 품절 여부 확인
  const isSoldOut = !menu.menuIsAvailable;

  return (
    <div 
      className={`menu-card ${isSoldOut ? "sold-out" : ""}`} 
      onClick={() => !isSoldOut && onClick(menu.menuId)}
    >
      {/* --- 왼쪽: 메뉴 텍스트 정보 --- */}
      <div className="menu-card-info">
        <h4 className="menu-card-title">
          {menu.menuName}
          {isSoldOut && <span className="menu-badge-soldout">품절</span>}
        </h4>
        <p className="menu-card-desc">{menu.menuDescription}</p>
        <p className="menu-card-price">{menu.menuPrice?.toLocaleString()}원</p>
      </div>

      {/* --- 오른쪽: 메뉴 이미지 (있으면 이미지, 없으면 회색 박스) --- */}
      <div className="menu-card-image">
        {menu.menuImageUrl ? (
          <img src={menu.menuImageUrl} alt={menu.menuName} />
        ) : (
          <div className="menu-image-placeholder" />
        )}
      </div>
    </div>
  );
};

export default MenuCard;