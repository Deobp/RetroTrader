import React from "react";

const TimeframeControls = ({ setTf, activeTf }) => {
  return (
    <div className="timeframe-buttons">
      
      <button onClick={() => setTf('1m')} className={activeTf === '1m' ? 'active' : ''}>M1</button>
      <button onClick={() => setTf('5m')}>M5</button>
      <button onClick={() => setTf('15m')}>M15</button>
      <button onClick={() => setTf('30m')}>M30</button>
      <button onClick={() => setTf('1h')}>H1</button>
      <button onClick={() => setTf('4h')}>H4</button>
      <button onClick={() => setTf('1d')}>D1</button>
    </div>
  );
};

export default TimeframeControls;