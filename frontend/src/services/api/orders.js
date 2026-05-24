import apiClient from './client';

export const orderApi = {
  /**
   * Creates a new order.
   * @param {Object} orderData
   * @param {string|number} orderData.user_id
   * @param {string} orderData.shipping_address
   * @param {Array<{product_id: number, quantity: number}>} orderData.items
   */
  create: async (orderData) => {
    return apiClient.post('/orders', orderData);
  },

  /**
   * Gets all orders for a specific user.
   */
  getUserOrders: async (userId, skip = 0, limit = 100) => {
    return apiClient.get(`/orders/user/${userId}`, {
      params: { skip, limit }
    });
  },

  /**
   * Gets details for a specific order.
   */
  getOrderById: async (orderId) => {
    return apiClient.get(`/orders/${orderId}`);
  },

  /**
   * Gets items for a specific order.
   */
  getOrderItems: async (orderId) => {
    return apiClient.get(`/orders/${orderId}/items`);
  }
};
