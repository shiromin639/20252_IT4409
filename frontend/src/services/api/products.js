import apiClient from './client';

let cachedCategories = null;

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
    
    if (filters.category && filters.category !== 'all') {
      // Map category string to category_id
      if (!isNaN(filters.category)) {
        params.append('category_id', filters.category);
      } else {
        if (!cachedCategories) {
          try {
            const res = await apiClient.get('/categories');
            cachedCategories = res.data || res;
          } catch (e) {
            console.error("Failed to fetch categories", e);
          }
        }
        if (cachedCategories) {
          const searchCat = filters.category.toLowerCase();
          const found = cachedCategories.find(c => c.name.toLowerCase().includes(searchCat) || searchCat.includes(c.name.toLowerCase()));
          if (found) {
            params.append('category_id', found.id);
          }
        }
      }
    }
    
    if (filters.brand && filters.brand !== 'all') params.append('brand', filters.brand);
    if (filters.ram) params.append('ram', filters.ram);
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

  getBrands: async () => {
    return apiClient.get('/brands');
  },

  /**
   * Fetches search suggestions for the autocomplete UI.
   * @param {string} query 
   * @param {AbortSignal} signal 
   */
  getSearchSuggestions: async (query, signal) => {
    return apiClient.get(`/products/search/suggestions?q=${encodeURIComponent(query)}`, {
      signal
    });
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
    if (!cachedCategories) {
      const res = await apiClient.get('/categories');
      cachedCategories = res.data || res;
    }
    return cachedCategories;
  },

  /**
   * Uploads a product image.
   * @param {File} file 
   * @returns {Promise<{ secure_url: string }>}
   */
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
};
