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
      const response = await fetch(`/api/v1/appuser/stores/search?keyword=${encodeURIComponent(keyword)}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "매장 검색 실패");
      return result;
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
      const response = await fetch(`/api/v1/appuser/stores/category?name=${encodeURIComponent(categoryName)}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "카테고리 조회 실패");
      return result;
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
    console.log(separator);
    console.log(`[StoreService] ENTER getStoreDetails (storeId: ${storeId})`);

    if (!storeId || storeId <= 0) {
      console.error("[StoreService] Error: Invalid Store ID");
      throw new Error("유효하지 않은 매장 ID입니다.");
    }

    try {
      const response = await fetch(`/api/v1/appuser/stores/${storeId}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      console.log(`[StoreService] HTTP Status: ${response.status}`);

      // 204 No Content
      if (response.status === 204) {
        console.log("[StoreService] EXIT - No Content");
        return null;
      }

      const result = await response.json();

      // [LOG] Inspect the raw structure from backend
      console.log("[StoreService] Raw Backend Response:", result);

      if (!response.ok) {
        throw new Error(result.message || "매장 상세 조회 실패");
      }

      
      // If result has a .data property (ApiResponse), use it. Otherwise use result directly.
      const finalData = result.data ? result.data : result;

      // [LOG] Exit with final data
      console.log("[StoreService] EXIT - Returning Data:", finalData);
      console.log(separator);

      return finalData;

    } catch (error) {
      console.error(separator);
      console.error("[StoreService] CRITICAL ERROR:", error);
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
      const response = await fetch(`/api/v1/appuser/stores/${storeId}/menus`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "메뉴 조회 실패");
      return result;
    } catch (error) {
      console.error(separator);
      console.error("Store Menus Error:", error);
      console.error(separator);
      throw error;
    }
  },

  // ==========================================================
  // 5. 전체 매장 목록 조회 (GET)
  // ==========================================================
  getRandomStores: async () => {
    try {
      const response = await fetch(`/api/v1/appuser/stores/random`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "매장 조회 실패");
      
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
      const response = await fetch(`/api/v1/appuser/favorites`, {
        method: 'GET',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json' 
          // Note: Credentials (cookies) are usually handled automatically by the browser
        }
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "즐겨찾기 조회 실패");
      
      // Return the data list (List<UserFavoriteStoreResponseDTO>)
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
      const response = await fetch(`/api/v1/appuser/menus/${menuId}`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "메뉴 상세 조회 실패");
      return result.data || result;
    } catch (error) {
      console.error("Menu Detail Error:", error);
      throw error;
    }
  }
};