import React from 'react';

const TIMEFRAMES = [
  { label: '1m', value: '1m' },
  { label: '5m', value: '5m' },
  { label: '15m', value: '15m' },
  { label: '30m', value: '30min' },
  { label: '1h', value: '1h' },
  { label: '4h', value: '4h' },
  { label: '1d', value: '1day' },
];

const Controls = ({ onTimeframeChange, currentTimeframe }) => {
  return (
    <div className="controls-container">
      {TIMEFRAMES.map(({ label, value }) => (
        <button
          key={value}
          onClick={() => onTimeframeChange(value)}
          className={`controls-button ${
            currentTimeframe === value ? 'active' : ''
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default Controls;
