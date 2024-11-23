import React, { useState, useEffect } from 'react';
import { TIMEFRAMES, BAR_OPTIONS } from '../../constants/chartConfig';
import { getSynchronizedDataIndex } from '../../utils/chartUtils'; // Import the helper function


const Controls = ({ onTimeframeChange, currentTimeframe, onRandomNavigation, onAddCandle, fullDataset }) => {
  const [timeframe, setTimeframe] = useState('M1');
  const [barCount, setBarCount] = useState(250);

  useEffect(() => {
    if (Array.isArray(fullDataset) && fullDataset.length > 0) {
      const synchronizedIndex = getSynchronizedDataIndex(currentTimeframe, fullDataset);
      onTimeframeChange(timeframe, fullDataset.slice(synchronizedIndex));
    }
  }, [timeframe, currentTimeframe, fullDataset, onTimeframeChange]);

  return (
    <div className="controls">
      <div className="bar-options">
        {BAR_OPTIONS.map((bars) => (
          <button
            key={bars}
            onClick={() => {
              setBarCount(bars);
              onTimeframeChange(timeframe, fullDataset.slice(-bars));
            }}
            className={`px-2 py-1 rounded ${
              barCount === bars
                ? 'bg-green-600 text-white'
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            {bars} Bars
          </button>
        ))}
      </div>
      <div className="controls-container">
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf}
            onClick={() => {
                            // upd local state
                            setTimeframe(tf); 
                            // call the external callback
                            onTimeframeChange(tf); 
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