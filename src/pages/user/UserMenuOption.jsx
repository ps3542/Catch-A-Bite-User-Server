import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { HiArrowLeft, HiMinus, HiPlus, HiCheck } from "react-icons/hi";
import { appUserStoreService } from "../../api/appuser/StoreService";
import axiosInstance from "../../api/axios"; 
import Modal from "../../components/common/Modal";
import "./UserMenuOption.css";

export default function UserMenuOption() {
  const { menuId } = useParams();
  const navigate = useNavigate();

  // ========================================================================================
  // [1. 상태(State) 정의]
  // ========================================================================================
  const [menu, setMenu] = useState(null);               // 메뉴 상세 정보 데이터
  const [loading, setLoading] = useState(true);         // 로딩 상태 플래그
  const [quantity, setQuantity] = useState(1);          // 선택된 수량 (기본 1개)
  const [selectedOptions, setSelectedOptions] = useState({}); // 선택된 옵션 목록 (Map 형태: groupId -> [optionId, ...])
  
  // 모달 제어 상태 (장바구니 이동 확인용)
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ========================================================================================
  // [2. 초기화 및 데이터 로드]
  // ========================================================================================
  useEffect(() => {
    loadMenu();
  }, [menuId]);

  /**
   * 메뉴 상세 정보를 서버로부터 조회합니다.
   * 성공 시: menu 상태 업데이트 및 옵션 초기화
   * 실패 시: 경고창 표시 후 이전 페이지로 이동
   */
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

  // ========================================================================================
  // [3. 비즈니스 로직: 옵션 선택 처리]
  // ========================================================================================
  /**
   * 사용자가 옵션을 클릭했을 때의 처리 로직입니다.
   * 이미 선택된 옵션이라면 제거하고, 선택되지 않은 옵션이라면 추가합니다. (Toggle 방식)
   * * @param {number} groupId - 옵션 그룹 ID
   * @param {number} optionId - 선택한 옵션 ID
   */
  const handleOptionClick = (groupId, optionId) => {
    setSelectedOptions(prev => {
      const currentSelected = prev[groupId] || [];
      const isAlreadySelected = currentSelected.includes(optionId);
      
      if (isAlreadySelected) {
        // 이미 선택됨 -> 리스트에서 제거
        return { ...prev, [groupId]: currentSelected.filter(id => id !== optionId) };
      } else {
        // 선택 안됨 -> 리스트에 추가
        return { ...prev, [groupId]: [...currentSelected, optionId] };
      }
    });
  };

  // ========================================================================================
  // [4. 비즈니스 로직: 가격 계산 및 유효성 검사]
  // ========================================================================================
  /**
   * 현재 선택된 옵션들과 수량을 기반으로 총 주문 금액을 계산합니다.
   * (기본 메뉴 가격 + 선택된 옵션 가격들의 합) * 수량
   */
  const calculateTotalPrice = () => {
    if (!menu) return 0;
    
    let total = menu.menuPrice;

    // 옵션 그룹 순회하며 선택된 옵션 가격 합산
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

  /**
   * 필수 옵션 그룹이 모두 선택되었는지 확인합니다.
   * 필수(required=true) 그룹에서 선택된 항목이 없으면 false를 반환합니다.
   */
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

  // ========================================================================================
  // [5. 장바구니 담기 및 모달 이벤트 핸들러]
  // ========================================================================================
  /**
   * [장바구니 담기] 버튼 클릭 시 실행됩니다.
   * API 호출을 통해 장바구니에 아이템을 추가하고, 성공 시 모달을 띄웁니다.
   */
  const handleAddToCart = async () => {
    if (!isFormValid()) return;
    
    // selectedOptions 객체(Map)를 1차원 배열(List<Long>)로 변환하여 API 스펙에 맞춤
    const optionIds = Object.values(selectedOptions).flat();

    const payload = {
      menuId: menu.menuId,
      cartItemQuantity: quantity,
      optionIds: optionIds
    };

    try {
      await axiosInstance.post("/api/v1/appuser/cart/items", payload);
      
      setIsModalOpen(true);

    } catch (error) {
      console.error("Add to cart failed:", error);
      alert("장바구니 담기에 실패했습니다.");
    }
  };

  /**
   * 모달: [장바구니 이동] 버튼 클릭 핸들러
   */
  const handleGoToCart = () => {
    setIsModalOpen(false);
    navigate("/user/cart");
  };

  /**
   * 모달: [닫기] 또는 [다른 메뉴 보기] 버튼 클릭 핸들러
   * 이전 페이지(메뉴 목록)로 돌아갑니다.
   */
  const handleCloseOrBack = () => {
    setIsModalOpen(false);
    navigate(-1); 
  };

  // ========================================================================================
  // [6. 렌더링 (View)]
  // ========================================================================================
  if (loading) return <div className="loading-screen">메뉴 정보를 불러오는 중...</div>;
  if (!menu) return null;

  return (
    <div className="menu-option-page">
      
      {/* 6.1 메뉴 이미지 영역 (Hero Section) */}
       <div className="menu-hero">
        {menu.menuImageUrl ? (
          <img src={menu.menuImageUrl} alt={menu.menuName} className="menu-hero-img" />
        ) : (
          <div className="menu-hero-placeholder">이미지 없음</div>
        )}
      </div>

      {/* 6.2 메뉴 기본 정보 영역 (이름, 설명, 기본 가격) */}
      <div className="menu-info-section">
          <h2 className="menu-title">{menu.menuName}</h2>
          <p className="menu-desc">{menu.menuDescription}</p>
          <div className="menu-price-row">
            <span className="menu-price">{menu.menuPrice.toLocaleString()}원</span>
          </div>
      </div>

      {/* 6.3 옵션 리스트 영역 */}
      <div className="option-list">
        {menu.optionGroups?.map(group => {
            return (
                <div key={group.menuOptionGroupId} className="option-group">
                    {/* 옵션 그룹 헤더 (필수/선택 여부 표시) */}
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
                    
                    {/* 개별 옵션 아이템들 */}
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
                                        {/* 체크박스 UI */}
                                        <div className={`selection-indicator checkbox ${isSelected ? 'selected' : ''}`}>
                                            {isSelected && <HiCheck className="check-icon" />}
                                        </div>
                                        {/* 옵션명 */}
                                        <span className={`option-name ${isSelected ? 'selected-text' : ''}`}>
                                            {opt.menuOptionName}
                                        </span>
                                    </div>
                                    {/* 추가 가격 표시 */}
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

      {/* 6.4 하단 액션 바 (수량 조절 및 담기 버튼) */}
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

      {/* 6.5 장바구니 담기 확인 모달 */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseOrBack}
        title="알림"
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', width: '100%' }}>
            <button 
              onClick={handleCloseOrBack}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: '1px solid #d1d5db',
                backgroundColor: 'white',
                color: '#374151',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              다른 메뉴 보기
            </button>
            <button 
              onClick={handleGoToCart}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#4f46e5',
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              장바구니 이동
            </button>
          </div>
        }
      >
        장바구니에 메뉴를 담았습니다.<br />
        장바구니로 이동하시겠습니까?
      </Modal>
    </div>
  );
}