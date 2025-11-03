import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  // Modal states
  showConfirmDialog: false,
  confirmDialogData: null,

  // Navigation
  currentPage: 'profile',
  sidebarOpen: false,

  // Theme
  darkMode: false,

  // Loading overlays
  showLoadingOverlay: false,
  loadingMessage: 'Đang xử lý...',

  // Toast notifications (global)
  toasts: [],
  maxToasts: 3,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    // Confirm dialog actions
    showConfirm: (state, action) => {
      state.showConfirmDialog = true;
      state.confirmDialogData = action.payload;
    },

    hideConfirm: (state) => {
      state.showConfirmDialog = false;
      state.confirmDialogData = null;
    },

    // Navigation actions
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },

    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },

    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },

    // Theme actions
    toggleDarkMode: (state) => {
      state.darkMode = !state.darkMode;
      localStorage.setItem('darkMode', state.darkMode.toString());
    },

    setDarkMode: (state, action) => {
      state.darkMode = action.payload;
      localStorage.setItem('darkMode', action.payload.toString());
    },

    restoreTheme: (state) => {
      const savedTheme = localStorage.getItem('darkMode');
      if (savedTheme !== null) {
        state.darkMode = savedTheme === 'true';
      }
    },

    // Loading overlay actions
    showLoadingOverlay: (state, action) => {
      state.showLoadingOverlay = true;
      state.loadingMessage = action.payload || 'Đang xử lý...';
    },

    hideLoadingOverlay: (state) => {
      state.showLoadingOverlay = false;
    },

    // Toast actions
    addToast: (state, action) => {
      const toast = {
        id: Date.now() + Math.random(),
        type: 'info',
        message: '',
        duration: 5000,
        timestamp: Date.now(),
        ...action.payload,
      };

      // Add to beginning of array
      state.toasts.unshift(toast);

      // Keep only max toasts
      if (state.toasts.length > state.maxToasts) {
        state.toasts = state.toasts.slice(0, state.maxToasts);
      }
    },

    removeToast: (state, action) => {
      const id = action.payload;
      state.toasts = state.toasts.filter((toast) => toast.id !== id);
    },

    clearAllToasts: (state) => {
      state.toasts = [];
    },

    // Convenience toast actions
    showSuccessToast: (state, action) => {
      const toast = {
        id: Date.now() + Math.random(),
        type: 'success',
        message: action.payload,
        duration: 4000,
        timestamp: Date.now(),
      };
      state.toasts.unshift(toast);

      if (state.toasts.length > state.maxToasts) {
        state.toasts = state.toasts.slice(0, state.maxToasts);
      }
    },

    showErrorToast: (state, action) => {
      const toast = {
        id: Date.now() + Math.random(),
        type: 'error',
        message: action.payload,
        duration: 6000,
        timestamp: Date.now(),
      };
      state.toasts.unshift(toast);

      if (state.toasts.length > state.maxToasts) {
        state.toasts = state.toasts.slice(0, state.maxToasts);
      }
    },
  },
});

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

// Selectors
export const selectUI = (state) => state.ui;
export const selectConfirmDialog = (state) => ({
  show: state.ui.showConfirmDialog,
  data: state.ui.confirmDialogData,
});
export const selectCurrentPage = (state) => state.ui.currentPage;
export const selectSidebarOpen = (state) => state.ui.sidebarOpen;
export const selectDarkMode = (state) => state.ui.darkMode;
export const selectLoadingOverlay = (state) => ({
  show: state.ui.showLoadingOverlay,
  message: state.ui.loadingMessage,
});
export const selectToasts = (state) => state.ui.toasts;
export const selectHasToasts = (state) => state.ui.toasts.length > 0;

export default uiSlice.reducer;
