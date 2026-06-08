const API_BASE = '/api';

async function request(url: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  const response = await fetch(`${API_BASE}${url}`, { ...options, headers });
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `Request failed with status ${response.status}`);
  }
  if (response.status === 204) return null;
  return response.json();
}

/**
 * Upload a file using multipart/form-data (no JSON content-type).
 */
async function uploadFile(url: string, formData: FormData) {
  const response = await fetch(`${API_BASE}${url}`, {
    method: 'PUT',
    body: formData,
    // Don't set Content-Type header — browser will set it with boundary
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.message || `Upload failed with status ${response.status}`);
  }
  return response.json();
}

export const api = {
  // ==================== Auth ====================
  login: (credentials: any) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  signup: (userData: any) => request('/auth/signup', { method: 'POST', body: JSON.stringify(userData) }),
  getCurrentUser: () => request('/auth/user'),
  logout: () => request('/auth/signout', { method: 'POST' }),

  // ==================== Products (Public) ====================
  getProducts: (params: {
    keyword?: string; category?: string; minPrice?: number; maxPrice?: number;
    pageNumber?: number; pageSize?: number; sortBy?: string; sortOrder?: string;
  } = {}) => {
    const sp = new URLSearchParams();
    if (params.keyword) sp.append('keyword', params.keyword);
    if (params.category) sp.append('category', params.category);
    if (params.minPrice !== undefined) sp.append('minPrice', String(params.minPrice));
    if (params.maxPrice !== undefined) sp.append('maxPrice', String(params.maxPrice));
    if (params.pageNumber !== undefined) sp.append('pageNumber', String(params.pageNumber));
    if (params.pageSize !== undefined) sp.append('pageSize', String(params.pageSize));
    if (params.sortBy) sp.append('sortBy', params.sortBy);
    if (params.sortOrder) sp.append('sortOrder', params.sortOrder);
    return request(`/products?${sp.toString()}`);
  },

  getSearchSuggestions: (query: string, limit = 8) =>
    request(`/products/search/suggestions?q=${encodeURIComponent(query)}&limit=${limit}`),

  // ==================== Products (Admin) ====================
  getAdminProducts: (params: { pageNumber?: number; pageSize?: number } = {}) => {
    const sp = new URLSearchParams();
    if (params.pageNumber !== undefined) sp.append('pageNumber', String(params.pageNumber));
    if (params.pageSize !== undefined) sp.append('pageSize', String(params.pageSize));
    return request(`/products/admin?${sp.toString()}`);
  },
  addProduct: (categoryId: number | string, product: any) =>
    request(`/categories/${categoryId}/product`, { method: 'POST', body: JSON.stringify(product) }),
  updateProduct: (productId: number | string, product: any) =>
    request(`/products/${productId}`, { method: 'PUT', body: JSON.stringify(product) }),
  deleteProduct: (productId: number | string) =>
    request(`/products/${productId}`, { method: 'DELETE' }),
  uploadProductImage: (productId: number | string, imageFile: File) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    return uploadFile(`/products/${productId}/image`, formData);
  },

  // ==================== Categories ====================
  getCategories: () => request('/categories'),
  addCategory: (category: any) =>
    request('/categories', { method: 'POST', body: JSON.stringify(category) }),
  updateCategory: (categoryId: number | string, category: any) =>
    request(`/categories/${categoryId}`, { method: 'PUT', body: JSON.stringify(category) }),
  deleteCategory: (categoryId: number | string) =>
    request(`/categories/${categoryId}`, { method: 'DELETE' }),

  // ==================== Cart ====================
  getCart: () => request('/cart'),
  addToCart: (productId: number, quantity: number) =>
    request('/cart/items', { method: 'POST', body: JSON.stringify({ productId, quantity }) }),
  updateCartItem: (productId: number, quantity: number) =>
    request(`/cart/items/${productId}?quantity=${quantity}`, { method: 'PUT' }),
  deleteCartItem: (cartItemId: number) => request(`/cart/items/${cartItemId}`, { method: 'DELETE' }),
  clearCart: () => request('/cart', { method: 'DELETE' }),

  // ==================== Checkout ====================
  previewCheckout: (voucherCode?: string) => {
    const url = voucherCode
      ? `/checkout/preview?voucherCode=${encodeURIComponent(voucherCode)}`
      : '/checkout/preview';
    return request(url, { method: 'POST' });
  },
  confirmCheckout: (data: any) =>
    request('/checkout/confirm', { method: 'POST', body: JSON.stringify(data) }),

  // ==================== Orders ====================
  getMyOrders: () => request('/orders'),
  getOrderDetails: (orderId: number | string) => request(`/orders/${orderId}`),
  cancelOrder: (orderId: number | string) => request(`/orders/${orderId}/cancel`, { method: 'PUT' }),
  getAdminOrders: () => request('/orders/all'),
  updateOrderStatus: (orderId: number | string, status: string) =>
    request(`/orders/${orderId}/status?status=${status}`, { method: 'PUT' }),

  // ==================== Payments ====================
  getPaymentQr: (orderId: number | string) => request(`/payment/qr?orderId=${orderId}`),

  // ==================== Vouchers ====================
  getAvailableVouchers: () => request('/vouchers/available'),
  getAdminVouchers: () => request('/vouchers'),
  createVoucher: (voucher: any) =>
    request('/vouchers', { method: 'POST', body: JSON.stringify(voucher) }),
  updateVoucher: (voucherId: number | string, voucher: any) =>
    request(`/vouchers/${voucherId}`, { method: 'PUT', body: JSON.stringify(voucher) }),
  deactivateVoucher: (voucherId: number | string) =>
    request(`/vouchers/${voucherId}/deactivate`, { method: 'PUT' }),

  // ==================== Addresses ====================
  getMyAddresses: () => request('/addresses'),
  createAddress: (address: any) =>
    request('/addresses', { method: 'POST', body: JSON.stringify(address) }),
  updateAddress: (addressId: number | string, address: any) =>
    request(`/addresses/${addressId}`, { method: 'PUT', body: JSON.stringify(address) }),
  deleteAddress: (addressId: number | string) =>
    request(`/addresses/${addressId}`, { method: 'DELETE' }),
  setDefaultAddress: (addressId: number | string) =>
    request(`/addresses/${addressId}/default`, { method: 'PUT' }),

  // ==================== Ratings ====================
  getProductRatings: (productId: number | string, page = 0, size = 10) =>
    request(`/products/${productId}/ratings?page=${page}&size=${size}`),
  getProductRatingSummary: (productId: number | string) =>
    request(`/products/${productId}/ratings/summary`),
  submitRating: (rating: any) =>
    request('/ratings', { method: 'POST', body: JSON.stringify(rating) }),
  updateRating: (ratingId: number | string, rating: any) =>
    request(`/ratings/${ratingId}`, { method: 'PUT', body: JSON.stringify(rating) }),
  deleteRating: (ratingId: number | string) =>
    request(`/ratings/${ratingId}`, { method: 'DELETE' }),
  getMyRatings: () => request('/ratings/mine'),

  // ==================== User Profile ====================
  getMyProfile: () => request('/profile'),
  updateMyProfile: (profile: any) =>
    request('/profile', { method: 'PUT', body: JSON.stringify(profile) }),
  changePassword: (passwords: any) =>
    request('/profile/password', { method: 'PUT', body: JSON.stringify(passwords) }),

  // ==================== Admin Dashboard ====================
  getAdminDashboard: () => request('/dashboard'),
};
