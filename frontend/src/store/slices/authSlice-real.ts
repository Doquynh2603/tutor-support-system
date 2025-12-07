import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authAPI } from '../../services/api';
import { RootState } from '../index';
import { UserAccount } from '../../types';

export type Role = 'tutor' | 'student' | 'admin';

export interface User {
  id: number | string;
  fullName?: string;
  email: string;
  role: Role;
  phone?: string;
  avatar?: string;
}

export interface AuthState {
  user: UserAccount | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

interface AuthPayload {
  user: UserAccount;
  token: string;
}

// Helpers
const getInitialToken = () => {
  try {
    return localStorage.getItem('token');
  } catch {
    return null;
  }
};

const initialState: AuthState = {
  user: null,
  token: getInitialToken(),
  isAuthenticated: !!getInitialToken(),
  loading: false,
  error: null,
};

// Async thunks
export const loginUser = createAsyncThunk<
  AuthPayload,
  { email: string; password: string },
  { rejectValue: string }
>('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const response = await authAPI.login(credentials);

    // authAPI.login returns { user, token } directly
    const { user, token } = response;

    if (!user || !token) {
      return rejectWithValue('Login failed: missing user or token');
    }

    // Đảm bảo role luôn có giá trị hợp lệ
    if (!user.role) user.role = 'student';

    localStorage.setItem('token', token);

    return { user, token };
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : 'Login failed';
    return rejectWithValue(errorMessage);
  }
});

export const verifyUserToken = createAsyncThunk<AuthPayload, string, { rejectValue: string }>(
  'auth/verifyToken',
  async (token, { rejectWithValue }) => {
    try {
      const response = await authAPI.verifyToken(token);

      // authAPI.verifyToken returns { user } directly
      const { user } = response;

      if (!user) {
        localStorage.removeItem('token');
        return rejectWithValue('User not found');
      }

      return { user, token };
    } catch (err: unknown) {
      localStorage.removeItem('token');
      const errorMessage = err instanceof Error ? err.message : 'Token verification failed';
      return rejectWithValue(errorMessage);
    }
  }
);

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem('token');
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetAllStores: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<AuthPayload>) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Login failed';
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      })
      .addCase(verifyUserToken.pending, (state) => {
        state.loading = true;
      })
      .addCase(verifyUserToken.fulfilled, (state, action: PayloadAction<AuthPayload>) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(verifyUserToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Token verification failed';
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export const { logout, clearError, resetAllStores } = authSlice.actions;
export const selectAuth = (state: RootState) => state.auth;
export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectAuthLoading = (state: RootState) => state.auth.loading;
export const selectAuthError = (state: RootState) => state.auth.error;

export default authSlice.reducer;
