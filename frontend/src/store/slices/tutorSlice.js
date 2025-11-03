import { createSlice } from '@reduxjs/toolkit';

const initialState = {
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
  originalData: null, //bản sao dữ liệu gốc để so sánh

  notification: {
    show: false,
    type: 'info',
    message: '',
    duration: 5000,
  },
  isLoading: false,
  error: null,
};

const tutorSlice = createSlice({
  name: 'tutor',
  initialState,
  reducers: {
    setProfile(state, action) {
      state.profile = action.payload;
      state.lastUpdated = Date.now();
    },
    clearProfile(state) {
      state.profile = null;
      state.lastUpdated = null;
    },
    setLocationLoading(state, action) {
      state.locations.isLoading = action.payload;
    },
    setLocationSuccess(state, action) {
      const { provinces, wards } = action.payload;
      state.locations.provinces = provinces;
      state.locations.wards = wards;
      state.locations.isLoading = false;
      state.locations.error = null;
    },
    setLocationError(state, action) {
      state.locations.isLoading = false;
      state.locations.error = action.payload;
    },
    setEditingProfile(state, action) {
      state.isEditingProfile = action.payload;
      if (action.payload && state.profile) {
        state.profileFormData = {
          fullName: state.profile.fullName || '',
          dateOfBirth: state.profile.dateOfBirth || '',
          phone: state.profile.phone || '',
          addressId: state.profile.ward_id || '',
          locationDetail: state.profile.locationDetail || '',
          introduction: state.profile.introduction || '',
          experienceYears: state.profile.experienceYears || '',
          teachingStyle: state.profile.teachingStyle || '',
          specialties: state.profile.specialties || '',
        };
        state.originalData = { ...state.profileFormData };
      }
    },
    setProfileFormData(state, action) {
      state.profileFormData = { ...state.profileFormData, ...action.payload };
      if (state.originalData) {
        state.isDirty =
          JSON.stringify(state.profileFormData) !== JSON.stringify(state.originalData);
      }
    },
    resetProfileForm: (state) => {
      state.profileFormData = {};
      state.isEditingProfile = false;
      state.isDirty = false;
      state.originalData = null;
      state.validationErrors = {};
    },
    setSubmittingProfile(state, action) {
      state.isSubmittingProfile = action.payload;
    },
    setValidationErrors: (state, action) => {
      state.validationErrors = action.payload;
    },

    clearValidationErrors: (state) => {
      state.validationErrors = {};
    },
    setFieldError: (state, action) => {
      const { field, error } = action.payload;
      if (error) {
        state.validationErrors[field] = error;
      } else {
        delete state.validationErrors[field];
      }
    },
    //điều khiển trạng thái form
    setFormDirty: (state, action) => {
      state.isDirty = action.payload;
    },
    //cập nhật dữ liệu gốc
    setOriginalData: (state, action) => {
      state.originalData = action.payload;
      state.isDirty = false;
    },
    resetFormState: (state) => {
      state.isDirty = false;
      state.originalData = null;
      state.validationErrors = {};
    },

    // Notification actions
    showSuccess: (state, action) => {
      state.notification = {
        show: true,
        type: 'success',
        message: action.payload,
        duration: 4000,
      };
    },

    showError: (state, action) => {
      state.notification = {
        show: true,
        type: 'error',
        message: action.payload,
        duration: 6000,
      };
    },

    showWarning: (state, action) => {
      state.notification = {
        show: true,
        type: 'warning',
        message: action.payload,
        duration: 5000,
      };
    },
    // Thông báo thông tin
    showInfo: (state, action) => {
      state.notification = {
        show: true,
        type: 'info',
        message: action.payload,
        duration: 4000,
      };
    },
    // Ẩn thông báo
    hideNotification: (state) => {
      state.notification.show = false;
    },

    // General loading actions
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    setError: (state, action) => {
      state.error = action.payload;
    },

    clearError: (state) => {
      state.error = null;
    },

    // Update last updated timestamp
    setLastUpdated: (state) => {
      state.lastUpdated = Date.now();
    },
  },
});
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

export const selectTutor = (state) => state.tutor;
export const selectProfile = (state) => state.tutor.profile;
export const selectLocations = (state) => state.tutor.locations;
export const selectIsEditingProfile = (state) => state.tutor.isEditingProfile;
export const selectProfileFormData = (state) => state.tutor.profileFormData;
export const selectIsSubmittingProfile = (state) => state.tutor.isSubmittingProfile;
export const selectValidationErrors = (state) => state.tutor.validationErrors;
export const selectFormDirty = (state) => state.tutor.isDirty;
export const selectOriginalData = (state) => state.tutor.originalData;
export const selectNotification = (state) => state.tutor.notification;
export const selectTutorLoading = (state) => state.tutor.isLoading;
export const selectTutorError = (state) => state.tutor.error;
export const selectLastUpdated = (state) => state.tutor.lastUpdated;

// Derived selectors
export const selectProvinces = (state) => state.tutor.locations.provinces;
export const selectWards = (state) => state.tutor.locations.wards;
export const selectLocationsLoading = (state) => state.tutor.locations.isLoading;
export const selectLocationsError = (state) => state.tutor.locations.error;

export default tutorSlice.reducer;
