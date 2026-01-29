import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { HiArrowLeft, HiMinus, HiPlus, HiCheck } from "react-icons/hi";
import { appUserStoreService } from "../../api/appuser/StoreService";
import axiosInstance from "../../api/axios"; 
import "./UserMenuOption.css";

export default function UserMenuOption() {
  const { menuId } = useParams();
  const navigate = useNavigate();

  const [menu, setMenu] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [selectedOptions, setSelectedOptions] = useState({});

  useEffect(() => {
    loadMenu();
  }, [menuId]);

  const loadMenu = async () => {
    try {
      const data = await appUserStoreService.getMenuDetail(menuId);
      setMenu(data);
      setSelectedOptions({});
    } catch (error) {
      console.error("Menu Load Failed:", error);
      alert("메뉴 정보를 불러오는데 실패했습니다.");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionClick = (groupId, optionId) => {
    setSelectedOptions(prev => {
      const currentSelected = prev[groupId] || [];
      const isAlreadySelected = currentSelected.includes(optionId);
      if (isAlreadySelected) {
        return { ...prev, [groupId]: currentSelected.filter(id => id !== optionId) };
      } else {
        return { ...prev, [groupId]: [...currentSelected, optionId] };
      }
    });
  };

  const calculateTotalPrice = () => {
    if (!menu) return 0;
    let total = menu.menuPrice;
    // (옵션 가격 계산 로직 유지 - UI 표시용)
    menu.optionGroups?.forEach(group => {
      const selectedIds = selectedOptions[group.menuOptionGroupId] || [];
      group.options.forEach(opt => {
        if (selectedIds.includes(opt.menuOptionId)) {
          total += opt.menuOptionPrice;
        }
      });
    });
    return total * quantity;
  };

  const isFormValid = () => {
    if (!menu) return false;
    for (const group of menu.optionGroups || []) {
      if (group.required) {
        const selectedCount = (selectedOptions[group.menuOptionGroupId] || []).length;
        if (selectedCount === 0) return false;
      }
    }
    return true;
  };

  const handleAddToCart = async () => {
    if (!isFormValid()) return;
    
    // selectedOptions 객체를 1차원 배열(List<Long>)로 변환
    const optionIds = Object.values(selectedOptions).flat();

    const payload = {
      menuId: menu.menuId,
      cartItemQuantity: quantity,
      optionIds: optionIds
    };

    try {
      await axiosInstance.post("/api/v1/appuser/cart/items", payload);
      
      if (window.confirm("장바구니에 담았습니다. 장바구니로 이동하시겠습니까?")) {
        navigate("/user/cart");
      } else {
        navigate(-1);
      }
    } catch (error) {
      console.error("Add to cart failed:", error);
      alert("장바구니 담기에 실패했습니다.");
    }
  };

  if (loading) return <div className="loading-screen">메뉴 정보를 불러오는 중...</div>;
  if (!menu) return null;

  return (
    <div className="menu-option-page">
      {/* ... (UI 렌더링 부분 기존과 동일, 생략) ... */}
       <div className="menu-hero">
        {menu.menuImageUrl ? (
          <img src={menu.menuImageUrl} alt={menu.menuName} className="menu-hero-img" />
        ) : (
          <div className="menu-hero-placeholder">이미지 없음</div>
        )}
      </div>

      <div className="menu-info-section">
          <h2 className="menu-title">{menu.menuName}</h2>
          <p className="menu-desc">{menu.menuDescription}</p>
          <div className="menu-price-row">
            <span className="menu-price">{menu.menuPrice.toLocaleString()}원</span>
          </div>
      </div>

      <div className="option-list">
        {menu.optionGroups?.map(group => {
            return (
                <div key={group.menuOptionGroupId} className="option-group">
                    <div className="group-header">
                        <div className="group-title-row">
                            <h3 className="group-title">{group.menuOptionGroupName}</h3>
                            {group.required ? (
                                <span className="badge-required">필수</span>
                            ) : (
                                <span className="badge-optional">선택</span>
                            )}
                        </div>
                    </div>
                    <div className="option-items">
                        {group.options.map(opt => {
                            const isSelected = selectedOptions[group.menuOptionGroupId]?.includes(opt.menuOptionId);
                            return (
                                <div 
                                    key={opt.menuOptionId} 
                                    onClick={() => handleOptionClick(group.menuOptionGroupId, opt.menuOptionId)}
                                    className="option-item"
                                >
                                    <div className="option-label">
                                        <div className={`selection-indicator checkbox ${isSelected ? 'selected' : ''}`}>
                                            {isSelected && <HiCheck className="check-icon" />}
                                        </div>
                                        <span className={`option-name ${isSelected ? 'selected-text' : ''}`}>
                                            {opt.menuOptionName}
                                        </span>
                                    </div>
                                    <span className="option-price">
                                        {opt.menuOptionPrice > 0 ? `+${opt.menuOptionPrice.toLocaleString()}원` : "0원"}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        })}
      </div>

      <div className="bottom-action-bar">
          <div className="quantity-control-row">
              <span className="qty-label">수량</span>
              <div className="qty-stepper">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="stepper-btn">
                    <HiMinus />
                  </button>
                  <span className="qty-value">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="stepper-btn">
                    <HiPlus />
                  </button>
              </div>
          </div>

          <button 
            onClick={handleAddToCart}
            disabled={!isFormValid()}
            className={`add-cart-btn ${isFormValid() ? 'active' : 'disabled'}`}
          >
            {calculateTotalPrice().toLocaleString()}원 담기
          </button>
      </div>
    </div>
  );
}