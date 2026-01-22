/**
 * UserOrderService: 사용자 주문 관리 API 통신 모듈
 * 카트에 존재하는 아이템들을 가지고 주문페이지를 생성함
 * 이 후 결재해야 함.
 * 필요
 * // 주문 생성 시 보낼 데이터 예시
 * const orderData = {
 *     appUserId: 101,       // [필수] 주문하는 사용자 ID (로그인 정보)
 *     storeId: 5,           // [필수] 주문할 가게 ID (이 가게의 장바구니를 가져옴)
 *     addressId: 25,        // [필수] 배달 받을 주소 ID (사용자가 선택한 주소)
 *     orderDeliveryFee: 9856 // [선택] 배달비 (화면에 표시된 배달비를 보냄, 서버 정책에 따름)
 * };
 */
export const userOrderService = {

  // ==========================================================
  // 1. 주문 생성 (POST) - 장바구니 기반 주문 접수
  // ==========================================================
  createOrder: async (orderData) => {
    const separator = "======================================================================";

    // [변경] items 검사 제거, storeId 검사 추가
    // 백엔드에서 (userId + storeId)로 장바구니를 조회하여 주문을 생성하므로 storeId가 필수입니다.
    if (!orderData || !orderData.appUserId || !orderData.storeId || !orderData.addressId) {
      console.error(separator);
      console.error("주문 필수 정보(사용자ID, 가게ID, 배송지ID)가 누락되었습니다.");
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