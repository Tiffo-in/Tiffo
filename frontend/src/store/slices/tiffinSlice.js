import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import tiffinService from '../../services/tiffinService';

const initialState = {
  tiffins: [],
  tiffin: null,
  isLoading: false,
  isError: false,
  message: '',
  pagination: null,
};

export const getTiffins = createAsyncThunk(
  'tiffins/getAll',
  async (params, thunkAPI) => {
    try {
      return await tiffinService.getTiffins(params);
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getTiffin = createAsyncThunk(
  'tiffins/getOne',
  async (id, thunkAPI) => {
    try {
      return await tiffinService.getTiffin(id);
    } catch (error) {
      const message = error.response?.data?.message || error.message;
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const tiffinSlice = createSlice({
  name: 'tiffins',
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
      .addCase(getTiffins.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTiffins.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.message = '';
        state.tiffins = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(getTiffins.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(getTiffin.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getTiffin.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isError = false;
        state.message = '';
        state.tiffin = action.payload.data;
      })
      .addCase(getTiffin.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      });
  },
});

export const { reset } = tiffinSlice.actions;
export default tiffinSlice.reducer;