import axiosInstance from "../axios";

/**
 * StoreService: 매장 검색 및 조회 API 통신 모듈
 */
export const appUserStoreService = {

  // ==========================================================
  // 1. 매장 검색 (GET)
  // ==========================================================
  searchStores: async (keyword) => {
    const separator = "======================================================================";

    if (!keyword || !keyword.trim()) {
      console.error(separator);
      console.error("검색어가 비어있습니다.");
      console.error(separator);
      throw new Error("검색어를 입력해주세요.");
    }

    try {
      // API: GET /api/v1/appuser/stores/search?keyword=...
      const response = await axiosInstance.get('/api/v1/appuser/stores/search', {
        params: { keyword: keyword }
      });

      // Axios returns the payload in response.data
      return response.data;
    } catch (error) {
      console.error(separator);
      console.error("Store Search Error:", error);
      console.error(separator);
      throw error;
    }
  },

  // ==========================================================
  // 2. 카테고리별 매장 조회 (GET)
  // ==========================================================
  getStoresByCategory: async (categoryName) => {
    const separator = "======================================================================";

    if (!categoryName) {
      console.error(separator);
      console.error("카테고리명이 없습니다.");
      console.error(separator);
      throw new Error("카테고리를 선택해주세요.");
    }

    try {      
      const response = await axiosInstance.get('/api/v1/appuser/stores/category', {
        params: { storeCategory: categoryName }
      });
      console.log(separator);
      console.log("StoreService - GetStoresByCategory - Response");
      console.log(response);
      console.log(separator);
      console.log(response.data);
      console.log(separator);

      return response.data;
    } catch (error) {
      console.error(separator);
      console.error("Store Category Error:", error);
      console.error(separator);
      throw error;
    }
  },

  // ==========================================================
  // 3. 매장 상세 조회 (GET)
  // ==========================================================
  getStoreDetails: async (storeId) => {
    const separator = "======================================================================";
    
    // [LOG] Entry
    //console.log(`[appUserStoreService] getStoreDetails (storeId: ${storeId})`);

    if (!storeId || storeId <= 0) {
      console.error("[appUserStoreService] Error: Invalid Store ID");
      throw new Error("유효하지 않은 매장 ID입니다.");
    }

    try {
      // API: GET /api/v1/appuser/stores/{storeId}
      const response = await axiosInstance.get(`/api/v1/appuser/stores/${storeId}`);

      // 200 확인 전용
      //console.log(`[appUserStoreService] HTTP Status: ${response.status}`);

      // 204 No Content handling
      if (response.status === 204) {
        console.log("[appUserStoreService] EXIT - No Content");
        return null;
      }

      const result = response.data;

      // [LOG] Inspect the raw structure from backend
      //console.log("[appUserStoreService] Raw Backend Response:", result);

      // Unwrap logic: If result has a .data property (ApiResponse), use it. Otherwise use result directly.
      const finalData = result.data ? result.data : result;

      // [LOG] Exit with final data
      //console.log(separator);
      //console.log("[appUserStoreService] EXIT - Returning Data:", finalData);
      //console.log(separator);

      return finalData;

    } catch (error) {
      console.error(separator);
      console.error("[appUserStoreService] CRITICAL ERROR:", error);
      console.error(separator);
      throw error;
    }
  },

  // ==========================================================
  // 4. 매장 메뉴 조회 (GET)
  // ==========================================================
  getStoreMenus: async (storeId) => {
    const separator = "======================================================================";

    if (!storeId || storeId <= 0) {
      console.error(separator);
      console.error("유효하지 않은 매장 ID입니다.");
      console.error(separator);
      throw new Error("유효하지 않은 매장 ID입니다.");
    }

    try {
      // API: GET /api/v1/appuser/stores/{storeId}/menus
      const response = await axiosInstance.get(`/api/v1/appuser/stores/${storeId}/menus`);
      return response.data;
    } catch (error) {
      console.error(separator);
      console.error("Store Menus Error:", error);
      console.error(separator);
      throw error;
    }
  },

  // ==========================================================
  // 5. 전체 매장 목록 조회 (GET)
  // 모든 OPEN한 매장 목록을 호출함
  // ==========================================================
  getRandomStores: async () => {
    try {
      // API: GET /api/v1/appuser/stores/random
      const response = await axiosInstance.get('/api/v1/appuser/stores/random');
      
      const result = response.data;
      // Return .data if wrapped in ApiResponse, else return result
      return result.data || result; 
    } catch (error) {
      console.error("Random Store Error:", error);
      throw error;
    }
  },

  // ==========================================================
  // 6. 즐겨찾기 매장 조회 (GET)
  // ==========================================================
  getFavoriteStores: async () => {
    try {
      // API: GET /api/v1/appuser/favorites
      const response = await axiosInstance.get('/api/v1/appuser/favorites');
      
      const result = response.data;
      return result.data || result; 
    } catch (error) {
      console.error("Favorite Fetch Error:", error);
      throw error;
    }
  },

  // ==========================================================
  // 7. 메뉴 상세 조회 (옵션 포함)
  // ==========================================================
  getMenuDetail: async (menuId) => {
    if (!menuId) throw new Error("Menu ID is required");
    
    try {
      // API: GET /api/v1/appuser/menus/{menuId}
      const response = await axiosInstance.get(`/api/v1/appuser/menus/${menuId}`);
      const result = response.data;
      return result.data || result;
    } catch (error) {
      console.error("Menu Detail Error:", error);
      throw error;
    }
  }
};

export default appUserStoreService;