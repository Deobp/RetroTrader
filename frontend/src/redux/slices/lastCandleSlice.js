import { createSlice } from '@reduxjs/toolkit';

const lastCandleSlice = createSlice({
  name: 'lastCandle',
  initialState: {
    closePrice: null,
  },
  reducers: {
    setLastCandleClosePrice: (state, action) => {
      state.closePrice = action.payload;
    },
    resetLastCandleClosePrice: (state) => {
      state.closePrice = null;
    },
  },
});

export const { setLastCandleClosePrice, resetLastCandleClosePrice } = lastCandleSlice.actions;
export default lastCandleSlice.reducer; 