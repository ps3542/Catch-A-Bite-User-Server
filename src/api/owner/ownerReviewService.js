import axiosInstance from "../axios";

const base = "/api/v1/owner";

export const ownerReviewService = {
  list: async (storeId) => {
    return axiosInstance.get(`${base}/stores/${storeId}/reviews`);
  },

  reply: async (storeId, reviewId, payload) => {
    return axiosInstance.post(
      `${base}/stores/${storeId}/reviews/${reviewId}/reply`,
      payload
    );
  },
};
