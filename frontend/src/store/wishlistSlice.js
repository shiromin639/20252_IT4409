import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { wishlistApi } from '../services/api'
import toast from 'react-hot-toast'

export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (_, { getState, rejectWithValue }) => {
    const user = getState().auth.user
    if (!user) return []
    try {
      const response = await wishlistApi.getWishlist()
      return response.items || []
    } catch (err) {
      return rejectWithValue(err.message)
    }
  }
)

export const toggleWishlistAsync = createAsyncThunk(
  'wishlist/toggleWishlistAsync',
  async (productId, { getState, rejectWithValue }) => {
    const state = getState()
    const user = state.auth.user
    
    if (!user) {
      toast.error('Vui lòng đăng nhập để sử dụng tính năng yêu thích')
      return rejectWithValue('Not logged in')
    }

    const isWished = state.wishlist.items.some(item => item.id === productId)
    
    try {
      if (isWished) {
        await wishlistApi.removeItem(productId)
        toast.success('Đã xóa khỏi danh sách yêu thích')
        return { productId, action: 'removed' }
      } else {
        await wishlistApi.addItem(productId)
        toast.success('Đã thêm vào danh sách yêu thích')
        return { productId, action: 'added' }
      }
    } catch (err) {
      toast.error('Có lỗi xảy ra, vui lòng thử lại sau')
      return rejectWithValue(err.message)
    }
  }
)

const initialState = {
  items: [],
  loading: false,
}

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    clearWishlist: (state) => {
      state.items = []
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchWishlist.pending, (state) => { 
        state.loading = true 
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.loading = false
        state.items = action.payload
      })
      .addCase(fetchWishlist.rejected, (state) => { 
        state.loading = false 
      })
      
      .addCase(toggleWishlistAsync.fulfilled, (state, action) => {
        const { productId, action: type } = action.payload
        if (type === 'removed') {
          state.items = state.items.filter(item => item.id !== productId)
        } else {
          // Temporarily add a placeholder object so the heart becomes active immediately.
          // The actual full product object will require a refetch or we just store {id: productId} 
          // because most of the time we only check `items.some(i => i.id === productId)`
          state.items.push({ id: productId })
        }
      })
      
      .addCase('auth/logout', (state) => {
        state.items = []
      })
  }
})

export const { clearWishlist } = wishlistSlice.actions

export const selectWishlistItems = (state) => state.wishlist.items
export const selectWishlistCount = (state) => state.wishlist.items.length
export const selectIsWished = (state, productId) => state.wishlist.items.some(item => item.id === productId)

export default wishlistSlice.reducer
