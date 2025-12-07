import { configureStore, ThunkDispatch, AnyAction } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice-real';
import tutorReducer from './slices/tutorSlice';
import uiReducer from './slices/uiSlice';
import notificationReducer from './slices/notificationSlice';
import classesReducer from './slices/classesSlice';
import dataReducer from './slices/dataSlice';
import studentReducer from './slices/studentSlice';

// ----------------------------------
// Types
// ----------------------------------
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = ThunkDispatch<RootState, unknown, AnyAction>;

// ----------------------------------
// Store (fixed types)
// ----------------------------------
const store = configureStore({
  reducer: {
    auth: authReducer,
    tutor: tutorReducer,
    ui: uiReducer,
    notification: notificationReducer,
    classes: classesReducer,
    data: dataReducer,
    student: studentReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
        ignoredPaths: ['items.dates'],
      },
    }),
  devTools: import.meta.env.DEV,
});

export default store;