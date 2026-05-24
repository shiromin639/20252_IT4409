import apiClient from './client';

export const inventoryApi = {
  /**
   * Retrieves available stock for a product.
   */
  getStock: async (productId) => {
    return apiClient.get(`/inventory/${productId}`);
  }
};
