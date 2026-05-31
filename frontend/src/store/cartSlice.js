import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { cartApi, productApi } from '../services/api'
import toast from 'react-hot-toast'

// Helper for local storage guest cart
const loadGuestCart = () => {
  try {
    const serialized = localStorage.getItem('guest_cart')
    if (serialized) return JSON.parse(serialized)
  } catch (e) {
    console.error(e)
  }
  return []
}

const saveGuestCart = (items) => {
  try {
    localStorage.setItem('guest_cart', JSON.stringify(items))
  } catch (e) {
    console.error(e)
  }
}

// Fetch cart and hydrate with product details
export const fetchCart = createAsyncThunk(
  'cart/fetchCart',
  async (_, { getState, rejectWithValue }) => {
    const user = getState().auth.user
    if (!user) return rejectWithValue('Not logged in')
    try {
      const items = await cartApi.getItems(user.id)
      const detailedItems = await Promise.all(
        items.map(async (item) => {
          try {
            const product = await productApi.getById(item.product_id)
            return {
              ...product,
              quantity: item.quantity,
              cartItemId: item.id // Keep the cart item ID if needed
            }
          } catch {
            return null // Skip if product deleted
          }
        })
      )
      return detailedItems.filter(Boolean)
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const addToCartAsync = createAsyncThunk(
  'cart/addToCartAsync',
  async ({ product, quantity = 1 }, { getState, rejectWithValue }) => {
    const user = getState().auth.user
    if (user) {
      try {
        await cartApi.addItem(user.id, product.id, quantity)
      } catch (err) {
        toast.error('Không thể thêm vào giỏ hàng')
        return rejectWithValue(err.message)
      }
    }
    toast.success('Đã thêm vào giỏ hàng')
    return { product, quantity, isAuth: !!user }
  }
)

export const removeFromCartAsync = createAsyncThunk(
  'cart/removeFromCartAsync',
  async (productId, { getState, rejectWithValue }) => {
    const user = getState().auth.user
    if (user) {
      try {
        await cartApi.removeItem(user.id, productId)
      } catch (err) {
        return rejectWithValue(err.message)
      }
    }
    return { productId, isAuth: !!user }
  }
)

export const updateQuantityAsync = createAsyncThunk(
  'cart/updateQuantityAsync',
  async ({ id, quantity }, { getState, rejectWithValue }) => {
    const user = getState().auth.user
    if (user) {
      try {
        await cartApi.updateItemQuantity(user.id, id, quantity)
      } catch (err) {
        return rejectWithValue(err.message)
      }
    }
    return { id, quantity, isAuth: !!user }
  }
)

export const clearCartAsync = createAsyncThunk(
  'cart/clearCartAsync',
  async (_, { getState, rejectWithValue }) => {
    const user = getState().auth.user
    if (user) {
      try {
        await cartApi.clearCart(user.id)
      } catch (err) {
        return rejectWithValue(err.message)
      }
    }
    return { isAuth: !!user }
  }
)

const initialState = {
  items: loadGuestCart(), // Hydrate from local storage on startup for guest
  loading: false,
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCartLocal: (state) => {
      state.items = []
      saveGuestCart([])
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch
      .addCase(fetchCart.pending, (state) => { state.loading = true })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchCart.rejected, (state) => { state.loading = false })
      
      // Add
      .addCase(addToCartAsync.fulfilled, (state, action) => {
        const { product, quantity, isAuth } = action.payload
        const existing = state.items.find(item => item.id === product.id)
        if (existing) {
          existing.quantity = Math.min(existing.quantity + quantity, existing.stock || 10)
        } else {
          state.items.push({ ...product, quantity })
        }
        if (!isAuth) saveGuestCart(state.items)
      })
      
      // Remove
      .addCase(removeFromCartAsync.fulfilled, (state, action) => {
        const { productId, isAuth } = action.payload
        state.items = state.items.filter(item => item.id !== productId)
        if (!isAuth) saveGuestCart(state.items)
      })
      
      // Update
      .addCase(updateQuantityAsync.fulfilled, (state, action) => {
        const { id, quantity, isAuth } = action.payload
        const item = state.items.find(i => i.id === id)
        if (item) {
          if (quantity <= 0) {
            state.items = state.items.filter(i => i.id !== id)
          } else {
            item.quantity = Math.min(quantity, item.stock || 10)
          }
          if (!isAuth) saveGuestCart(state.items)
        }
      })
      
      // Clear
      .addCase(clearCartAsync.fulfilled, (state, action) => {
        state.items = []
        if (!action.payload.isAuth) saveGuestCart([])
      })
      
      // Clear on logout (revert to guest cart instead of deleting DB data)
      .addCase('auth/logout', (state) => {
        state.items = loadGuestCart()
      })
  }
})

export const { clearCartLocal } = cartSlice.actions

export const selectCartItems = (state) => state.cart.items
export const selectCartCount = (state) => state.cart.items.reduce((sum, item) => sum + item.quantity, 0)
export const selectCartTotal = (state) => state.cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
export const selectCartLoading = (state) => state.cart.loading

export default cartSlice.reducer
