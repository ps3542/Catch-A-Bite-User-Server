import axiosInstance from "../axios";

const base = "/api/v1/owner";

export const ownerTransactionService = {
  list: async (storeId, params = {}) => {
    const next = { ...params };
    if (next.from && !next.startDate) next.startDate = next.from;
    if (next.to && !next.endDate) next.endDate = next.to;
    if (next.status && !next.transactionStatus) next.transactionStatus = next.status;
    return axiosInstance.get(`${base}/stores/${storeId}/transactions`, { params: next });
  },
};
