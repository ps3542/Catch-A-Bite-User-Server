import axiosInstance from "../axios";

const base = "/api/v1/owner";

export const ownerMenuCategoryService = {
  list: async (storeId) => {
    return axiosInstance.get(`${base}/stores/${storeId}/menu-categories`);
  },

  create: async (storeId, payload) => {
    return axiosInstance.post(`${base}/stores/${storeId}/menu-categories`, payload);
  },

  update: async (storeId, menuCategoryId, payload) => {
    return axiosInstance.put(
      `${base}/stores/${storeId}/menu-categories/${menuCategoryId}`,
      payload
    );
  },

  remove: async (storeId, menuCategoryId) => {
    return axiosInstance.delete(`${base}/stores/${storeId}/menu-categories/${menuCategoryId}`);
  },
};
