import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import { authApi } from '../services/api'
import { clearCart } from './cartSlice'

const savedUser = localStorage.getItem('user')
const savedToken = localStorage.getItem('token')

const initialState = {
  user: savedUser ? JSON.parse(savedUser) : null,
  token: savedToken || null,
  isAuthenticated: !!savedToken,
  loading: false,
  error: null,
}

// Async thunk for login
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authApi.login(credentials)
      return response // { user, token }
    } catch (err) {
      return rejectWithValue(err.message || 'Login failed')
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      state.error = null
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      localStorage.removeItem('refresh_token')
    },
    updateProfile: (state, action) => {
      state.user = { ...state.user, ...action.payload }
      localStorage.setItem('user', JSON.stringify(state.user))
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload.user
        state.token = action.payload.token
        state.isAuthenticated = true
        localStorage.setItem('user', JSON.stringify(action.payload.user))
        // Token is already saved in localStorage by authApi.login
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
  }
})

// Automatically clear cart on logout via a thunk wrapper if needed, 
// or let components dispatch both. We'll export logout directly.
export const { logout, updateProfile, clearError } = authSlice.actions

export const selectUser = (state) => state.auth.user
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated
export const selectIsAdmin = (state) => state.auth.user?.is_superuser === true || state.auth.user?.role === 'admin'
export const selectAuthLoading = (state) => state.auth.loading
export const selectAuthError = (state) => state.auth.error

export default authSlice.reducer
