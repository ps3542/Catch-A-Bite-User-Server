import axiosInstance from "../axios";

const base = "/api/v1/owner";

export const ownerOrderService = {
  list: async (storeId, params = {}) => {
    return axiosInstance.get(`${base}/stores/${storeId}/orders`, { params });
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

  delivered: async (storeId, orderId) => {
    return axiosInstance.patch(`${base}/stores/${storeId}/orders/${orderId}/delivered`);
  },
};
