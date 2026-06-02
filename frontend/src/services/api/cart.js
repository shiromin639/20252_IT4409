import apiClient from './client';

export const cartApi = {
  /**
   * Gets the user's cart (and implicitly creates one if missing via items endpoints).
   */
  getCart: async (userId) => {
    return apiClient.get(`/carts/${userId}`);
  },

  /**
   * Gets all items in the user's cart.
   */
  getItems: async (userId) => {
    return apiClient.get(`/carts/${userId}/items`);
  },

  /**
   * Adds an item to the cart.
   */
  addItem: async (userId, productId, quantity = 1) => {
    return apiClient.post(`/carts/${userId}/items`, {
      product_id: productId,
      quantity,
    });
  },

  /**
   * Updates an item's quantity in the cart.
   */
  updateItemQuantity: async (userId, productId, quantity) => {
    return apiClient.put(`/carts/${userId}/items/${productId}`, {
      quantity,
    });
  },

  /**
   * Removes an item from the cart.
   */
  removeItem: async (userId, productId) => {
    return apiClient.delete(`/carts/${userId}/items/${productId}`);
  },

  /**
   * Clears the entire cart.
   */
  clearCart: async (userId) => {
    return apiClient.delete(`/carts/${userId}/items`);
  }
};
