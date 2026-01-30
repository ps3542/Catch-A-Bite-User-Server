import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { appUserStoreOrderService } from "../../api/appuser/StoreOrderService";
import { getMe } from "../../services/authService";
import "./UserOrderHistory.css";

export default function UserOrderHistory() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      setLoading(true);
      
      // 1. 사용자 정보 가져오기
      const meResponse = await getMe();
      const user = meResponse.data;
      const userId = user.userId; 

      // 2. 사용자의 전체 주문 목록 조회 (이제 여기에 items와 storeName이 포함됨)
      if (userId) {
        const orderList = await appUserStoreOrderService.getAllStoreOrdersForId(userId);

        // 3. 최신순 정렬 (orderDate 기준)
        const safeList = Array.isArray(orderList) ? orderList : [];
        const sortedData = safeList.sort((a, b) => {
          return new Date(b.orderDate) - new Date(a.orderDate);
        });

        setOrders(sortedData);
      }
    } catch (error) {
      console.error("주문 내역 로드 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  // 날짜 포맷 헬퍼
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("ko-KR", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  // 메뉴 요약 헬퍼
  const formatMenuSummary = (items) => {
    if (!items || items.length === 0) return "메뉴 정보 없음";
    
    // DTO 필드명에 맞춰 수정 (orderItemName)
    const firstItemName = items[0].orderItemName || items[0].menuName || "주문 상품";
    
    if (items.length === 1) return firstItemName;
    return `${firstItemName} 외 ${items.length - 1}개`;
  };

  return (
    <div className="order-history-page">
      <div className="order-list-container">
        {loading ? (
          <div className="empty-state">주문 내역을 불러오는 중...</div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <p>주문 내역이 없습니다.</p>
          </div>
        ) : (
          orders.map((order) => (
            <div key={order.orderId} className="order-card">
              <div className="card-top">
                {/* storeName이 DTO에 추가되었으므로 바로 사용 가능 */}
                <span className="store-name">{order.storeName || `가게 #${order.storeId}`}</span>
                
                {/* Updated: Navigation to UserCurrentOrder */}
                <button 
                  className="detail-btn"
                  onClick={() => navigate(`/user/currentOrder/${order.orderId}`)} 
                >
                  상세보기
                </button>
              </div>

              <div className="order-date">
                주문 일시 {formatDate(order.orderDate)}
              </div>

              <div className="menu-info">
                {/* orderItems가 DTO에 추가되었으므로 바로 사용 가능 */}
                <span>• {formatMenuSummary(order.orderItems)}</span>
                <span style={{ margin: "0 4px" }}>·</span>
                <span>{order.orderTotalPrice?.toLocaleString()}원</span>
              </div>

              <div className="card-actions">
                <button 
                  className="review-btn"
                  onClick={() => navigate(`/user/review/write?orderId=${order.orderId}`)}
                >
                  리뷰쓰기
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}