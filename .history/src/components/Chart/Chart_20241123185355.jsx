// // import React, { useEffect, useRef, useState } from 'react';
// // import { useChartInstance } from '../../hooks/useChartInstance';
// // import { useChartData } from '../../hooks/useChartData';
// // import TimeframeControls from '../Controls/TimeframeControls';

// // const Chart = ({ timeframe, onTimeframeChange }) => {
// //   const [barCount, setBarCount] = useState(250);
// //   const containerRef = useRef(null);
// //   const { chartRef, candleSeriesRef } = useChartInstance(containerRef);
// //   const {
// //     data,
// //     error,
// //     isLoading,
// //     reloadData,
// //     fullDataset,
// //     addNextCandle,
// //   } = useChartData(timeframe, barCount);

// //   useEffect(() => {
// //     if (data && candleSeriesRef.current) {
// //       candleSeriesRef.current.setData(data);
// //     }
// //   }, [data, candleSeriesRef]);

// //   const handleRandomDateNavigation = () => {
// //     if (fullDataset) {
// //       const randomIndex = Math.floor(Math.random() * fullDataset.length);
// //       reloadData({ startIndex: randomIndex });
// //     }
// //   };

// //   const handleTimeframeChange = (newTimeframe) => {
// //     onTimeframeChange(newTimeframe);
// //   };

// //   if (error) {
// //     return <div className="error-container">Error: {error}</div>;
// //   }

// //   return (
// //     <div className="chart-container">
// //       <TimeframeControls
// //         onTimeframeChange={handleTimeframeChange}
// //         currentTimeframe={timeframe}
// //         onBarCountChange={setBarCount}
// //         currentBarCount={barCount}
// //       />
// //       <div ref={containerRef} className="chart-wrapper" />
// //       {isLoading && <div className="loading-overlay">Loading...</div>}
// //     </div>
// //   );
// // };

// // export default Chart;

// import React, { useEffect, useRef, useState } from 'react';
// import { useChartInstance } from '../../hooks/useChartInstance';
// import { useChartData } from '../../hooks/useChartData';
// import TimeframeControls from '../Controls/TimeframeControls';

// const Chart = ({ timeframe, onTimeframeChange }) => {
//   const [barCount, setBarCount] = useState(250);
//   const containerRef = useRef(null);
//   const { chartRef, candleSeriesRef } = useChartInstance(containerRef);
//   const {
//     data,
//     error,
//     isLoading,
//     reloadData,
//     fullDataset,
//     addNextCandle,
//     goToRandomDate,
//     currentIndex,
//   } = useChartData(timeframe, barCount);

//   useEffect(() => {
//     if (data && candleSeriesRef.current) {
//       candleSeriesRef.current.setData(data);
//     }
//   }, [data, candleSeriesRef]);

//   const handleRandomNavigation = () => {
//     goToRandomDate();
//   };

//   const handleTimeframeChange = (newTimeframe) => {
//     onTimeframeChange(newTimeframe);
//   };

//   const handleBarCountChange = (newBarCount) => {
//     setBarCount(newBarCount);
//   };

//   if (error) {
//     return <div className="error-container">Error: {error}</div>;
//   }

//   return (
//     <div className="chart-container">
//       <TimeframeControls
//         onTimeframeChange={handleTimeframeChange}
//         currentTimeframe={timeframe}
//         onBarCountChange={handleBarCountChange}
//         currentBarCount={barCount}
//         onRandomNavigation={handleRandomNavigation}
//         onAddCandle={addNextCandle}
//         fullDataset={fullDataset}
//       />
//       <div ref={containerRef} className="chart-wrapper" />
//       {isLoading && <div className="loading-overlay">Loading...</div>}
//     </div>
//   );
// };

// export default Chart;






import React, { useEffect, useRef, useState } from 'react';
import { useChartInstance } from '../../hooks/useChartInstance';
import { useChartData } from '../../hooks/useChartData';
// import Controls from '../Controls/Controls';
import TimeframeControls from '../Controls/TimeframeControls';


const Chart = ({ timeframe, onTimeframeChange }) => {
  const [barCount, setBarCount] = useState(250);
  const containerRef = useRef(null);
  const { chartRef, candleSeriesRef } = useChartInstance(containerRef);
  const {
    data,
    error,
    isLoading,
    reloadData,
    fullDataset,
    addNextCandle,
    goToRandomDate,
    currentTime
  } = useChartData(timeframe, barCount);

  useEffect(() => {
    if (data && candleSeriesRef.current) {
      candleSeriesRef.current.setData(data);
    }
  }, [data, candleSeriesRef]);

  const handleTimeframeChange = (newTimeframe, syncTime) => {
    onTimeframeChange(newTimeframe, syncTime);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center p-4 bg-red-100 text-red-700 rounded">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <TimeframeControls
        onTimeframeChange={handleTimeframeChange}
        currentTimeframe={timeframe}
        onBarCountChange={setBarCount}
        currentBarCount={barCount}
        onRandomNavigation={goToRandomDate}
        onAddCandle={addNextCandle}
        currentTime={currentTime}
      />
      <div className="relative">
        <div ref={containerRef} className="w-full h-[600px]" />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
            <div className="text-white">Loading...</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chart;