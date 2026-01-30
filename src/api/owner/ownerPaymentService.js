import axiosInstance from "../axios";

const base = "/api/v1/owner";

export const ownerPaymentService = {
  list: async (storeId, params = {}) => {
    const next = { ...params };
    if (next.from && !next.startDate) next.startDate = next.from;
    if (next.to && !next.endDate) next.endDate = next.to;
    return axiosInstance.get(`${base}/stores/${storeId}/payments`, { params: next });
  },
};
