/**
 * File: store/slices/authSlice.ts
 * Mục đích: Redux slice cho authentication state
 * Vai trò:
 *   - Quản lý user authentication state
 *   - Lưu user info và token
 * Lưu ý:
 *   - Token nên được lưu vào localStorage để persist sau khi refresh
 *   - Logout cần clear cả localStorage
 *   - Có thể thêm async thunks cho login/register actions
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Set credentials khi login thành công
    setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = true;
    },
    // Clear credentials khi logout
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;
