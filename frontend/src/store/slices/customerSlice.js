import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import customerService from '../../services/customerService';

// Async thunks
export const fetchPartnerCustomers = createAsyncThunk(
  'customers/fetchPartnerCustomers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await customerService.getPartnerCustomers();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchCustomerCalendar = createAsyncThunk(
  'customers/fetchCustomerCalendar',
  async ({ customerId, month, year }, { rejectWithValue }) => {
    try {
      const response = await customerService.getCustomerCalendar(customerId, month, year);
      return { customerId, calendar: response.data };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateDeliveryStatus = createAsyncThunk(
  'customers/updateDeliveryStatus',
  async ({ deliveryId, status }, { rejectWithValue }) => {
    try {
      const response = await customerService.updateDeliveryStatus(deliveryId, status);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const customerSlice = createSlice({
  name: 'customers',
  initialState: {
    customers: [],
    selectedCustomer: null,
    calendars: {},
    loading: false,
    error: null,
  },
  reducers: {
    setSelectedCustomer: (state, action) => {
      state.selectedCustomer = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch customers
      .addCase(fetchPartnerCustomers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPartnerCustomers.fulfilled, (state, action) => {
        state.loading = false;
        state.customers = action.payload;
        if (action.payload.length > 0 && !state.selectedCustomer) {
          state.selectedCustomer = action.payload[0];
        }
      })
      .addCase(fetchPartnerCustomers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch calendar
      .addCase(fetchCustomerCalendar.fulfilled, (state, action) => {
        const { customerId, calendar } = action.payload;
        state.calendars[customerId] = calendar;
      })
      // Update delivery status — patch the cached calendar in place so the grid
      // reflects the new status immediately, without waiting for a re-fetch.
      .addCase(updateDeliveryStatus.fulfilled, (state, action) => {
        const { deliveryId, status } = action.meta.arg;
        // calendars: { [customerId]: { [dateStr]: { [mealType]: { id, status } } } }
        Object.values(state.calendars).forEach((calendar) => {
          Object.values(calendar).forEach((day) => {
            Object.values(day).forEach((delivery) => {
              if (delivery && delivery.id === deliveryId) {
                delivery.status = status;
              }
            });
          });
        });
      });
  },
});

export const { setSelectedCustomer, clearError } = customerSlice.actions;
export default customerSlice.reducer;
