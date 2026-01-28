import axiosInstance from "../axios";

const base = "/api/v1/owner";

export const ownerMenuService = {
  list: async (storeId, params = {}) => {
    return axiosInstance.get(`${base}/stores/${storeId}/menus`, { params });
  },

  create: async (storeId, payload) => {
    return axiosInstance.post(`${base}/stores/${storeId}/menus`, payload);
  },

  update: async (storeId, menuId, payload) => {
    return axiosInstance.put(`${base}/stores/${storeId}/menus/${menuId}`, payload);
  },

  changeAvailability: async (storeId, menuId, menuIsAvailable) => {
    return axiosInstance.patch(`${base}/stores/${storeId}/menus/${menuId}/availability`, {
      menuIsAvailable,
    });
  },

  remove: async (storeId, menuId) => {
    return axiosInstance.delete(`${base}/stores/${storeId}/menus/${menuId}`);
  },
};
