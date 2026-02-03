import axiosInstance from "../axios";

const base = "/api/v1/owner/stores";

export const ownerStoreImageService = {
  list: async (storeId) => axiosInstance.get(`${base}/${storeId}/images`),

  // 백엔드는 multipart가 아니라 url 저장 방식(StoreImageDTO)
  create: async (storeId, payload) => axiosInstance.post(`${base}/${storeId}/images`, payload),

  remove: async (storeId, storeImageId) =>
    axiosInstance.delete(`${base}/${storeId}/images/${storeImageId}`),

  delete: async (storeId, storeImageId) =>
    axiosInstance.delete(`${base}/${storeId}/images/${storeImageId}`),
};
