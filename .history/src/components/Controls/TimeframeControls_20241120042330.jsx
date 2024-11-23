import React, { useEffect, useRef } from 'react';
import { useChartInstance } from '../hooks/useChartInstance';
import { useChartData } from '../hooks/useChartData';
import Controls from './Controls';
import { BAR_OPTIONS } from '../constants/chartConfig';

const Chart = ({ timeframe }) => {
  const containerRef = useRef(null);
  const { chartRef, candleSeriesRef } = useChartInstance(containerRef);
  const {
    data,
    error,
    isLoading,
    reloadData,
    fullDataset,
    addNextCandle,
  } = useChartData(timeframe, 250);

  useEffect(() => {
    if (data && candleSeriesRef.current) {
      candleSeriesRef.current.setData(data);
    }
  }, [data, candleSeriesRef]);

  const handleRandomDateNavigation = () => {
    if (fullDataset) {
      const randomIndex = Math.floor(Math.random() * fullDataset.length);
      reloadData({ startIndex: randomIndex });
    }
  };

  if (error) {
    return <div className="error-container">Error: {error}</div>;
  }

  return (
    <div className="chart-container">
      <Controls
        currentBars={250}
        onRandomNavigation={handleRandomDateNavigation}
        onAddCandle={addNextCandle}
      />
      <div ref={containerRef} className="chart-wrapper" />
      {isLoading && <div className="loading-overlay">Loading...</div>}
    </div>
  );
};

export default Chart;











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
