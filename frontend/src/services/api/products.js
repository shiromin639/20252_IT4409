import apiClient from './client';

export const productApi = {
  /**
   * Fetches all products, with optional filtering, sorting, and pagination.
   */
  getAll: async (filters = {}) => {
    // Map the frontend filter format to backend query parameters
    const params = new URLSearchParams();
    
    if (filters.skip !== undefined) params.append('skip', filters.skip);
    if (filters.limit !== undefined) params.append('limit', filters.limit);
    if (filters.search) params.append('q', filters.search);
    if (filters.category && filters.category !== 'all') params.append('category_id', filters.category);
    if (filters.brand && filters.brand !== 'all') params.append('brand', filters.brand);
    if (filters.minPrice) params.append('min_price', filters.minPrice);
    if (filters.maxPrice) params.append('max_price', filters.maxPrice);
    
    // Convert frontend sort values to backend expected values
    if (filters.sort === 'price-asc') params.append('sort_by', 'price_asc');
    else if (filters.sort === 'price-desc') params.append('sort_by', 'price_desc');
    else if (filters.sort === 'newest') params.append('sort_by', 'newest');
    
    return apiClient.get(`/products?${params.toString()}`);
  },

  /**
   * Fetches a single product by ID.
   */
  getById: async (id) => {
    return apiClient.get(`/products/${id}`);
  },

  /**
   * Fetches all unique brands.
   */
  getBrands: async () => {
    return apiClient.get('/brands');
  },

  /**
   * Fetches products by category ID.
   */
  getByCategory: async (categoryId, skip = 0, limit = 100) => {
    return apiClient.get(`/categories/${categoryId}/products`, {
      params: { skip, limit }
    });
  },

  /**
   * Retrieves all product categories.
   */
  getCategories: async () => {
    return apiClient.get('/categories');
  },

  /**
   * Retrieves all product brands.
   */
  getBrands: async () => {
    return apiClient.get('/brands');
  }
};
