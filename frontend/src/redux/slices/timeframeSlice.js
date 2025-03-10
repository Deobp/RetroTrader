import { createSlice } from '@reduxjs/toolkit';

const timeframeSlice = createSlice({
  name: 'timeframe',
  //default state
  initialState: 'M1',
  reducers: {
    setTimeframe: (state, action) => action.payload,
  },
});

export const { setTimeframe } = timeframeSlice.actions;
export default timeframeSlice.reducer;
