import { configureStore } from '@reduxjs/toolkit';
import timeframeReducer from './slices/timeframeSlice';
import lastCandleReducer from './slices/lastCandleSlice';

const store = configureStore({
  reducer: {
    timeframe: timeframeReducer,
    lastCandle: lastCandleReducer,
  },
});

export default store;

