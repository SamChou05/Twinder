import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import api from '../../services/api';

interface User {
  id: string;
  name: string;
  photos: string[];
}

export interface Duo {
  id: string;
  title: string;
  bio?: string;
  photos: string[];
  user1: User;
  user2: User;
}

interface DuoState {
  duos: Duo[];
  activeDuo: Duo | null;
  loading: boolean;
  error: string | null;
}

const initialState: DuoState = {
  duos: [],
  activeDuo: null,
  loading: false,
  error: null,
};

// Async thunk for fetching user's duos
export const getUserDuos = createAsyncThunk(
  'duo/getUserDuos',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/api/profile/duo');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error || 'Failed to fetch duos');
    }
  }
);

// Create a new duo profile
export const createDuo = createAsyncThunk<Duo, { title: string; bio?: string; photos?: string[]; userId2: string }>(
  'duo/createDuo',
  async (duoData, { rejectWithValue }) => {
    try {
      const response = await api.post<Duo>('/profile/duo', duoData);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to create duo profile';
      return rejectWithValue(message);
    }
  }
);

// Get a specific duo profile
export const getDuo = createAsyncThunk<Duo, string>(
  'duo/getDuo',
  async (duoId, { rejectWithValue }) => {
    try {
      const response = await api.get<Duo>(`/profile/duo/${duoId}`);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to fetch duo profile';
      return rejectWithValue(message);
    }
  }
);

// Update a duo profile
export const updateDuo = createAsyncThunk<Duo, { id: string; data: Partial<{ title: string; bio?: string; photos?: string[] }> }>(
  'duo/updateDuo',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put<Duo>(`/profile/duo/${id}`, data);
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.error || 'Failed to update duo profile';
      return rejectWithValue(message);
    }
  }
);

const duoSlice = createSlice({
  name: 'duo',
  initialState,
  reducers: {
    setActiveDuo: (state, action: PayloadAction<Duo>) => {
      state.activeDuo = action.payload;
    },
    clearActiveDuo: (state) => {
      state.activeDuo = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getUserDuos.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUserDuos.fulfilled, (state, action: PayloadAction<Duo[]>) => {
        state.duos = action.payload;
        state.loading = false;
      })
      .addCase(getUserDuos.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Create duo profile
    builder
      .addCase(createDuo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDuo.fulfilled, (state, action: PayloadAction<Duo>) => {
        state.loading = false;
        state.duos.push(action.payload);
      })
      .addCase(createDuo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Get specific duo
    builder
      .addCase(getDuo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDuo.fulfilled, (state, action: PayloadAction<Duo>) => {
        state.loading = false;
        state.activeDuo = action.payload;
      })
      .addCase(getDuo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Update duo
    builder
      .addCase(updateDuo.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDuo.fulfilled, (state, action: PayloadAction<Duo>) => {
        state.loading = false;
        const index = state.duos.findIndex(duo => duo.id === action.payload.id);
        if (index !== -1) {
          state.duos[index] = action.payload;
        }
        if (state.activeDuo && state.activeDuo.id === action.payload.id) {
          state.activeDuo = action.payload;
        }
      })
      .addCase(updateDuo.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { setActiveDuo, clearActiveDuo } = duoSlice.actions;
export default duoSlice.reducer; 