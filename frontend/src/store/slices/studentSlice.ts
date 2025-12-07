// studentSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// ----------------------
// Types
// ----------------------
import { StudentProfile, ValidationErrors } from '../../types';

export interface NotificationState {
  show: boolean;
  type: 'success' | 'error' | 'warning';
  message: string;
  duration?: number;
}

export interface StudentState {
  profile: StudentProfile | null;
  isEditingProfile: boolean;
  isSubmittingProfile: boolean;
  profileFormData: StudentProfile;
  validationErrors: ValidationErrors;
  isDirty: boolean;
  notification: NotificationState;
}

// ----------------------
// Initial State
// ----------------------
const initialState: StudentState = {
  profile: null,
  isEditingProfile: false,
  isSubmittingProfile: false,
  profileFormData: {
    student_profile_id: '',
    user_id: '',
    name: '',
    email: '',
    phone: '',
    locationDetail: '',
    dateOfBirth: '',
    gradeLevel: '',
    school: '',
  },
  validationErrors: {},
  isDirty: false,
  notification: {
    show: false,
    type: 'success',
    message: '',
    duration: 3000,
  },
};

// ----------------------
// Slice
// ----------------------
const studentSlice = createSlice({
  name: 'student',
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<StudentProfile>) => {
      state.profile = action.payload;
    },
    clearProfile: (state) => {
      state.profile = null;
    },
    setEditingProfile: (state, action: PayloadAction<boolean>) => {
      state.isEditingProfile = action.payload;
      if (action.payload && state.profile) {
        state.profileFormData = { ...state.profile };
      }
    },
    setProfileFormData: (state, action: PayloadAction<Partial<StudentProfile>>) => {
      state.profileFormData = { ...state.profileFormData, ...action.payload };
      state.isDirty = true;
    },
    resetProfileForm: (state) => {
      state.profileFormData = initialState.profileFormData;
      state.isDirty = false;
      state.isEditingProfile = false;
    },
    resetFormState: (state) => {
      state.validationErrors = {};
      state.isDirty = false;
    },
    setValidationErrors: (state, action: PayloadAction<ValidationErrors>) => {
      state.validationErrors = action.payload;
    },
    setSubmittingProfile: (state, action: PayloadAction<boolean>) => {
      state.isSubmittingProfile = action.payload;
    },
    showNotification: (state, action: PayloadAction<Omit<NotificationState, 'show'>>) => {
      state.notification = {
        show: true,
        type: action.payload.type || 'success',
        message: action.payload.message,
        duration: action.payload.duration || 3000,
      };
    },
    hideNotification: (state) => {
      state.notification.show = false;
    },
  },
});

// ----------------------
// Selectors
// ----------------------
export const selectStudentProfile = (state: { student: StudentState }) => state.student.profile;
export const selectIsEditingProfile = (state: { student: StudentState }) =>
  state.student.isEditingProfile;
export const selectIsSubmittingProfile = (state: { student: StudentState }) =>
  state.student.isSubmittingProfile;
export const selectProfileFormData = (state: { student: StudentState }) =>
  state.student.profileFormData;
export const selectValidationErrors = (state: { student: StudentState }) =>
  state.student.validationErrors;
export const selectIsDirty = (state: { student: StudentState }) => state.student.isDirty;
export const selectNotification = (state: { student: StudentState }) => state.student.notification;

// ----------------------
// Exports
// ----------------------
export const {
  setProfile,
  clearProfile,
  setEditingProfile,
  setProfileFormData,
  resetProfileForm,
  resetFormState,
  setValidationErrors,
  setSubmittingProfile,
  showNotification,
  hideNotification,
} = studentSlice.actions;

export default studentSlice.reducer;
