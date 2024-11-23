import React from 'react';

const TIMEFRAMES = [
  { label: '1m', value: '1m' },
  { label: '5m', value: '5m' },
  { label: '15m', value: '15m' },
  { label: '30m', value: '30min' },
  { label: '1h', value: '1h' },
  { label: '4h', value: '4h' },
  { label: '1D', value: '1day' },
];

const Controls = ({ onTimeframeChange, currentTimeframe }) => {
  return (
    <div className="flex gap-2 p-2 bg-gray-800 rounded-lg">
      {TIMEFRAMES.map(({ label, value }) => (
        <button
          key={value}
          onClick={() => onTimeframeChange(value)}
          className={`px-3 py-1 rounded ${
            currentTimeframe === value
              ? 'bg-blue-600 text-white ring ring-blue-400'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
};

export default Controls;
