import axiosInstance from "../axios";

export const appUserFavoriteService = {
  // Add a store to favorites
  addFavorite: async (storeId) => {
    try {
      const response = await axiosInstance.post('/api/v1/appuser/favorites', { storeId });
      return response.data.data; // Returns the created FavoriteStoreDTO
    } catch (error) {
      console.error("Add Favorite Error:", error);
      throw error;
    }
  },

  // Remove a store from favorites by FavoriteID
  removeFavorite: async (favoriteId) => {
    try {
      await axiosInstance.delete(`/api/v1/appuser/favorites/${favoriteId}`);
      return true;
    } catch (error) {
      console.error("Remove Favorite Error:", error);
      throw error;
    }
  },

  // Get My Favorites
  getMyFavorites: async () => {
    try {
      const response = await axiosInstance.get('/api/v1/appuser/favorites');
      return response.data.data;
    } catch (error) {
      console.error("Get Favorites Error:", error);
      throw error;
    }
  }
}

export default appUserFavoriteService;