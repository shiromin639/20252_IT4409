const DEFAULT_USER_ID = 'demo-user';

const serviceBaseUrls = {
  product: import.meta.env.VITE_PRODUCT_API_URL || import.meta.env.VITE_API_BASE_URL || '',
  cart: import.meta.env.VITE_CART_API_URL || import.meta.env.VITE_API_BASE_URL || '',
  order: import.meta.env.VITE_ORDER_API_URL || import.meta.env.VITE_API_BASE_URL || '',
  inventory: import.meta.env.VITE_INVENTORY_API_URL || import.meta.env.VITE_API_BASE_URL || '',
};

async function request(service, path, options = {}) {
  const baseUrl = serviceBaseUrls[service];

  if (!baseUrl) {
    throw new Error(`Missing base URL for ${service} service`);
  }

  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const shopApi = {
  defaultUserId: DEFAULT_USER_ID,

  listCategories({ skip = 0, limit = 100 } = {}) {
    return request('product', `/categories?skip=${skip}&limit=${limit}`);
  },

  listProducts({ skip = 0, limit = 100, categoryId } = {}) {
    const path = categoryId && categoryId !== 'all'
      ? `/categories/${categoryId}/products?skip=${skip}&limit=${limit}`
      : `/products?skip=${skip}&limit=${limit}`;

    return request('product', path);
  },

  getProduct(productId) {
    return request('product', `/products/${productId}`);
  },

  getInventory(productId) {
    return request('inventory', `/inventory/${productId}`);
  },

  getCartItems(userId = DEFAULT_USER_ID) {
    return request('cart', `/carts/${userId}/items`);
  },

  addCartItem(userId = DEFAULT_USER_ID, item) {
    return request('cart', `/carts/${userId}/items`, {
      method: 'POST',
      body: JSON.stringify({
        product_id: item.productId,
        quantity: item.quantity,
      }),
    });
  },

  updateCartItem(userId = DEFAULT_USER_ID, productId, quantity) {
    return request('cart', `/carts/${userId}/items/${productId}`, {
      method: 'PUT',
      body: JSON.stringify({ quantity }),
    });
  },

  removeCartItem(userId = DEFAULT_USER_ID, productId) {
    return request('cart', `/carts/${userId}/items/${productId}`, {
      method: 'DELETE',
    });
  },

  clearCart(userId = DEFAULT_USER_ID) {
    return request('cart', `/carts/${userId}`, {
      method: 'DELETE',
    });
  },

  createOrder(order) {
    return request('order', '/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    });
  },

  listOrders(userId = DEFAULT_USER_ID, { skip = 0, limit = 100 } = {}) {
    return request('order', `/orders/user/${userId}?skip=${skip}&limit=${limit}`);
  },

  listOrderItems(orderId) {
    return request('order', `/orders/${orderId}/items`);
  },
};
