import instance from "../axios"; // Assuming your axios instance is here
import { CART_ENDPOINTS } from "../endpoints";

export const AppUserCartService = {
  // GET /api/v1/appuser/cart/my
  getMyCart: async () => {
    try {
      const response = await instance.get(CART_ENDPOINTS.myCart);
      return response.data; // Returns ApiResponse
    } catch (error) {
      console.error("Failed to fetch cart:", error);
      throw error;
    }
  },

  // PATCH /api/v1/appuser/cart/items/{cartItemId}
  updateQuantity: async (cartItemId, newQuantity) => {
    try {
      const response = await instance.patch(`${CART_ENDPOINTS.items}/${cartItemId}`, {
        cartItemQuantity: newQuantity,
      });
      return response.data;
    } catch (error) {
      console.error("Failed to update cart item:", error);
      throw error;
    }
  },

  // DELETE /api/v1/appuser/cart/items/{cartItemId}
  deleteItem: async (cartItemId) => {
    try {
      const response = await instance.delete(`${CART_ENDPOINTS.items}/${cartItemId}`);
      return response.data;
    } catch (error) {
      console.error("Failed to delete cart item:", error);
      throw error;
    }
  },
}

export default AppUserCartService;