import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// ----------------------
// Types
// ----------------------

import { ClassItem } from '../../types';

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
  classLevel: string;
  minRate: number;
  maxRate: number;
}

export interface Schedule {
  day_of_week: string | number;
  start_time: string;
  end_time: string;
  duration_minutes: string | number;
}

export interface ClassFormState {
  subject_id: string;
  description: string;
  requirement?: string;
  hourly_price: string | number;
  classLevel: string | number;
  start_date: string;
  end_date: string;
  schedules: Schedule[];
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

// ✅ Helper functions
const calculateEndTime = (startTime: string | number, duration: string | number): string => {
  console.log(`🔍 calculateEndTime:`, { startTime, duration });

  if (!startTime || duration === '' || duration === null || duration === undefined) {
    console.warn('❌ Missing startTime or duration');
    return '';
  }

  const durationNum = Number(duration);
  if (isNaN(durationNum) || durationNum <= 0) {
    console.warn('❌ Invalid duration number:', duration);
    return '';
  }

  const timeStr = String(startTime).trim();
  const timeParts = timeStr.split(':');
  if (timeParts.length !== 2) {
    console.warn('❌ Invalid time format:', timeStr);
    return '';
  }

  const hours = parseInt(timeParts[0], 10);
  const minutes = parseInt(timeParts[1], 10);

  if (isNaN(hours) || isNaN(minutes)) {
    console.warn('❌ NaN detected:', { hours, minutes });
    return '';
  }

  const totalMinutes = hours * 60 + minutes + durationNum;
  const endHours = Math.floor(totalMinutes / 60) % 24;
  const endMinutes = totalMinutes % 60;

  const result = `${String(endHours).padStart(2, '0')}:${String(endMinutes).padStart(2, '0')}`;
  console.log(`✅ Result: ${result}`);
  return result;
};

const calculateDuration = (startTime: string, endTime: string): number => {
  if (!startTime || !endTime) return 0;

  const startParts = startTime.split(':');
  const endParts = endTime.split(':');

  if (startParts.length !== 2 || endParts.length !== 2) return 0;

  const startHours = parseInt(startParts[0], 10);
  const startMinutes = parseInt(startParts[1], 10);
  const endHours = parseInt(endParts[0], 10);
  const endMinutes = parseInt(endParts[1], 10);

  if (isNaN(startHours) || isNaN(startMinutes) || isNaN(endHours) || isNaN(endMinutes)) {
    return 0;
  }

  const startTotalMinutes = startHours * 60 + startMinutes;
  const endTotalMinutes = endHours * 60 + endMinutes;

  const duration = endTotalMinutes - startTotalMinutes;
  return duration > 0 ? duration : 0;
};

// ----------------------
// Async Thunks
// ----------------------
export const fetchAllRecruitingClasses = createAsyncThunk<ClassItem[], Partial<ClassFilters>>(
  'classes/fetchAllRecruitingClasses',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('token');
      const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
      const params = new URLSearchParams({
        status: 'recruiting',
        province_id: filters.province_id || '',
        subject_id: filters.subject_id || '',
        classLevel: filters.classLevel || '',
        min_hourly_price: filters.minRate?.toString() || '0',
        max_hourly_price: filters.maxRate?.toString() || '9999999',
      });
      const response = await axios.get(`${API_URL}/search/classes?${params.toString()}`, config);
      return response.data?.data || [];
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
    classLevel: '',
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
    classLevel: '',
    start_date: '',
    end_date: '',
    schedules: [
      {
        day_of_week: 1,
        start_time: '09:00',
        end_time: '10:00',
        duration_minutes: '60',
      },
    ],
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
      console.log('📝 setFormData payload:', action.payload);
      state.formData = { ...state.formData, ...action.payload } as ClassFormState;

      // ✅ Tính lại end_time cho tất cả schedules nếu cần
      state.formData.schedules.forEach((schedule, idx) => {
        if (schedule.start_time && schedule.duration_minutes && !schedule.end_time) {
          const newEndTime = calculateEndTime(schedule.start_time, schedule.duration_minutes);
          if (newEndTime) {
            schedule.end_time = newEndTime;
            console.log(`✅ Auto-recalculated end_time for schedule[${idx}]: ${newEndTime}`);
          }
        }
      });
    },

    addSchedule: (state) => {
      state.formData.schedules.push({
        day_of_week: 1,
        start_time: '09:00',
        end_time: '10:00',
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

      if (!state.formData.schedules[index]) {
        console.warn(`❌ Schedule at index ${index} not found`);
        return;
      }

      const schedule = state.formData.schedules[index];

      console.log(`\n📝 updateSchedule[${index}].${field} = "${value}"`);

      if (field === 'start_time') {
        schedule.start_time = value;
        console.log(`✏️ Set start_time = "${value}"`);

        // Nếu duration hợp lệ, tính lại end_time
        const durationNum = Number(schedule.duration_minutes);
        if (!isNaN(durationNum) && durationNum > 0) {
          const newEndTime = calculateEndTime(value, durationNum);
          if (newEndTime && !newEndTime.includes('NaN')) {
            schedule.end_time = newEndTime;
            console.log(`✅ Calculated end_time: ${newEndTime}`);
          }
        }
      } else if (field === 'end_time') {
        schedule.end_time = value;
        console.log(`✏️ Set end_time = "${value}"`);

        // Nếu start_time có, tính lại duration
        if (schedule.start_time) {
          const newDuration = calculateDuration(schedule.start_time, value);
          schedule.duration_minutes = String(newDuration);
          console.log(`✅ Calculated duration: ${newDuration}`);
        }
      } else if (field === 'duration_minutes') {
        schedule.duration_minutes = value;
        console.log(`✏️ Set duration_minutes = "${value}"`);

        // Nếu start_time có, tính lại end_time
        if (schedule.start_time) {
          const durationNum = Number(value);
          if (!isNaN(durationNum) && durationNum > 0) {
            const newEndTime = calculateEndTime(schedule.start_time, durationNum);
            if (newEndTime && !newEndTime.includes('NaN')) {
              schedule.end_time = newEndTime;
              console.log(`✅ Calculated end_time: ${newEndTime}`);
            }
          }
        }
      } else {
        (schedule as Record<string, any>)[field] = value;
      }

      console.log(`After:`, schedule);
    },

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

    resetFilters: (state) => {
      state.filters = initialState.filters;
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
export const selectFormData = (state: { classes: ClassesState }) => state.classes.formData;
