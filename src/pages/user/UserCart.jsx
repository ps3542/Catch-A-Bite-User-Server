// Project Name: catchabite
// File Name: src/pages/user/UserCart.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppUserCartService } from "../../api/appuser/CartService";
import useRoleGuard from "../../hooks/useRoleGuard";
import Modal from "../../components/common/Modal"; // 모달 컴포넌트 임포트
import "./UserCart.css";

export default function UserCart() {
  // ========================================================================================
  // [1. 상태(State) 및 훅(Hooks) 정의]
  // ========================================================================================
  const { user, loading: authLoading } = useRoleGuard("USER"); // 권한 체크
  const [cartData, setCartData] = useState(null);              // 장바구니 데이터
  const [loading, setLoading] = useState(true);                // 로딩 상태
  const navigate = useNavigate();

  // 모달 관련 상태 (삭제 확인용)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);  // 삭제할 아이템 ID 저장

  // ========================================================================================
  // [2. 초기화 및 데이터 로드]
  // ========================================================================================
  useEffect(() => {
    if (!authLoading && user) {
      fetchCart();
    }
  }, [authLoading, user]);

  /**
   * 장바구니 데이터를 서버로부터 조회합니다.
   */
  const fetchCart = async () => {
    try {
      setLoading(true);
      const response = await AppUserCartService.getMyCart();
      if (response && response.data) {
        setCartData(response.data);
      } else {
        setCartData(null);
      }
    } catch (error) {
      console.error("Error loading cart", error);
    } finally {
      setLoading(false);
    }
  };

  // ========================================================================================
  // [3. 비즈니스 로직: 수량 변경 및 삭제]
  // ========================================================================================
  /**
   * 장바구니 아이템의 수량을 변경합니다.
   * @param {number} itemId - 변경할 아이템 ID
   * @param {number} currentQty - 현재 수량
   * @param {number} change - 변경 수치 (+1 또는 -1)
   */
  const handleQuantityChange = async (itemId, currentQty, change) => {
    const newQty = currentQty + change;
    if (newQty < 1) return; // 수량은 1개 이상이어야 함

    try {
      await AppUserCartService.updateQuantity(itemId, newQty);
      fetchCart(); // 변경 후 데이터 갱신
    } catch (error) {
      alert("수량 변경 실패");
    }
  };

  /**
   * [삭제 요청] 사용자가 삭제 버튼을 클릭했을 때 실행됩니다.
   * 즉시 삭제하지 않고 확인 모달을 띄웁니다.
   * @param {number} itemId - 삭제할 아이템 ID
   */
  const handleDeleteRequest = (itemId) => {
    setDeleteTargetId(itemId);
    setIsModalOpen(true);
  };

  /**
   * [삭제 확정] 모달에서 '삭제'를 눌렀을 때 실행됩니다.
   * 실제 API를 호출하여 아이템을 제거합니다.
   */
  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;

    try {
      await AppUserCartService.deleteItem(deleteTargetId);
      fetchCart(); // 삭제 후 데이터 갱신
    } catch (error) {
      alert("삭제 실패");
    } finally {
      // 모달 상태 초기화
      setIsModalOpen(false);
      setDeleteTargetId(null);
    }
  };

  /**
   * 모달 닫기 핸들러
   */
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setDeleteTargetId(null);
  };

  // ========================================================================================
  // [4. 주문 페이지 이동]
  // ========================================================================================
  const handleOrder = () => {
    navigate("/user/order");
  };

  // ========================================================================================
  // [5. 렌더링 (View)]
  // ========================================================================================
  
  // 5.1 로딩 상태
  if (authLoading || loading) {
    return <div className="cart-loading">장바구니 불러오는 중...</div>;
  }

  // 5.2 빈 장바구니 상태
  if (!cartData || !cartData.items || cartData.items.length === 0) {
    return (
      <div className="cart-empty-container">
        <div className="cart-empty-icon">🛒</div>
        <h2 className="cart-empty-title">장바구니가 비어있습니다</h2>
        <p className="cart-empty-desc">맛있는 음식을 담아보세요!</p>
        <button onClick={() => navigate("/user/main")} className="cart-empty-btn">
          메뉴 보러가기
        </button>
      </div>
    );
  }

  // 5.3 결제 금액 계산
  const totalAmount = cartData.totalFoodPrice + cartData.deliveryCost;
  const isOrderable = cartData.totalFoodPrice >= cartData.minOrderPrice;

  return (
    <div className="cart-page-container">
      <h1 className="cart-page-title">장바구니</h1>

      {/* 5.4 가게 정보 헤더 */}
      <div className="cart-store-header">
        <h2 className="cart-store-name">{cartData.storeName}</h2>
        <span className="cart-min-order">최소주문금액: {cartData.minOrderPrice.toLocaleString()}원</span>
      </div>

      {/* 5.5 장바구니 아이템 리스트 */}
      <div className="cart-items-list">
        {cartData.items.map((item) => (
          <div key={item.cartItemId} className="cart-item">
            <div className="cart-item-info">
              <h3 className="cart-item-name">{item.menuName}</h3>
              {item.menuOptions && item.menuOptions.length > 0 && (
                <div className="cart-item-options-list">
                  {item.menuOptions.map((opt, idx) => (
                    <span key={idx} className="cart-option-text">- {opt}</span>
                  ))}
                </div>
              )}
              <p className="cart-item-price">{item.menuPrice.toLocaleString()}원</p>
            </div>

            {/* 수량 조절 버튼 */}
            <div className="cart-qty-control">
              <button
                onClick={() => handleQuantityChange(item.cartItemId, item.cartItemQuantity, -1)}
                className="cart-qty-btn"
              >
                -
              </button>
              <span className="cart-qty-val">{item.cartItemQuantity}</span>
              <button
                onClick={() => handleQuantityChange(item.cartItemId, item.cartItemQuantity, 1)}
                className="cart-qty-btn"
              >
                +
              </button>
            </div>

            {/* 아이템 가격 및 삭제 버튼 */}
            <div className="cart-item-total">
              <div className="cart-total-price">{item.totalItemPrice.toLocaleString()}원</div>
              <button 
                onClick={() => handleDeleteRequest(item.cartItemId)} 
                className="cart-delete-btn"
              >
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 5.6 결제 금액 요약 */}
      <div className="cart-bill-summary">
        <div className="cart-bill-row">
          <span>총 주문금액</span>
          <span className="cart-bill-val">{cartData.totalFoodPrice.toLocaleString()}원</span>
        </div>
        <div className="cart-bill-row cart-divider">
          <span>배달팁</span>
          <span className="cart-bill-val">{cartData.deliveryCost.toLocaleString()}원</span>
        </div>
        <div className="cart-bill-total-row">
          <span>결제예정금액</span>
          <span className="cart-final-price">{totalAmount.toLocaleString()}원</span>
        </div>
      </div>

      {/* 5.7 주문하기 버튼 */}
      <button
        onClick={handleOrder}
        disabled={!isOrderable}
        className={`cart-order-btn ${!isOrderable ? "disabled" : ""}`}
      >
        {!isOrderable
          ? `${(cartData.minOrderPrice - cartData.totalFoodPrice).toLocaleString()}원 더 담아야 배달 가능`
          : "배달 주문하기"}
      </button>

      {/* 5.8 삭제 확인 모달 */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title="삭제 확인"
        footer={
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', width: '100%' }}>
            <button 
              onClick={handleCloseModal}
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
              취소
            </button>
            <button 
              onClick={handleConfirmDelete}
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#4f46e5', // UserCart 테마 색상 (오렌지) 적용
                color: 'white',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              삭제
            </button>
          </div>
        }
      >
        해당 메뉴를 장바구니에서 삭제하시겠습니까?
      </Modal>
    </div>
  );
}