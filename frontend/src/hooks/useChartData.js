// import { useState, useEffect, useCallback, useRef } from "react";

// export const useChartData = (timeframe, barCount) => {
//   const [data, setData] = useState([]);
//   const [error, setError] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const fullDataset = useRef(null);

//   const fetchLast250Candles = useCallback(async () => {
//     setIsLoading(true);
//     setError(null);

//     try {
//       const response = await fetch(`/api/candles/eurusd/m1/last-250`).json;
//       console.log(response)
//       if (!response.ok) {
//         throw new Error("Failed to fetch last 250 candles");
//       }

//       const rawData = await response.json();

//       const formattedData = rawData.map((candle) => ({
//         time: Math.floor(new Date(candle.datetime).getTime() / 1000),
//         open: parseFloat(candle.open),
//         high: parseFloat(candle.high),
//         low: parseFloat(candle.low),
//         close: parseFloat(candle.close),
//       }));

//       fullDataset.current = formattedData;
//       setData(formattedData.slice(-barCount)); 
//       setCurrentIndex(0);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [barCount]);

//   const addNextCandle = async () => {
//     try {
//       const response = await fetch(`/api/candles/next`);
//       if (!response.ok) {
//         throw new Error("Failed to fetch the next candle");
//       }

//       const nextCandle = await response.json();
//       setData((prevData) => [...prevData, nextCandle]);
//     } catch (err) {
//       setError(err.message);
//     }
//   };

//   const goToRandomDate = async () => {
//     try {
//       const response = await fetch(`/api/candles/random-historical`);
//       if (!response.ok) {
//         throw new Error("Failed to fetch random historical candles");
//       }

//       const randomData = await response.json();

//       const formattedData = randomData.map((candle) => ({
//         time: Math.floor(new Date(candle.datetime).getTime() / 1000),
//         open: parseFloat(candle.open),
//         high: parseFloat(candle.high),
//         low: parseFloat(candle.low),
//         close: parseFloat(candle.close),
//       }));

//       setData(formattedData);
//     } catch (err) {
//       setError(err.message);
//     }
//   };

//   useEffect(() => {
//     fetchLast250Candles();
//   }, [fetchLast250Candles]);

//   return {
//     data,
//     error,
//     isLoading,
//     addNextCandle,
//     goToRandomDate,
//     fullDataset: fullDataset.current,
//     currentIndex,
//   };
// };
