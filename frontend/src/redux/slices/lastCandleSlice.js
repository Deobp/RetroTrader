import { createSlice } from '@reduxjs/toolkit';

// const lastCandleSlice = createSlice({
//   name: 'lastCandle',
//   initialState: {
//     closePrice: null,
//   },
//   reducers: {
//     setLastCandleClosePrice: (state, action) => {
//       state.closePrice = action.payload;
//     },
//     resetLastCandleClosePrice: (state) => {
//       state.closePrice = null;
//     },
//   },
// });

// export const { setLastCandleClosePrice, resetLastCandleClosePrice } = lastCandleSlice.actions;
// export default lastCandleSlice.reducer; 


const lastCandleSlice = createSlice({
  name: 'lastCandle',
  initialState: {
    closePrice: null,
    time: null, // Store last candle time globally
  },
  reducers: {
    setLastCandleClosePrice: (state, action) => {
      state.closePrice = action.payload.closePrice;
      state.time = action.payload.time;
    },
    resetLastCandle: (state) => {
      state.closePrice = null;
      state.time = null;
    },
  },
});

export const { setLastCandleClosePrice, resetLastCandle } = lastCandleSlice.actions;
export default lastCandleSlice.reducer;