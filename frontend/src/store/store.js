import { configureStore } from '@reduxjs/toolkit';
import authSlice from './slices/authSlice';
import tiffinSlice from './slices/tiffinSlice';
import subscriptionSlice from './slices/subscriptionSlice';
import customerSlice from './slices/customerSlice';

export const store = configureStore({
  reducer: {
    auth: authSlice,
    tiffins: tiffinSlice,
    subscriptions: subscriptionSlice,
    customers: customerSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export default store;