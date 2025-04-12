import { configureStore } from '@reduxjs/toolkit';
import duoReducer from './slices/duoSlice';
import authReducer from './slices/authSlice';

export const store = configureStore({
  reducer: {
    duo: duoReducer,
    auth: authReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 