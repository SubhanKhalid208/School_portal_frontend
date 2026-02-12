import { configureStore } from '@reduxjs/toolkit';
import { apiSlice } from './apiSlice';

export const makeStore = () => {
  return configureStore({
    reducer: {
      // API slice ka reducer yahan add hoga
      [apiSlice.reducerPath]: apiSlice.reducer,
    },
    // RTK-Query ke liye middleware lazmi hai
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(apiSlice.middleware),
  });
};