import axiosInstance from "../axios";

const base = "/api/v1/owner";

export const ownerPaymentService = {
  list: async (storeId, params = {}) => {
    return axiosInstance.get(`${base}/stores/${storeId}/payments`, { params });
  },
};
