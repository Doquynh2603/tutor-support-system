import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice-real';
import tutorReducer from './slices/tutorSlice';
import uiReducer from './slices/uiSlice';
import notificationReducer from './slices/notificationSlice';

let store;
try {
  store = configureStore({
    reducer: {
      auth: authReducer,
      tutor: tutorReducer,
      ui: uiReducer,
      notification: notificationReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          // Ignore these action types
          ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
          // Ignore these field paths in all actions
          ignoredActionsPaths: ['meta.arg', 'payload.timestamp'],
          // Ignore these paths in the state
          ignoredPaths: ['items.dates'],
        },
      }),
    // ✅ Sử dụng Vite environment variable thay vì process.env
    devTools: import.meta.env.DEV,
  });
} catch (error) {
  console.error('Error creating Redux store:', error);
  // Create a basic store as fallback
  store = configureStore({
    reducer: {},
  });
}

export { store };
export default store;
