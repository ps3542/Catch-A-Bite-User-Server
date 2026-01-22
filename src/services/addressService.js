import axiosInstance from "../api/axios";

export const addressService = {
  getMyAddresses: async () => {
    try {
      // API: GET /api/v1/addresses/me
      const response = await axiosInstance.get("/api/v1/addresses/me");
      return response;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "요청 처리 중 오류가 발생했습니다.";
      const nextError = new Error(message);
      if (error?.response) {
        nextError.response = error.response;
      }
      throw nextError;
    }
  },

  createAddress: async (payload) => {
    try {
      // API: POST /api/v1/addresses
      const response = await axiosInstance.post("/api/v1/addresses", payload);
      return response;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "요청 처리 중 오류가 발생했습니다.";
      const nextError = new Error(message);
      if (error?.response) {
        nextError.response = error.response;
      }
      throw nextError;
    }
  },

  updateAddress: async (addressId, payload) => {
    if (!addressId) {
      throw new Error("주소 정보가 필요합니다.");
    }
    try {
      // API: PATCH /api/v1/addresses/{id}
      const response = await axiosInstance.patch(
        `/api/v1/addresses/${addressId}`,
        payload
      );
      return response;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "요청 처리 중 오류가 발생했습니다.";
      const nextError = new Error(message);
      if (error?.response) {
        nextError.response = error.response;
      }
      throw nextError;
    }
  },

  deleteAddress: async (addressId) => {
    if (!addressId) {
      throw new Error("주소 정보가 필요합니다.");
    }
    try {
      // API: DELETE /api/v1/addresses/{id}
      const response = await axiosInstance.delete(
        `/api/v1/addresses/${addressId}`
      );
      return response;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "요청 처리 중 오류가 발생했습니다.";
      const nextError = new Error(message);
      if (error?.response) {
        nextError.response = error.response;
      }
      throw nextError;
    }
  },

  setDefault: async (addressId) => {
    if (!addressId) {
      throw new Error("주소 정보가 필요합니다.");
    }
    try {
      // API: POST /api/v1/addresses/{id}/default
      const response = await axiosInstance.post(
        `/api/v1/addresses/${addressId}/default`
      );
      return response;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "요청 처리 중 오류가 발생했습니다.";
      const nextError = new Error(message);
      if (error?.response) {
        nextError.response = error.response;
      }
      throw nextError;
    }
  },
};

export const {
  getMyAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefault,
} = addressService;
