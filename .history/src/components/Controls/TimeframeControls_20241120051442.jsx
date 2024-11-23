import Reactm from 'react';
import { useState } from 'react';
import { BAR_OPTIONS, TIMEFRAMES } from '../../constants/chartConfig';
const [timeframe, setTimeframe] = useState('M1');

const Controls = ({ onTimeframeChange, currentTimeframe, onRandomNavigation, onAddCandle }) => (
  <div className="controls">
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
          onClick={() => setTimeframe(tf)}
          className={`controls-button ${
            timeframe === tf ? 'active' : ''
          }`}
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

export default Controls;











// import React from 'react';

// const TIMEFRAMES = [
//   { label: 'M1', value: 'M1' },
//   { label: 'M5', value: 'M5' },
//   { label: 'M15', value: 'M15' },
//   { label: 'M30', value: 'M30' },
//   { label: 'H1', value: 'H1' },
//   { label: 'H4', value: 'H4' },
//   { label: 'D1', value: 'D1' },
// ];

// const Controls = ({ onTimeframeChange, currentTimeframe }) => {
//   return (
//     <div className="controls-container">
//       {TIMEFRAMES.map(({ label, value }) => (
//         <button
//           key={value}
//           onClick={() => onTimeframeChange(value)}
//           className={`controls-button ${
//             currentTimeframe === value ? 'active' : ''
//           }`}
//         >
//           {label}
//         </button>
//       ))}
//     </div>
//   );
// };

// export default Controls;
