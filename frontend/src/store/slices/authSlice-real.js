/**
 * Auth Slice - Production version with real authentication
 * Quản lý state authentication với SQL Server backend
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI } from '../../services/api';

// Async thunks
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      console.log('🔐 [loginUser thunk] Calling authAPI.login with:', credentials);
      const response = await authAPI.login(credentials);
      console.log('📥 [loginUser thunk] Response:', response);

      // Backend trả về { success: true, data: { user, token } }
      const token = response.data?.token;
      const user = response.data?.user;

      console.log('   - extracted token:', token?.substring(0, 20) + '...');
      console.log('   - extracted user:', user);

      if (token) {
        try {
          localStorage.setItem('token', token);
        } catch (error) {
          console.error('Failed to save token to localStorage:', error);
        }
      }
      console.log('✅ [loginUser thunk] Returning:', { user, token });
      return { user, token }; // Format: { user, token }
    } catch (error) {
      console.error('❌ [loginUser thunk] Error:', error);
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authAPI.register(userData);
      // Backend trả về { success: true, data: { user, token } }
      const token = response.data?.data?.token;
      const user = response.data?.data?.user;

      if (token) {
        try {
          localStorage.setItem('token', token);
        } catch (error) {
          console.error('Failed to save token to localStorage:', error);
        }
      }
      return { user, token }; // Format: { user, token }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Không export getCurrentUser - chỉ dùng verifyUserToken khi cần
// để tránh tự động fetch user

export const verifyUserToken = createAsyncThunk(
  'auth/verifyToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authAPI.getCurrentUser();
      // Backend trả về { success: true, data: { user } }
      return response.data?.data?.user || response.data?.user || response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Initial state
const getInitialToken = () => {
  try {
    return localStorage.getItem('token') || null;
  } catch (error) {
    console.error('Failed to access localStorage:', error);
    return null;
  }
};

const initialToken = getInitialToken();
const initialState = {
  user: null,
  token: initialToken,
  isAuthenticated: !!initialToken,
  loading: false,
  error: null,
};

// Auth slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      try {
        localStorage.removeItem('token');
      } catch (error) {
        console.error('Failed to remove token from localStorage:', error);
      }
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        console.log('✅ [authSlice] loginUser.fulfilled');
        console.log('   - payload:', action.payload);
        console.log('   - user:', action.payload.user);
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })

      // Register
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get current user
      // .addCase(getCurrentUser.pending, (state) => {
      //   state.loading = true;
      // })
      // .addCase(getCurrentUser.fulfilled, (state, action) => {
      //   state.loading = false;
      //   state.user = action.payload;
      //   state.isAuthenticated = true;
      // })
      // .addCase(getCurrentUser.rejected, (state, action) => {
      //   state.loading = false;
      //   state.error = action.payload;
      //   state.user = null;
      //   state.token = null;
      //   state.isAuthenticated = false;
      // })

      // Verify token
      .addCase(verifyUserToken.pending, (state) => {
        state.loading = true;
      })
      .addCase(verifyUserToken.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(verifyUserToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export const { logout, clearError } = authSlice.actions;

// Selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;
