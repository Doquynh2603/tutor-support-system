import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { Province, Subject } from '../../types';

// ----------------------
// Constants
// ----------------------
const API_URL = 'http://localhost:5000/api';
const DATA_CACHE_TIME = 24 * 60 * 60 * 1000; // 24 hours

// ----------------------
// Types
// ----------------------

interface CachedData<T> {
  data: T[];
  lastFetched: number | null;
  loading: boolean;
  error: string | null;
}

interface DataState {
  provinces: CachedData<Province>;
  subjects: CachedData<Subject>;
}

// ----------------------
// Async Thunks
// ----------------------
export const fetchProvinces = createAsyncThunk<Province[], void, { state: { data: DataState } }>(
  'data/fetchProvinces',
  async (_, { rejectWithValue, getState }) => {
    const state = getState();
    const now = Date.now();

    const cached = state.data.provinces;
    if (
      cached.data.length > 0 &&
      cached.lastFetched &&
      now - cached.lastFetched < DATA_CACHE_TIME
    ) {
      console.log('✅ Using cached provinces data');
      return cached.data;
    }

    try {
      const response = await axios.get(`${API_URL}/locations/provinces`);
      return response.data.data || [];
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Lỗi khi tải tỉnh/thành');
    }
  }
);

export const fetchSubjects = createAsyncThunk<Subject[], void, { state: { data: DataState } }>(
  'data/fetchSubjects',
  async (_, { rejectWithValue, getState }) => {
    const state = getState();
    const now = Date.now();

    const cached = state.data.subjects;
    if (
      cached.data.length > 0 &&
      cached.lastFetched &&
      now - cached.lastFetched < DATA_CACHE_TIME
    ) {
      console.log('✅ Using cached subjects data');
      return cached.data;
    }

    try {
      const response = await axios.get(`${API_URL}/subjects`);
      return response.data.data || [];
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(err.response?.data?.message || 'Lỗi khi tải môn học');
    }
  }
);

// ----------------------
// Initial State
// ----------------------
const initialState: DataState = {
  provinces: { data: [], lastFetched: null, loading: false, error: null },
  subjects: { data: [], lastFetched: null, loading: false, error: null },
};

// ----------------------
// Slice
// ----------------------
const dataSlice = createSlice({
  name: 'data',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Provinces
      .addCase(fetchProvinces.pending, (state) => {
        state.provinces.loading = true;
        state.provinces.error = null;
      })
      .addCase(fetchProvinces.fulfilled, (state, action) => {
        state.provinces.loading = false;
        state.provinces.data = action.payload;
        state.provinces.lastFetched = Date.now();
      })
      .addCase(fetchProvinces.rejected, (state, action) => {
        state.provinces.loading = false;
        state.provinces.error = action.payload as string;
      })

      // Subjects
      .addCase(fetchSubjects.pending, (state) => {
        state.subjects.loading = true;
        state.subjects.error = null;
      })
      .addCase(fetchSubjects.fulfilled, (state, action) => {
        state.subjects.loading = false;
        state.subjects.data = action.payload;
        state.subjects.lastFetched = Date.now();
      })
      .addCase(fetchSubjects.rejected, (state, action) => {
        state.subjects.loading = false;
        state.subjects.error = action.payload as string;
      });
  },
});

export default dataSlice.reducer;

// ----------------------
// Selectors
// ----------------------
export const selectProvinces = (state: { data: DataState }) => state.data.provinces.data;
export const selectProvincesLoading = (state: { data: DataState }) => state.data.provinces.loading;
export const selectProvincesError = (state: { data: DataState }) => state.data.provinces.error;

export const selectSubjects = (state: { data: DataState }) => state.data.subjects.data;
export const selectSubjectsLoading = (state: { data: DataState }) => state.data.subjects.loading;
export const selectSubjectsError = (state: { data: DataState }) => state.data.subjects.error;
