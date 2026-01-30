import axiosInstance from "../axios";

const base = "/api/v1/owner";

export const ownerReviewService = {
  list: async (storeId, params = { page: 0, size: 20 }) => {
    return axiosInstance.get(`${base}/stores/${storeId}/reviews`, { params });
  },

  reply: async (storeId, reviewId, payload) => {
    return axiosInstance.post(
      `${base}/stores/${storeId}/reviews/${reviewId}/reply`,
      payload
    );
  },
};
