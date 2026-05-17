import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
})

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error.response?.data || error)
  }
)

// Mock API functions using local data
import { laptops, usedLaptops, mockOrders } from '../data/laptops'

export const productService = {
  getAll: async (filters = {}) => {
    await delay(300)
    let result = [...laptops]

    if (filters.brand && filters.brand !== 'all') {
      result = result.filter(l => l.brand === filters.brand)
    }
    if (filters.category && filters.category !== 'all') {
      result = result.filter(l => l.category === filters.category)
    }
    if (filters.search) {
      const q = filters.search.toLowerCase()
      result = result.filter(l => l.name.toLowerCase().includes(q) || l.brand.includes(q))
    }
    if (filters.minPrice) result = result.filter(l => l.price >= filters.minPrice)
    if (filters.maxPrice) result = result.filter(l => l.price <= filters.maxPrice)
    if (filters.ram) result = result.filter(l => l.specs.ram.includes(filters.ram))

    if (filters.sort === 'price-asc') result.sort((a, b) => a.price - b.price)
    else if (filters.sort === 'price-desc') result.sort((a, b) => b.price - a.price)
    else if (filters.sort === 'newest') result.sort((a, b) => b.id - a.id)
    else if (filters.sort === 'popular') result.sort((a, b) => b.sold - a.sold)

    return result
  },

  getById: async (id) => {
    await delay(200)
    const laptop = laptops.find(l => l.id === parseInt(id))
    if (!laptop) throw new Error('Không tìm thấy sản phẩm')
    return laptop
  },

  getFeatured: async () => {
    await delay(200)
    return laptops.filter(l => l.isFeatured).slice(0, 8)
  },

  getFlashSale: async () => {
    await delay(200)
    return laptops.filter(l => l.isFlashSale)
  },

  getNew: async () => {
    await delay(200)
    return laptops.filter(l => l.isNew).slice(0, 8)
  },

  getRelated: async (id, brand) => {
    await delay(200)
    return laptops.filter(l => l.id !== id && l.brand === brand).slice(0, 4)
  },
}

export const authService = {
  login: async (credentials) => {
    await delay(800)
    if (credentials.email === 'admin@techlap.vn' && credentials.password === 'admin123') {
      return {
        user: { id: 1, name: 'Admin', email: credentials.email, role: 'admin', avatar: null },
        token: 'mock-admin-token-' + Date.now()
      }
    }
    if (credentials.email && credentials.password.length >= 6) {
      return {
        user: { id: 2, name: credentials.email.split('@')[0], email: credentials.email, role: 'user', avatar: null },
        token: 'mock-user-token-' + Date.now()
      }
    }
    throw new Error('Email hoặc mật khẩu không đúng')
  },

  register: async (data) => {
    await delay(800)
    if (!data.email || !data.password || !data.name) {
      throw new Error('Vui lòng điền đầy đủ thông tin')
    }
    return {
      user: { id: Date.now(), name: data.name, email: data.email, role: 'user', avatar: null },
      token: 'mock-token-' + Date.now()
    }
  },
}

export const orderService = {
  create: async (orderData) => {
    await delay(1000)
    return { id: 'ORD-' + Date.now(), ...orderData, status: 'pending' }
  },

  getMyOrders: async () => {
    await delay(400)
    return mockOrders
  },
}

export const usedProductService = {
  getAll: async () => {
    await delay(300)
    return usedLaptops
  },

  getById: async (id) => {
    await delay(200)
    const laptop = usedLaptops.find(l => l.id === parseInt(id))
    if (!laptop) throw new Error('Không tìm thấy sản phẩm')
    return laptop
  },

  getFeatured: async () => {
    await delay(200)
    return usedLaptops.filter(l => l.isFlashSale).slice(0, 8)
  },

  getHotDeals: async () => {
    await delay(200)
    // Lấy những máy cũ có giảm giá cao
    return usedLaptops.filter(l => l.discount > 30).slice(0, 6)
  },
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

export default api
