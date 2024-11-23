import React, { useState } from 'react'; // Fix the import

const Controls = ({ onTimeframeChange, currentTimeframe, onRandomNavigation, onAddCandle }) => {
  const [timeframe, setTimeframe] = useState('M1'); // Move useState inside the component

  return (
    <div className="controls">
      {/* Optional: Uncomment if needed */}
      {/* <div className="bar-options">
        {BAR_OPTIONS.map((bars) => (
          <button
            key={bars}
            onClick={() => setBarCount(bars)}
            className={`px-2 py-1 rounded ${
              barCount === bars
                ? 'bg-green-600 text-white'
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            {bars} Bars
          </button>
        ))}
      </div> */}
      <div className="controls-container">
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf}
            onClick={() => {
              setTimeframe(tf); // Update local state
              onTimeframeChange(tf); // Call the external callback
            }}
            className={`controls-button ${timeframe === tf ? 'active' : ''}`}
          >
            {tf}
          </button>
        ))}
      </div>
      <div className="actions">
        <button onClick={onRandomNavigation} className="action-button">
          Random Point
        </button>
        <button onClick={onAddCandle} className="action-button">
          Add Candle
        </button>
      </div>
    </div>
  );
};

export default Controls;
