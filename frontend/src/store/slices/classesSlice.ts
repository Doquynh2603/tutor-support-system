import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// ----------------------
// Types
// ----------------------

export interface ClassItem {
  class_id: string;
  subject_id: string;
  subject_name?: string;
  province_id: string;
  description: string;
  hourly_price: number;
  hourly_rate?: number;
  gradeLevel?: string;
  educationLevel?: string;
  status?: string;
  tutor_id?: string;
  tutor_name?: string;
  tutor_email?: string;
  tutor_phone?: string;
  tutor_rating?: number;
  tutor_reviews?: number;
  tutor_description?: string;
  schedule_count?: number;
  invited_tutors_count?: number;
  applied_tutors_count?: number;
  [key: string]: any;
}

export interface Tutor {
  tutor_id: string;
  user_id: string;
  name: string;
  email?: string;
  phone?: string;
  hourly_rate?: number;
  bio?: string;
  experience_years?: number;
  subjects?: string;
  avg_rating?: number;
  total_reviews?: number;
  rating?: number;
  reviews?: number;
  description?: string;
}

export interface ClassFilters {
  province_id: string;
  subject_id: string;
  gradeLevel: string;
  educationLevel: string;
  minRate: number;
  maxRate: number;
}

export interface ClassFormState {
  subject_id: string;
  description: string;
  requirement?: string;
  hourly_price: string;
  schedules: Array<{
    day_of_week: string;
    start_date: string;
    start_time: string;
    duration_minutes: string;
  }>;
}

interface ClassesState {
  allClasses: ClassItem[];
  filteredClasses: ClassItem[];
  lastFetched: number | null;
  filters: ClassFilters;
  loading: boolean;
  error: string | null;
  formData: ClassFormState;
  selectedTutors: string[];
  suggestedTutors: Tutor[];
}
// ----------------------
// Async Thunks
// ----------------------
export const fetchAllRecruitingClasses = createAsyncThunk<ClassItem[], void>(
  'classes/fetchAllRecruitingClasses',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};

      const response = await axios.get(`${API_URL}/search/classes?status=recruiting`, config);
      return response.data.data || [];
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Lỗi khi tải lớp');
    }
  }
);

// ----------------------
// Initial State
// ----------------------
const initialState: ClassesState = {
  allClasses: [],
  filteredClasses: [],
  lastFetched: null,
  filters: {
    province_id: '',
    subject_id: '',
    gradeLevel: '',
    educationLevel: '',
    minRate: 0,
    maxRate: 9999999,
  },
  loading: false,
  error: null,
  formData: {
    subject_id: '',
    description: '',
    requirement: '',
    hourly_price: '',
    schedules: [{ day_of_week: '1', start_date: '', start_time: '09:00', duration_minutes: '60' }],
  },
  selectedTutors: [],
  suggestedTutors: [],
};

// ----------------------
// Slice
// ----------------------
const classesSlice = createSlice({
  name: 'classes',
  initialState,
  reducers: {
    setFormData: (state, action: PayloadAction<Partial<ClassFormState>>) => {
      state.formData = { ...state.formData, ...action.payload } as ClassFormState;
    },

    addSchedule: (state) => {
      state.formData.schedules.push({
        day_of_week: '1',
        start_date: '',
        start_time: '09:00',
        duration_minutes: '60',
      });
    },
    removeSchedule: (state, action: PayloadAction<number>) => {
      state.formData.schedules = state.formData.schedules.filter((_, i) => i !== action.payload);
    },
    updateSchedule: (
      state,
      action: PayloadAction<{ index: number; field: string; value: string }>
    ) => {
      const { index, field, value } = action.payload;
      if (state.formData.schedules[index]) {
        (state.formData.schedules[index] as Record<string, string>)[field] = value;
      }
    },
    // Tutor selection
    toggleTutorSelection: (state, action: PayloadAction<string>) => {
      const tutorId = action.payload;
      const index = state.selectedTutors.indexOf(tutorId);
      if (index > -1) {
        state.selectedTutors.splice(index, 1);
      } else {
        state.selectedTutors.push(tutorId);
      }
    },

    setSuggestedTutors: (state, action: PayloadAction<Tutor[]>) => {
      state.suggestedTutors = action.payload;
    },

    clearSelectedTutors: (state) => {
      state.selectedTutors = [];
    },
    resetFormData: (state) => {
      state.formData = { ...initialState.formData };
      state.selectedTutors = [];
    },

    filterClasses: (state, action: PayloadAction<Partial<ClassFilters>>) => {
      state.filters = { ...state.filters, ...action.payload };
      let filtered = state.allClasses;

      if (state.filters.province_id) {
        filtered = filtered.filter((c: ClassItem) => c.province_id === state.filters.province_id);
      }
      if (state.filters.subject_id) {
        filtered = filtered.filter((c: ClassItem) => c.subject_id === state.filters.subject_id);
      }
      if (state.filters.gradeLevel) {
        filtered = filtered.filter((c: ClassItem) => c.gradeLevel === state.filters.gradeLevel);
      }
      if (state.filters.educationLevel) {
        filtered = filtered.filter(
          (c: ClassItem) => c.educationLevel === state.filters.educationLevel
        );
      }
      filtered = filtered.filter(
        (c: ClassItem) =>
          (c.hourly_rate || 0) >= state.filters.minRate &&
          (c.hourly_rate || 0) <= state.filters.maxRate
      );

      state.filteredClasses = filtered;
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.filteredClasses = state.allClasses;
    },
    clearClasses: (state) => {
      state.allClasses = [];
      state.filteredClasses = [];
      state.lastFetched = null;
      state.filters = initialState.filters;
    },
    updateClassesFromBackground: (state, action: PayloadAction<ClassItem[]>) => {
      const newData = action.payload;
      const dataChanged = JSON.stringify(state.allClasses) !== JSON.stringify(newData);
      if (dataChanged) {
        state.allClasses = newData;
        state.filteredClasses = newData;
        state.lastFetched = Date.now();
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllRecruitingClasses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllRecruitingClasses.fulfilled, (state, action: PayloadAction<ClassItem[]>) => {
        state.loading = false;
        state.allClasses = action.payload;
        state.filteredClasses = action.payload;
        state.lastFetched = Date.now();
      })
      .addCase(fetchAllRecruitingClasses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setFormData,
  addSchedule,
  removeSchedule,
  updateSchedule,
  resetFormData,
  toggleTutorSelection,
  setSuggestedTutors,
  clearSelectedTutors,
  filterClasses,
  resetFilters,
  clearClasses,
  updateClassesFromBackground,
} = classesSlice.actions;

export default classesSlice.reducer;

// ----------------------
// Selectors
// ----------------------
export const selectAllClasses = (state: { classes: ClassesState }) => state.classes.allClasses;
export const selectFilteredClasses = (state: { classes: ClassesState }) =>
  state.classes.filteredClasses;
export const selectClassesLoading = (state: { classes: ClassesState }) => state.classes.loading;
export const selectClassesError = (state: { classes: ClassesState }) => state.classes.error;
export const selectClassFilters = (state: { classes: ClassesState }) => state.classes.filters;
