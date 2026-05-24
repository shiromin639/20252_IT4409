import apiClient from './client';

export const adminApi = {
  /**
   * Gets all users (Admin only).
   */
  getUsers: async (skip = 0, limit = 100) => {
    return apiClient.get('/users/', {
      params: { skip, limit }
    });
  },

  /**
   * Updates a user's role (Admin only).
   */
  updateUserRole: async (userId, isSuperuser) => {
    return apiClient.put(`/users/${userId}/role`, null, {
      params: { is_superuser: isSuperuser }
    });
  },

  /**
   * Deletes a user (Admin only).
   */
  deleteUser: async (userId) => {
    return apiClient.delete(`/users/${userId}`);
  },

  /**
   * Gets all orders (Admin only).
   */
  getAllOrders: async (skip = 0, limit = 100) => {
    return apiClient.get('/orders', {
      params: { skip, limit }
    });
  },

  /**
   * Updates an order status (Admin only).
   */
  updateOrder: async (orderId, updateData) => {
    return apiClient.put(`/orders/${orderId}`, updateData);
  },

  /**
   * Creates a product (Admin only).
   */
  createProduct: async (productData) => {
    return apiClient.post('/products', productData);
  },

  /**
   * Updates a product (Admin only).
   */
  updateProduct: async (productId, productData) => {
    return apiClient.put(`/products/${productId}`, productData);
  },

  /**
   * Deletes a product (Admin only).
   */
  deleteProduct: async (productId) => {
    return apiClient.delete(`/products/${productId}`);
  },
  
  /**
   * Uploads a product image (Admin only).
   */
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/products/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  }
};
