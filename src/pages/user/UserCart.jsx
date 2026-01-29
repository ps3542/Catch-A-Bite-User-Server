import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppUserCartService } from "../../api/appuser/CartService";
import useRoleGuard from "../../hooks/useRoleGuard";
import "./UserCart.css";

export default function UserCart() {
  const { user, loading: authLoading } = useRoleGuard("USER");
  const [cartData, setCartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && user) {
      fetchCart();
    }
  }, [authLoading, user]);

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

  const handleQuantityChange = async (itemId, currentQty, change) => {
    const newQty = currentQty + change;
    if (newQty < 1) return;

    try {
      await AppUserCartService.updateQuantity(itemId, newQty);
      fetchCart(); 
    } catch (error) {
      alert("수량 변경 실패");
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm("장바구니에서 삭제하시겠습니까?")) return;
    try {
      await AppUserCartService.deleteItem(itemId);
      fetchCart();
    } catch (error) {
      alert("삭제 실패");
    }
  };

  const handleOrder = () => {
    navigate("/user/order");
  };

  if (authLoading || loading) {
    return <div className="cart-loading">장바구니 불러오는 중...</div>;
  }

  // Empty State
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

  const totalAmount = cartData.totalFoodPrice + cartData.deliveryCost;
  const isOrderable = cartData.totalFoodPrice >= cartData.minOrderPrice;

  return (
    <div className="cart-page-container">
      <h1 className="cart-page-title">장바구니</h1>

      {/* Store Info Header */}
      <div className="cart-store-header">
        <h2 className="cart-store-name">{cartData.storeName}</h2>
        <span className="cart-min-order">최소주문금액: {cartData.minOrderPrice.toLocaleString()}원</span>
      </div>

      {/* Items List */}
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

            <div className="cart-item-total">
              <div className="cart-total-price">{item.totalItemPrice.toLocaleString()}원</div>
              <button onClick={() => handleDelete(item.cartItemId)} className="cart-delete-btn">
                삭제
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Bill Summary */}
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

      {/* Order Button */}
      <button
        onClick={handleOrder}
        disabled={!isOrderable}
        className={`cart-order-btn ${!isOrderable ? "disabled" : ""}`}
      >
        {!isOrderable
          ? `${(cartData.minOrderPrice - cartData.totalFoodPrice).toLocaleString()}원 더 담아야 배달 가능`
          : "배달 주문하기"}
      </button>
    </div>
  );
}