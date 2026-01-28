import axiosInstance from "../axios";

const base = "/api/v1/owner";

export const ownerMenuOptionService = {
  listGroups: async (menuId) => {
    return axiosInstance.get(`${base}/menus/${menuId}/option-groups`);
  },

  createGroup: async (menuId, payload) => {
    return axiosInstance.post(`${base}/menus/${menuId}/option-groups`, payload);
  },

  updateGroup: async (menuId, menuOptionGroupId, payload) => {
    return axiosInstance.put(
      `${base}/menus/${menuId}/option-groups/${menuOptionGroupId}`,
      payload
    );
  },

  removeGroup: async (menuId, menuOptionGroupId) => {
    return axiosInstance.delete(`${base}/menus/${menuId}/option-groups/${menuOptionGroupId}`);
  },

  listOptions: async (menuId, menuOptionGroupId) => {
    return axiosInstance.get(`${base}/menus/${menuId}/option-groups/${menuOptionGroupId}/options`);
  },

  createOption: async (menuId, menuOptionGroupId, payload) => {
    return axiosInstance.post(
      `${base}/menus/${menuId}/option-groups/${menuOptionGroupId}/options`,
      payload
    );
  },

  updateOption: async (menuId, menuOptionGroupId, menuOptionId, payload) => {
    return axiosInstance.put(
      `${base}/menus/${menuId}/option-groups/${menuOptionGroupId}/options/${menuOptionId}`,
      payload
    );
  },

  removeOption: async (menuId, menuOptionGroupId, menuOptionId) => {
    return axiosInstance.delete(
      `${base}/menus/${menuId}/option-groups/${menuOptionGroupId}/options/${menuOptionId}`
    );
  },
};
