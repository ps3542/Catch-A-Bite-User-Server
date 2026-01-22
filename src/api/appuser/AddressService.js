/**
 * AddressService: 배송지 관리 API 통신 모듈
 */
export const addressService = {
  
  // ==========================================================
  // 1. 배송지 추가 (POST)
  // ==========================================================
  createAddress: async (addressData) => {
    const separator = "======================================================================";

    // 유효성 검사
    if (!addressData || !addressData.addressDetail || !addressData.appUserId) {
      console.error(separator);
      console.error("배송지 필수 정보(상세주소, 사용자ID)가 누락되었습니다.");
      console.error(separator);
      throw new Error("배송지 필수 정보를 입력해주세요.");
    }

    try {
      const response = await fetch(`/api/v1/appuser/addresses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(addressData)
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "배송지 등록 실패");
      return result;
    } catch (error) {
      console.error(separator);
      console.error("Address Create Error:", error);
      console.error(separator);
      throw error;
    }
  },

  // ==========================================================
  // 2. 배송지 상세 조회 (GET)
  // ==========================================================
  readAddress: async (addressId) => {
    const separator = "======================================================================";

    if (!addressId || addressId <= 0) {
      console.error(separator);
      console.error("유효하지 않은 주소 ID입니다.");
      console.error(separator);
      throw new Error("유효하지 않은 주소 ID입니다.");
    }

    try {
      const response = await fetch(`/api/v1/appuser/addresses/${addressId}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "배송지 조회 실패");
      return result;
    } catch (error) {
      console.error(separator);
      console.error("Address Read Error:", error);
      console.error(separator);
      throw error;
    }
  },

  // ==========================================================
  // 3. 배송지 수정 (PUT)
  // ==========================================================
  updateAddress: async (addressId, addressData) => {
    const separator = "======================================================================";

    if (!addressId || addressId <= 0) {
      console.error(separator);
      console.error("유효하지 않은 주소 ID입니다.");
      console.error(separator);
      throw new Error("유효하지 않은 주소 ID입니다.");
    }

    try {
      const response = await fetch(`/api/v1/appuser/addresses/${addressId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(addressData)
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "배송지 수정 실패");
      return result;
    } catch (error) {
      console.error(separator);
      console.error("Address Update Error:", error);
      console.error(separator);
      throw error;
    }
  },

  // ==========================================================
  // 4. 배송지 삭제 (DELETE)
  // ==========================================================
  deleteAddress: async (addressId) => {
    const separator = "======================================================================";

    if (!addressId || addressId <= 0) {
      console.error(separator);
      console.error("유효하지 않은 주소 ID입니다.");
      console.error(separator);
      throw new Error("유효하지 않은 주소 ID입니다.");
    }

    try {
      const response = await fetch(`/api/v1/appuser/addresses/${addressId}`, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json' }
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "배송지 삭제 실패");
      return result;
    } catch (error) {
      console.error(separator);
      console.error("Address Delete Error:", error);
      console.error(separator);
      throw error;
    }
  }
};