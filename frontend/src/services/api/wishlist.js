import apiClient from './client';

export const wishlistApi = {
  getWishlist: async () => {
    return apiClient.get('/wishlist');
  },

  getWishlistCount: async () => {
    return apiClient.get('/wishlist/count');
  },

  addItem: async (productId) => {
    return apiClient.post('/wishlist/items', { product_id: productId });
  },

  removeItem: async (productId) => {
    return apiClient.delete(`/wishlist/items/${productId}`);
  }
};
