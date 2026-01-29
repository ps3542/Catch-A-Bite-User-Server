import axiosInstance from "../axios";
import { appUserStoreService } from "./StoreService";

/**
 * StoreOrderService: 사용자 주문 관리 및 자주 찾은 매장 API 모듈
 * * [기능 목록]
 * 1. createOrder: 주문 생성
 * 2. getAllStoreOrdersForId: 사용자별 주문 내역 조회
 * 3. getOrderDetails: 주문 상세 조회
 * 4. cancelOrder: 주문 취소
 * 5. getFrequentStores: 자주 방문한 매장 통계
 */
export const appUserStoreOrderService = {

  // ===================================
  // 1. 주문 생성 (POST)
  // Path: /api/v1/store-orders
  // ===================================
  createOrder: async (orderData) => {
    const separator = "=================================="; // 구분선 길이 단축

    // [유효성 검사] 필수 데이터 확인
    if (!orderData || !orderData.appUserId || !orderData.storeId || !orderData.addressId) {
      console.error(separator);
      console.error("오류: 주문 필수 정보(사용자ID, 가게ID, 주소ID)가 누락되었습니다.");
      console.error(separator);
      throw new Error("주문 정보를 다시 확인해주세요.");
    }
    console.log("StoreOrderService:CreateOrder() 호출됨");
    try {
      const response = await axiosInstance.post('/api/v1/appuser/store-orders', orderData);
      const data = response.data.data;
      console.log(separator);
      console.log("주문 생성 성공!");
      console.log(response);
      console.log("Response.data.data:")
      console.log(data);
      console.log(separator);
      if (data && data.header && data.header.code !== 200 && data.header.code !== 201) {
          throw new Error(data.header.message || "주문 생성 중 알 수 없는 오류가 발생했습니다.");
      }

      return data;
    } catch (error) {
      console.error(separator);
      console.error("주문 생성 실패:", error);
      console.error(separator);
      throw error;
    }
  },

  // ===================================
  // 2. 주문 내역 목록 조회 (GET)
  // Path: /api/v1/store-orders/user/{userId}
  // ===================================
  getAllStoreOrdersForId : async (appUserId) => {
    const separator = "==================================";

    if (!appUserId || appUserId <= 0) {
      console.error(separator);
      console.error("오류: 유효하지 않은 사용자 ID입니다.");
      console.error(separator);
      throw new Error("로그인이 필요합니다.");
    }

    try {
      console.log("StoreOrder - GetAllStoreOrderforId");
      console.log("appUserId: ", appUserId);
      const response = await axiosInstance.get(`/api/v1/appuser/store-orders/user/${appUserId}`);
      return response.data.data; 
    } catch (error) {
      console.error(separator);
      console.error("주문 내역 조회 실패:", error);
      console.error(separator);
      throw error;
    }
  },

  // ===================================
  // 3. 주문 상세 조회 (GET)
  // Path: /api/v1/store-orders/{orderId}
  // ===================================
  getOrderDetails: async (orderId) => {
    const separator = "==================================";

    if (!orderId || orderId <= 0) {
      console.error(separator);
      console.error("오류: 유효하지 않은 주문 ID입니다.");
      console.error(separator);
      throw new Error("유효하지 않은 주문 ID입니다.");
    }

    try {
      const response = await axiosInstance.get(`/api/v1/appuser/store-orders/${orderId}`);
      return response.data.data;
    } catch (error) {
      console.error(separator);
      console.error("주문 상세 조회 실패:", error);
      console.error(separator);
      throw error;
    }
  },

  // ===================================
  // 4. 주문 취소 (DELETE)
  // Path: /api/v1/store-orders/{orderId}
  // ===================================
  cancelOrder: async (orderId) => {
    const separator = "==================================";

    if (!orderId || orderId <= 0) {
      console.error(separator);
      console.error("오류: 유효하지 않은 주문 ID입니다.");
      console.error(separator);
      throw new Error("취소할 주문 ID가 올바르지 않습니다.");
    }

    try {
      // POST /cancel 대신 표준 REST 방식인 DELETE 사용
      const response = await axiosInstance.delete(`/api/v1/appuser/store-orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error(separator);
      console.error("주문 취소 실패:", error);
      console.error(separator);
      throw error;
    }
  },

  // ===================================
  // 5. 자주 방문한 매장 조회
  // (내부적으로 주문 내역을 조회하여 계산)
  // ===================================
  getFrequentStores: async (appUserId) => {
    const separator = "==================================";
    
    if (!appUserId) return [];

    try {
      const response = await axiosInstance.get(`/api/v1/appuser/store-orders/frequent`, {
        params: { userId: appUserId }
      });
      
      // ApiResponse 구조에 따라 데이터 반환
      // console.log("GetFrequentStores!!!!");
      // console.log(response.data.data);
      return response.data.data || [];

    } catch (error) {
      console.error(separator);
      console.error("자주 방문한 매장 조회 실패:", error);
      console.error(separator);
      return []; // 에러 발생 시 빈 배열 반환하여 화면 깨짐 방지
    }
  },

  getOrderDetails: async (orderId) => {
    const separator = "==================================";

        try {
            // Adjust endpoint to match your Backend Controller
            const response = await axiosInstance.get(`/api/v1/appuser/store-orders/${orderId}`);
            console.log(separator);
            console.log("response.data.data");
            console.log(response.data.data);
            console.log(separator);
            return response.data.data;
        } catch (error) {
            throw error;
        }
    }
}

export default appUserStoreOrderService;