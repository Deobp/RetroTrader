import React, { useEffect, useRef } from 'react';
import { useChartInstance } from '../../hooks/useChartInstance';
import { useChartData } from '../../hooks/useChartData';
import Controls from '../Controls';
import { BAR_OPTIONS } from '../../constants/chartConfig';

const Chart = ({ timeframe }) => {
  const [localTf, setTimeframe] = useState('M1');

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
        onTimeframeChange={setTimeframe}  // Pass the setter function
        currentTimeframe={timeframe}       // Pass the current timeframe
        onRandomNavigation={onRandomNavigation}
        onAddCandle={onAddCandle}
      />
      <div ref={containerRef} className="chart-wrapper" />
      {isLoading && <div className="loading-overlay">Loading...</div>}
    </div>
  );
};

export default Chart;






// import React, { useEffect, useRef, useState, useCallback } from 'react';
// import { createChart } from 'lightweight-charts';

// const CHART_CONFIG = {
//   backgroundColor: '#1e1e1e',
//   textColor: '#d1d4dc',
//   gridColor: '#2a2a2a33',
//   upColor: '#26a69a',
//   downColor: '#ef5350',
// };

// const BAR_OPTIONS = [50, 100, 250, 500, 1000];



// const useChartInstance = (containerRef) => {
//   const chartRef = useRef(null);
//   const candleSeriesRef = useRef(null);

//   useEffect(() => {
//     if (!containerRef.current) return;

//     if (chartRef.current) {
//       chartRef.current.remove();
//       chartRef.current = null;
//       candleSeriesRef.current = null;
//     }

//     chartRef.current = createChart(containerRef.current, {
//       width: containerRef.current.clientWidth,
//       height: 400,
//       layout: {
//         backgroundColor: CHART_CONFIG.backgroundColor,
//         textColor: CHART_CONFIG.textColor,
//       },
//       grid: {
//         vertLines: { color: CHART_CONFIG.gridColor },
//         horzLines: { color: CHART_CONFIG.gridColor },
//       },
//       timeScale: { timeVisible: true },
//       localization: { locale: 'en-US' },
//     });

//     candleSeriesRef.current = chartRef.current.addCandlestickSeries({
//       upColor: CHART_CONFIG.upColor,
//       downColor: CHART_CONFIG.downColor,
//       priceFormat: {
//         type: 'price',
//         precision: 5,
//         minMove: 0.00001,
//       },
//     });

//     return () => {
//       if (chartRef.current) {
//         chartRef.current.remove();
//         chartRef.current = null;
//         candleSeriesRef.current = null;
//       }
//     };
//   }, []);

//   return { chartRef, candleSeriesRef };
// };

// const useChartData = (timeframe, barCount, startIndex = null, previousTime = null) => {
//   const [data, setData] = useState(null);
//   const [error, setError] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [fullDataset, setFullDataset] = useState(null);
//   const abortControllerRef = useRef(null);

//   const loadData = useCallback(async () => {
//     if (abortControllerRef.current) {
//       abortControllerRef.current.abort();
//     }
//     abortControllerRef.current = new AbortController();

//     setIsLoading(true);
//     setError(null);

//     try {
//       const response = await fetch(
//         `../../../data/eurusd/EURUSD_${timeframe}.json`,
//         { signal: abortControllerRef.current.signal }
//       );
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
//       }

//       const rawData = await response.json();

//       if (!rawData.time || !rawData.open || !rawData.high || !rawData.low || !rawData.close) {
//         throw new Error('Invalid data format received');
//       }

//       const epochStart = new Date('2000-01-01T00:00:00Z').getTime() / 1000;
//       const formattedData = rawData.time.map((time, i) => ({
//         time: time * 60 + epochStart,
//         open: rawData.open[i],
//         high: rawData.high[i],
//         low: rawData.low[i],
//         close: rawData.close[i],
//       }));

//       setFullDataset(formattedData);

//       let startPoint = 0;

//       if (previousTime) {
//         // Find the closest time index in the new dataset
//         const closestIndex = formattedData.findIndex(item => item.time >= previousTime);
//         startPoint = Math.max(0, closestIndex - Math.floor(barCount / 2));
//       } else if (startIndex !== null) {
//         startPoint = startIndex;
//       } else {
//         startPoint = Math.max(0, formattedData.length - barCount);
//       }

//       const slicedData = formattedData.slice(startPoint, startPoint + barCount);
//       setData(slicedData);
//     } catch (err) {
//       if (err.name === 'AbortError') {
//         return;
//       }
//       setError(err.message);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [timeframe, barCount, startIndex, previousTime]);

//   const addNextCandle = useCallback(() => {
//     if (!fullDataset || !data) return;

//     const lastIndex = fullDataset.findIndex(
//       item => item.time === data[data.length - 1].time
//     );

//     if (lastIndex < fullDataset.length - 1) {
//       const nextCandle = fullDataset[lastIndex + 1];
//       setData(prevData => [...prevData, nextCandle]);
//     }
//   }, [fullDataset, data]);

//   useEffect(() => {
//     setData(null);
//     loadData();

//     return () => {
//       if (abortControllerRef.current) {
//         abortControllerRef.current.abort();
//       }
//     };
//   }, [loadData]);

//   return { 
//     data, 
//     error, 
//     isLoading, 
//     reloadData: loadData,
//     fullDataset,
//     addNextCandle
//   };
// };

// const TradingChart = ({ timeframe }) => {
//   const containerRef = useRef(null);
//   const [barCount, setBarCount] = useState(250);
//   const [startIndex, setStartIndex] = useState(null);
//   const [lastViewedIndex, setLastViewedIndex] = useState(null);
//   const [previousTime, setPreviousTime] = useState(null);

//   const { 
//     data, 
//     error, 
//     isLoading,
//     fullDataset,
//     addNextCandle
//   } = useChartData(timeframe, barCount, startIndex ?? lastViewedIndex, previousTime);

//   const { chartRef, candleSeriesRef } = useChartInstance(containerRef);

//   useEffect(() => {
//     if (data && candleSeriesRef.current) {
//       candleSeriesRef.current.setData(data);
//     }
//   }, [data]);

//   const handleRandomDateNavigation = () => {
//     if (fullDataset) {
//       const randomIndex = Math.floor(
//         Math.random() * (fullDataset.length - barCount)
//       );
//       setLastViewedIndex(randomIndex);
//       setStartIndex(randomIndex);
//     }
//   };

//   const handleTimeframeChange = (newTimeframe) => {
//     if (data) {
//       // Save the last viewed time before switching
//       setPreviousTime(data[data.length - 1].time);
//     }
//     setStartIndex(null); // Reset the start index
//     setBarCount(250); // Reset the bar count if needed
//   };

  
//   // Handle window resize
//   useEffect(() => {
//     const handleResize = () => {
//       if (chartRef.current && containerRef.current) {
//         chartRef.current.applyOptions({
//           width: containerRef.current.clientWidth,
//         });
//       }
//     };

//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   if (error) {
//     return (
//       <div className="flex items-center justify-center h-[400px] bg-gray-900 rounded-lg border border-red-500">
//         <div className="text-red-500">
//           Error loading chart data: {error}
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="flex flex-col gap-4 chart">
//       <div className="flex justify-between items-center">
//         <div className="flex gap-2">
//           {BAR_OPTIONS.map((bars) => (
//             <button
//               key={bars}
//               onClick={() => setBarCount(bars)}
//               className={`px-2 py-1 rounded ${
//                 barCount === bars 
//                   ? 'bg-green-600 text-white' 
//                   : 'bg-gray-700 text-gray-300'
//               }`}
//             >
//               {bars} Bars
//             </button>
//           ))}
//         </div>
//       </div>
      
//       <div className="flex gap-2 mb-2">
//         <button 
//           onClick={handleRandomDateNavigation}
//           className="px-4 py-2 bg-purple-600 text-white rounded"
//         >
//           Random History Point
//         </button>
//         <button 
//           onClick={addNextCandle}
//           className="px-4 py-2 bg-yellow-600 text-white rounded"
//         >
//           Next Candle
//         </button>
//       </div>
      
//       <div 
//         ref={containerRef} 
//         className="border border-gray-700 rounded-lg"
//       />
      
//       {isLoading && !data && (
//         <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
//           <div className="text-blue-500">Loading chart data...</div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default TradingChart;
