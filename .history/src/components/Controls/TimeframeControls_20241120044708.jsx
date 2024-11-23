import React from 'react';
import { BAR_OPTIONS, TIMEFRAMES } from '../../constants/chartConfig';

const Controls = ({ onTimeframeChange, currentTimeframe, onRandomNavigation, onAddCandle }) => (
  <div className="controls">
    <div className="bar-options">
      {BAR_OPTIONS.map((bars) => (
        <button key={bars} className="bar-button">
          {bars} Bars
        </button>
      ))}
    </div>
    <div className="controls-container">
      {TIMEFRAMES.map(({ tf }) => (
        <button
          key={tf}
          onClick={() => onTimeframeChange(tf)}
          className={`controls-button ${
            currentTimeframe === tf ? 'active' : ''
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
