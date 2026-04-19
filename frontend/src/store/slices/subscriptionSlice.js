import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import subscriptionService from '../../services/subscriptionService';

const initialState = {
  subscriptions: [],
  subscription: null,
  subscriptionDetails: null,
  isLoading: false,
  isError: false,
  message: '',
};

export const getSubscriptions = createAsyncThunk(
  'subscriptions/getAll',
  async (_, thunkAPI) => {
    try {
      return await subscriptionService.getSubscriptions();
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const createSubscription = createAsyncThunk(
  'subscriptions/create',
  async (subscriptionData, thunkAPI) => {
    try {
      return await subscriptionService.createSubscription(subscriptionData);
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getSubscriptionDetails = createAsyncThunk(
  'subscriptions/getDetails',
  async (id, thunkAPI) => {
    try {
      return await subscriptionService.getSubscriptionDetails(id);
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const subscriptionSlice = createSlice({
  name: 'subscriptions',
  initialState,
  reducers: {
    reset: (state) => {
      state.isLoading = false;
      state.isError = false;
      state.message = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(getSubscriptions.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getSubscriptions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.subscriptions = action.payload.data;
      })
      .addCase(getSubscriptions.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(createSubscription.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(createSubscription.fulfilled, (state, action) => {
        state.isLoading = false;
        state.subscriptions.push(action.payload.data);
      })
      .addCase(createSubscription.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getSubscriptionDetails.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getSubscriptionDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.subscriptionDetails = action.payload.data;
      })
      .addCase(getSubscriptionDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;