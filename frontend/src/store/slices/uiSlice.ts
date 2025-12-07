import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// ----------------------
// Types
// ----------------------
export type ToastType = 'info' | 'success' | 'error' | 'warning';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
  duration: number;
  timestamp: number;
}

export interface ConfirmDialogData {
  title?: string;
  message?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export interface UIState {
  // Modal states
  showConfirmDialog: boolean;
  confirmDialogData: ConfirmDialogData | null;

  // Navigation
  currentPage: string;
  sidebarOpen: boolean;

  // Theme
  darkMode: boolean;

  // Loading overlays
  showLoadingOverlay: boolean;
  loadingMessage: string;

  // Toast notifications
  toasts: Toast[];
  maxToasts: number;
}

// ----------------------
// Initial state
// ----------------------
const initialState: UIState = {
  showConfirmDialog: false,
  confirmDialogData: null,
  currentPage: 'profile',
  sidebarOpen: false,
  darkMode: false,
  showLoadingOverlay: false,
  loadingMessage: 'Đang xử lý...',
  toasts: [],
  maxToasts: 3,
};

// ----------------------
// Slice
// ----------------------
const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    showConfirm(state, action: PayloadAction<ConfirmDialogData>) {
      state.showConfirmDialog = true;
      state.confirmDialogData = action.payload;
    },
    hideConfirm(state) {
      state.showConfirmDialog = false;
      state.confirmDialogData = null;
    },
    setCurrentPage(state, action: PayloadAction<string>) {
      state.currentPage = action.payload;
    },
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload;
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    toggleDarkMode(state) {
      state.darkMode = !state.darkMode;
      localStorage.setItem('darkMode', state.darkMode.toString());
    },
    setDarkMode(state, action: PayloadAction<boolean>) {
      state.darkMode = action.payload;
      localStorage.setItem('darkMode', action.payload.toString());
    },
    restoreTheme(state) {
      const savedTheme = localStorage.getItem('darkMode');
      if (savedTheme !== null) state.darkMode = savedTheme === 'true';
    },
    showLoadingOverlay(state, action: PayloadAction<string | undefined>) {
      state.showLoadingOverlay = true;
      state.loadingMessage = action.payload || 'Đang xử lý...';
    },
    hideLoadingOverlay(state) {
      state.showLoadingOverlay = false;
    },
    addToast(state, action: PayloadAction<Partial<Toast>>) {
      const toast: Toast = {
        id: Date.now() + Math.random(),
        type: 'info',
        message: '',
        duration: 5000,
        timestamp: Date.now(),
        ...action.payload,
      };
      state.toasts.unshift(toast);
      if (state.toasts.length > state.maxToasts) {
        state.toasts = state.toasts.slice(0, state.maxToasts);
      }
    },
    removeToast(state, action: PayloadAction<number>) {
      state.toasts = state.toasts.filter((t) => t.id !== action.payload);
    },
    clearAllToasts(state) {
      state.toasts = [];
    },
    showSuccessToast(state, action: PayloadAction<string>) {
      state.toasts.unshift({
        id: Date.now() + Math.random(),
        type: 'success',
        message: action.payload,
        duration: 4000,
        timestamp: Date.now(),
      });
      if (state.toasts.length > state.maxToasts)
        state.toasts = state.toasts.slice(0, state.maxToasts);
    },
    showErrorToast(state, action: PayloadAction<string>) {
      state.toasts.unshift({
        id: Date.now() + Math.random(),
        type: 'error',
        message: action.payload,
        duration: 6000,
        timestamp: Date.now(),
      });
      if (state.toasts.length > state.maxToasts)
        state.toasts = state.toasts.slice(0, state.maxToasts);
    },
  },
});

// ----------------------
// Exports
// ----------------------
export const {
  showConfirm,
  hideConfirm,
  setCurrentPage,
  setSidebarOpen,
  toggleSidebar,
  toggleDarkMode,
  setDarkMode,
  restoreTheme,
  showLoadingOverlay,
  hideLoadingOverlay,
  addToast,
  removeToast,
  clearAllToasts,
  showSuccessToast,
  showErrorToast,
} = uiSlice.actions;

// ----------------------
// Selectors
// ----------------------
export const selectUI = (state: { ui: UIState }) => state.ui;
export const selectConfirmDialog = (state: { ui: UIState }) => ({
  show: state.ui.showConfirmDialog,
  data: state.ui.confirmDialogData,
});
export const selectCurrentPage = (state: { ui: UIState }) => state.ui.currentPage;
export const selectSidebarOpen = (state: { ui: UIState }) => state.ui.sidebarOpen;
export const selectDarkMode = (state: { ui: UIState }) => state.ui.darkMode;
export const selectLoadingOverlay = (state: { ui: UIState }) => ({
  show: state.ui.showLoadingOverlay,
  message: state.ui.loadingMessage,
});
export const selectToasts = (state: { ui: UIState }) => state.ui.toasts;
export const selectHasToasts = (state: { ui: UIState }) => state.ui.toasts.length > 0;

export default uiSlice.reducer;
