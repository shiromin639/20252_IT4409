import apiClient from './client';

export const reviewAPI = {
  createReview: async (reviewData) => {
    return apiClient.post('/reviews', reviewData);
  },

  getProductReviews: async (productId, skip = 0, limit = 100) => {
    return apiClient.get(`/products/${productId}/reviews`, {
      params: { skip, limit }
    });
  },

  getRatingSummary: async (productId) => {
    return apiClient.get(`/products/${productId}/rating-summary`);
  },

  updateReview: async (reviewId, reviewData) => {
    return apiClient.put(`/reviews/${reviewId}`, reviewData);
  },

  deleteReview: async (reviewId) => {
    return apiClient.delete(`/reviews/${reviewId}`);
  }
};
