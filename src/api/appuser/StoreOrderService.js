/**
 * UserOrderService: 사용자 주문 관리 API 통신 모듈
 */
export const userOrderService = {

  // ==========================================================
  // 1. 주문 생성 (POST)
  // ==========================================================
  createOrder: async (orderData) => {
    const separator = "======================================================================";

    if (!orderData || !orderData.appUserId || !orderData.items) {
      console.error(separator);
      console.error("주문 필수 정보가 누락되었습니다.");
      console.error(separator);
      throw new Error("주문 정보를 확인해주세요.");
    }

    try {
      const response = await fetch(`/api/v1/appuser/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(orderData)
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "주문 생성 실패");
      return result;
    } catch (error) {
      console.error(separator);
      console.error("Order Create Error:", error);
      console.error(separator);
      throw error;
    }
  },

  // ==========================================================
  // 2. 주문 내역 목록 조회 (GET)
  // ==========================================================
  getOrders: async (appUserId) => {
    const separator = "======================================================================";

    if (!appUserId || appUserId <= 0) {
      console.error(separator);
      console.error("유효하지 않은 사용자 ID입니다.");
      console.error(separator);
      throw new Error("로그인이 필요합니다.");
    }

    try {
      const response = await fetch(`/api/v1/appuser/orders?appUserId=${appUserId}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "주문 내역 조회 실패");
      return result;
    } catch (error) {
      console.error(separator);
      console.error("Order List Error:", error);
      console.error(separator);
      throw error;
    }
  },

  // ==========================================================
  // 3. 주문 상세 조회 (GET)
  // ==========================================================
  getOrderDetails: async (orderId) => {
    const separator = "======================================================================";

    if (!orderId || orderId <= 0) {
      console.error(separator);
      console.error("유효하지 않은 주문 ID입니다.");
      console.error(separator);
      throw new Error("유효하지 않은 주문 ID입니다.");
    }

    try {
      const response = await fetch(`/api/v1/appuser/orders/${orderId}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "주문 상세 조회 실패");
      return result;
    } catch (error) {
      console.error(separator);
      console.error("Order Detail Error:", error);
      console.error(separator);
      throw error;
    }
  },

  // ==========================================================
  // 4. 주문 취소 (POST)
  // ==========================================================
  cancelOrder: async (orderId) => {
    const separator = "======================================================================";

    if (!orderId || orderId <= 0) {
      console.error(separator);
      console.error("유효하지 않은 주문 ID입니다.");
      console.error(separator);
      throw new Error("유효하지 않은 주문 ID입니다.");
    }

    try {
      const response = await fetch(`/api/v1/appuser/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: { 'Accept': 'application/json' }
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "주문 취소 실패");
      return result;
    } catch (error) {
      console.error(separator);
      console.error("Order Cancel Error:", error);
      console.error(separator);
      throw error;
    }
  }
};