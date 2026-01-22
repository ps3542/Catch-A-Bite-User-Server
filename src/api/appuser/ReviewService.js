/**
 * ReviewService: 리뷰 관리 API 통신 모듈
 * 설명: 리뷰의 생성, 조회, 수정, 삭제를 위한 백엔드 통신을 담당합니다.
 */
export const reviewService = {
  
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
      const response = await fetch(`/api/v1/appuser/reviews/${reviewId}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "리뷰 조회에 실패했습니다.");
      return result;
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

    const params = new URLSearchParams({
      storeOrderId: storeOrderId.toString(),
      rating: rating.toString(),
      content: content
    });

    try {
      const response = await fetch(`/api/v1/appuser/reviews?${params.toString()}`, {
        method: 'POST',
        headers: { 'Accept': 'application/json' }
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "리뷰 등록에 실패했습니다.");
      return result;
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
      const response = await fetch(`/api/v1/appuser/reviews/${reviewId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(updateData)
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "리뷰 수정에 실패했습니다.");
      return result;
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
      const response = await fetch(`/api/v1/appuser/reviews/${reviewId}`, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json' }
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "리뷰 삭제에 실패했습니다.");
      return result;
    } catch (error) {
      console.error(separator);
      console.error("Review Delete Error:", error);
      console.error(separator);
      throw error;
    }
  }
};