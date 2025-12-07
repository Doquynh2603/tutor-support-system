import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// ----------------------
// Types
// ----------------------
import { TutorProfile, Province, Ward } from '@/types';

export interface LocationsState {
  provinces: Province[];
  wards: Ward[];
  isLoading: boolean;
  error: string | null;
}

export interface Notification {
  show: boolean;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
  duration: number;
}

interface TutorState {
  profile: TutorProfile | null;
  lastUpdated: number | null;
  locations: LocationsState;
  isEditingProfile: boolean;
  profileFormData: TutorProfile;
  isSubmittingProfile: boolean;
  validationErrors: Record<string, string>;
  isDirty: boolean;
  originalData: TutorProfile | null;
  notification: Notification;
  isLoading: boolean;
  error: string | null;
}

// ----------------------
// Initial state
// ----------------------
const initialState: TutorState = {
  profile: null,
  lastUpdated: null,
  locations: {
    provinces: [],
    wards: [],
    isLoading: false,
    error: null,
  },
  isEditingProfile: false,
  profileFormData: {},
  isSubmittingProfile: false,
  validationErrors: {},
  isDirty: false,
  originalData: null,
  notification: {
    show: false,
    type: 'info',
    message: '',
    duration: 5000,
  },
  isLoading: false,
  error: null,
};

// ----------------------
// Slice
// ----------------------
const tutorSlice = createSlice({
  name: 'tutor',
  initialState,
  reducers: {
    setProfile(state, action: PayloadAction<TutorProfile>) {
      state.profile = action.payload;
      state.lastUpdated = Date.now();
    },
    clearProfile(state) {
      state.profile = null;
      state.lastUpdated = null;
    },
    setLocationsLoading(state, action: PayloadAction<boolean>) {
      state.locations.isLoading = action.payload;
    },
    setLocationsSuccess(state, action: PayloadAction<{ provinces: Province[]; wards: Ward[] }>) {
      state.locations.provinces = action.payload.provinces;
      state.locations.wards = action.payload.wards;
      state.locations.isLoading = false;
      state.locations.error = null;
    },
    setLocationsError(state, action: PayloadAction<string>) {
      state.locations.isLoading = false;
      state.locations.error = action.payload;
    },
    setEditingProfile(state, action: PayloadAction<boolean>) {
      state.isEditingProfile = action.payload;
      if (action.payload && state.profile) {
        state.profileFormData = { ...state.profile };
        state.originalData = { ...state.profileFormData };
      }
    },
    setProfileFormData(state, action: PayloadAction<Partial<TutorProfile>>) {
      state.profileFormData = { ...state.profileFormData, ...action.payload };
      if (state.originalData) {
        state.isDirty =
          JSON.stringify(state.profileFormData) !== JSON.stringify(state.originalData);
      }
    },
    resetProfileForm(state) {
      state.profileFormData = {};
      state.isEditingProfile = false;
      state.isDirty = false;
      state.originalData = null;
      state.validationErrors = {};
    },
    setSubmittingProfile(state, action: PayloadAction<boolean>) {
      state.isSubmittingProfile = action.payload;
    },
    setValidationErrors(state, action: PayloadAction<Record<string, string>>) {
      state.validationErrors = action.payload;
    },
    clearValidationErrors(state) {
      state.validationErrors = {};
    },
    setFieldError(state, action: PayloadAction<{ field: string; error?: string }>) {
      const { field, error } = action.payload;
      if (error) {
        state.validationErrors[field] = error;
      } else {
        delete state.validationErrors[field];
      }
    },
    setFormDirty(state, action: PayloadAction<boolean>) {
      state.isDirty = action.payload;
    },
    setOriginalData(state, action: PayloadAction<TutorProfile>) {
      state.originalData = action.payload;
      state.isDirty = false;
    },
    resetFormState(state) {
      state.isDirty = false;
      state.originalData = null;
      state.validationErrors = {};
    },
    showSuccess(state, action: PayloadAction<string>) {
      state.notification = { show: true, type: 'success', message: action.payload, duration: 4000 };
    },
    showError(state, action: PayloadAction<string>) {
      state.notification = { show: true, type: 'error', message: action.payload, duration: 6000 };
    },
    showWarning(state, action: PayloadAction<string>) {
      state.notification = { show: true, type: 'warning', message: action.payload, duration: 5000 };
    },
    showInfo(state, action: PayloadAction<string>) {
      state.notification = { show: true, type: 'info', message: action.payload, duration: 4000 };
    },
    hideNotification(state) {
      state.notification.show = false;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
    clearError(state) {
      state.error = null;
    },
    setLastUpdated(state) {
      state.lastUpdated = Date.now();
    },
  },
});

// ----------------------
// Exports
// ----------------------
export const {
  setProfile,
  clearProfile,
  setLocationsLoading,
  setLocationsSuccess,
  setLocationsError,
  setEditingProfile,
  setProfileFormData,
  resetProfileForm,
  setSubmittingProfile,
  setValidationErrors,
  clearValidationErrors,
  setFieldError,
  setFormDirty,
  setOriginalData,
  resetFormState,
  showSuccess,
  showError,
  showWarning,
  showInfo,
  hideNotification,
  setLoading,
  setError,
  clearError,
  setLastUpdated,
} = tutorSlice.actions;

// ----------------------
// Selectors
// ----------------------
export const selectTutor = (state: { tutor: TutorState }) => state.tutor;
export const selectProfile = (state: { tutor: TutorState }) => state.tutor.profile;
export const selectLocations = (state: { tutor: TutorState }) => state.tutor.locations;
export const selectIsEditingProfile = (state: { tutor: TutorState }) =>
  state.tutor.isEditingProfile;
export const selectProfileFormData = (state: { tutor: TutorState }) => state.tutor.profileFormData;
export const selectIsSubmittingProfile = (state: { tutor: TutorState }) =>
  state.tutor.isSubmittingProfile;
export const selectValidationErrors = (state: { tutor: TutorState }) =>
  state.tutor.validationErrors;
export const selectFormDirty = (state: { tutor: TutorState }) => state.tutor.isDirty;
export const selectOriginalData = (state: { tutor: TutorState }) => state.tutor.originalData;
export const selectNotification = (state: { tutor: TutorState }) => state.tutor.notification;
export const selectTutorLoading = (state: { tutor: TutorState }) => state.tutor.isLoading;
export const selectTutorError = (state: { tutor: TutorState }) => state.tutor.error;
export const selectLastUpdated = (state: { tutor: TutorState }) => state.tutor.lastUpdated;

export const selectProvinces = (state: { tutor: TutorState }) => state.tutor.locations.provinces;
export const selectWards = (state: { tutor: TutorState }) => state.tutor.locations.wards;
export const selectLocationsLoading = (state: { tutor: TutorState }) =>
  state.tutor.locations.isLoading;
export const selectLocationsError = (state: { tutor: TutorState }) => state.tutor.locations.error;

export default tutorSlice.reducer;
