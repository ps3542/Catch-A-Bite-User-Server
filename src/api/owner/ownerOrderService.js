import axiosInstance from "../axios";

const base = "/api/v1/owner";

export const ownerOrderService = {
  list: async (storeId, params = {}) => {
    // 다양한 백엔드 파라미터 네이밍을 흡수(서버가 모르는 파라미터는 무시하므로 안전)
    const next = { ...params };

    // 기간
    if (next.from && !next.startDate) next.startDate = next.from;
    if (next.to && !next.endDate) next.endDate = next.to;

    // 상태
    if (next.status && !next.orderStatus) next.orderStatus = next.status;

    return axiosInstance.get(`${base}/stores/${storeId}/orders`, { params: next });
  },

  detail: async (storeId, orderId) => {
    return axiosInstance.get(`${base}/stores/${storeId}/orders/${orderId}`);
  },

  accept: async (storeId, orderId) => {
    return axiosInstance.patch(`${base}/stores/${storeId}/orders/${orderId}/accept`);
  },

  reject: async (storeId, orderId, payload) => {
    return axiosInstance.patch(`${base}/stores/${storeId}/orders/${orderId}/reject`, payload);
  },

  cooked: async (storeId, orderId) => {
    return axiosInstance.patch(`${base}/stores/${storeId}/orders/${orderId}/cooked`);
  },
};
