import apiClient from './client';

export const inventoryApi = {
  /**
   * Retrieves available stock for a product.
   */
  getStock: async (productId) => {
    return apiClient.get(`/inventory/${productId}`);
  },
  createInventory: async (data) => {
    return apiClient.post('/inventory', data);
  },
  updateStock: async (productId, delta) => {
    return apiClient.put(`/inventory/${productId}/stock-update`, { delta });
  }
};
