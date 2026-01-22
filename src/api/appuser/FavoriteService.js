export const appUserFavoriteService = {
  // Add a store to favorites
  addFavorite: async (storeId) => {
    try {
      const response = await fetch(`/api/v1/appuser/favorites`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ storeId })
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "즐겨찾기 추가 실패");
      return result.data; // Returns the created FavoriteStoreDTO
    } catch (error) {
      console.error("Add Favorite Error:", error);
      throw error;
    }
  },

  // Remove a store from favorites by FavoriteID
  removeFavorite: async (favoriteId) => {
    try {
      const response = await fetch(`/api/v1/appuser/favorites/${favoriteId}`, {
        method: 'DELETE',
        headers: { 'Accept': 'application/json' }
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "즐겨찾기 해제 실패");
      return true;
    } catch (error) {
      console.error("Remove Favorite Error:", error);
      throw error;
    }
  },

  // Get My Favorites (Optional wrapper since StoreService has it, but good for consistency)
  getMyFavorites: async () => {
    try {
      const response = await fetch(`/api/v1/appuser/favorites`, {
        method: 'GET',
        headers: { 'Accept': 'application/json' }
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "즐겨찾기 조회 실패");
      return result.data;
    } catch (error) {
      console.error("Get Favorites Error:", error);
      throw error;
    }
  }
};