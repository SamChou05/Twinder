import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { User, Session } from '@supabase/supabase-js';
import { supabase, signIn, signUp, signOut, getCurrentUser, getSession } from '../../supabaseClient';

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  initialized: boolean;
}

const initialState: AuthState = {
  user: null,
  session: null,
  loading: false,
  error: null,
  initialized: false,
};

// Initialize the auth state
export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { rejectWithValue }) => {
    try {
      // Check if we have an active session
      const session = await getSession();
      if (session) {
        const user = await getCurrentUser();
        return { user, session };
      }
      return { user: null, session: null };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to initialize auth');
    }
  }
);

// Login user
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const data = await signIn(email, password);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to login');
    }
  }
);

// Register user
export const register = createAsyncThunk(
  'auth/register',
  async ({ 
    email, 
    password, 
    name, 
    age,
    latitude,
    longitude,
    location
  }: { 
    email: string; 
    password: string; 
    name: string; 
    age: number;
    latitude?: number;
    longitude?: number;
    location?: string;
  }, { rejectWithValue }) => {
    try {
      const userData = { 
        name, 
        age,
        latitude,
        longitude,
        location
      };
      
      const data = await signUp(email, password, userData);
      return data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to register');
    }
  }
);

// Logout user
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await signOut();
      return true;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Failed to logout');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Initialize auth
    builder
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.session = action.payload.session;
        state.initialized = true;
      })
      .addCase(initializeAuth.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
        state.initialized = true;
      });

    // Login
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.session = action.payload.session;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Register
    builder
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        // Note: Supabase might not immediately return session on signup depending on your config
        if (action.payload.session) {
          state.user = action.payload.user;
          state.session = action.payload.session;
        }
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });

    // Logout
    builder
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.session = null;
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer; 