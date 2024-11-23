import React from "react";

const TimeframeControls = ({tf}) => {
  return (
    <div className="timeframe-buttons">
      <button onClick={() => setTimeframe('1m')}>M1</button>
      <button onClick={() => setTimeframe('5m')}>M5</button>
      <button onClick={() => setTimeframe('15m')}>M15</button>
      <button onClick={() => setTimeframe('30m')}>M30</button>
      <button onClick={() => setTimeframe('1h')}>H1</button>
      <button onClick={() => setTimeframe('4h')}>H4</button>
      <button onClick={() => setTimeframe('1d')}>D1</button>
    </div>
  );
};

export default TimeframeControls;