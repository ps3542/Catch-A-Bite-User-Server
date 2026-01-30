/**
 * ReviewService: 리뷰 관리 API 통신 모듈
 * 설명: 리뷰의 생성, 조회, 수정, 삭제를 위한 백엔드 통신을 담당합니다.
 */
import axiosInstance from "../axios";

/**
 * ReviewService: 리뷰 관리 API 통신 모듈
 */
export const appUserReviewService = {
  
  // ==========================================================
  // 1. 리뷰 상세 조회 (GET)
  // ==========================================================
  getReview: async (reviewId) => {
    const separator = "======================================================================";
    
    if (!reviewId || typeof reviewId !== 'number' || reviewId <= 0) {
      console.error(separator);
      console.error("유효하지 않은 리뷰 ID입니다.");
      console.error(separator);
      throw new Error("유효하지 않은 리뷰 ID입니다.");
    }

    try {
      const response = await axiosInstance.get(`/api/v1/appuser/reviews/${reviewId}`);
      return response.data;
    } catch (error) {
      console.error(separator);
      console.error("Review Get Error:", error);
      console.error(separator);
      throw error;
    }
  },

  // ==========================================================
  // 2. 리뷰 작성 (POST) - @RequestParam 방식
  // ==========================================================
  createReview: async (storeOrderId, rating, content) => {
    const separator = "======================================================================";

    if (!storeOrderId || storeOrderId <= 0) {
      console.error(separator);
      console.error("유효하지 않은 주문 ID입니다.");
      console.error(separator);
      throw new Error("유효하지 않은 주문 ID입니다.");
    }

    try {
      // Axios: send null as body, parameters in config.params
      const response = await axiosInstance.post('/api/v1/appuser/reviews', null, {
        params: {
          storeOrderId,
          rating,
          content
        }
      });
      return response.data;
    } catch (error) {
      console.error(separator);
      console.error("Review Create Error:", error);
      console.error(separator);
      throw error;
    }
  },

  // ==========================================================
  // 3. 리뷰 수정 (PUT) - @RequestBody 방식
  // ==========================================================
  updateReview: async (reviewId, updateData) => {
    const separator = "======================================================================";

    if (!reviewId || reviewId <= 0) {
      console.error(separator);
      console.error("유효하지 않은 리뷰 ID입니다.");
      console.error(separator);
      throw new Error("유효하지 않은 리뷰 ID입니다.");
    }

    try {
      const response = await axiosInstance.put(`/api/v1/appuser/reviews/${reviewId}`, updateData);
      return response.data;
    } catch (error) {
      console.error(separator);
      console.error("Review Update Error:", error);
      console.error(separator);
      throw error;
    }
  },

  // ==========================================================
  // 4. 리뷰 삭제 (DELETE)
  // ==========================================================
  deleteReview: async (reviewId) => {
    const separator = "======================================================================";

    if (!reviewId || reviewId <= 0) {
      console.error(separator);
      console.error("유효하지 않은 리뷰 ID입니다.");
      console.error(separator);
      throw new Error("유효하지 않은 리뷰 ID입니다.");
    }

    try {
      const response = await axiosInstance.delete(`/api/v1/appuser/reviews/${reviewId}`);
      return response.data;
    } catch (error) {
      console.error(separator);
      console.error("Review Delete Error:", error);
      console.error(separator);
      throw error;
    }
  },

  // ==========================================================
  // 5. 가게별 리뷰 목록 조회 (GET)
  // ==========================================================
  getStoreReviews: async (storeId, page = 0, size = 10) => {
    const separator = "======================================================================";
    if (!storeId) throw new Error("Store ID is required");

    try {
      const response = await axiosInstance.get(`/api/v1/appuser/reviews/store/${storeId}`, {
        params: { page, size }
      });
      return response.data;
    } catch (error) {
      console.error(separator);
      console.error("Review List Fetch Error:", error);
      console.error(separator);
      throw error;
    }
  }
}

export default appUserReviewService;