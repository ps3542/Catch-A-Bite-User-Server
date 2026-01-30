import axiosInstance from "../axios";

const base = "/api/v1/owner";

/**
 * Owner 메뉴 API
 * - 기본 CRUD: /stores/{storeId}/menus
 * - 이미지: /stores/{storeId}/menus/with-images, /{menuId}/images...
 */
export const ownerMenuService = {
  list: async (storeId, params = {}) => {
    return axiosInstance.get(`${base}/stores/${storeId}/menus`, { params });
  },

  // 일부 화면(옵션 관리)에서 쓰는 별칭
  getMenus: async (storeId, params = {}) => {
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

  // ===== 메뉴 이미지(백엔드 구현 기준) =====

  createWithImages: async (storeId, menuPayload, imageFiles = []) => {
    const fd = new FormData();
    fd.append(
      "menu",
      new Blob([JSON.stringify(menuPayload)], { type: "application/json" })
    );
    for (const file of imageFiles) fd.append("images", file);

    return axiosInstance.post(`${base}/stores/${storeId}/menus/with-images`, fd, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  listImages: async (storeId, menuId) => {
    return axiosInstance.get(`${base}/stores/${storeId}/menus/${menuId}/images`);
  },

  uploadImages: async (storeId, menuId, imageFiles = [], setFirstAsMain = false) => {
    const fd = new FormData();
    for (const file of imageFiles) fd.append("images", file);

    return axiosInstance.post(`${base}/stores/${storeId}/menus/${menuId}/images/upload`, fd, {
      params: { setFirstAsMain },
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  setMainImage: async (storeId, menuId, menuImageId) => {
    return axiosInstance.patch(
      `${base}/stores/${storeId}/menus/${menuId}/images/${menuImageId}/main`
    );
  },

  deleteImage: async (storeId, menuId, menuImageId) => {
    return axiosInstance.delete(`${base}/stores/${storeId}/menus/${menuId}/images/${menuImageId}`);
  },

    // 메뉴 이미지 URL 단건 등록(매장관리처럼 즉시 반영용)
  addImageByUrl: async (storeId, menuId, payload) => {
    // payload: { menuImageUrl, menuImageIsMain }
    return axiosInstance.post(`${base}/stores/${storeId}/menus/${menuId}/images`, payload);
  },

  // 등록 화면에서 draft 여러개 한 번에 처리(저장 시 등록)
  addImagesByUrl: async (storeId, menuId, urls = [], setFirstAsMain = true) => {
    for (let i = 0; i < urls.length; i++) {
      await axiosInstance.post(`${base}/stores/${storeId}/menus/${menuId}/images`, {
        menuImageUrl: urls[i],
        menuImageIsMain: setFirstAsMain ? i === 0 : false,
      });
    }
  },



};
