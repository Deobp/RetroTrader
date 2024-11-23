// import { useState, useEffect, useCallback, useRef } from 'react';

// export const useChartData = (timeframe, barCount) => {
//   const [data, setData] = useState([]);
//   const [error, setError] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const fullDataset = useRef(null);

//   const fetchData = useCallback(async () => {
//     setIsLoading(true);
//     setError(null);
//     try {
//       const response = await fetch(`../../../data/eurusd/EURUSD_${timeframe}.json`);
//       if (!response.ok) throw new Error('Failed to fetch data');
//       const rawData = await response.json();

//       // format  data into lightweight-charts compatible format
//       const formattedData = rawData.time.map((time, index) => ({
//         time,
//         open: rawData.open[index],
//         high: rawData.high[index],
//         low: rawData.low[index],
//         close: rawData.close[index],
//       }));

//       fullDataset.current = formattedData;
//       setData(formattedData.slice(-barCount));
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [timeframe, barCount]);

//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   const addNextCandle = () => {
//     if (fullDataset.current.length > data.length) {
//       setData((prevData) => [...prevData, fullDataset.current[prevData.length]]);
//     }
//   };

//   return { data, error, isLoading, reloadData: fetchData, addNextCandle, fullDataset };
// };


// import { useState, useEffect, useCallback, useRef } from 'react';

// export const useChartData = (timeframe, barCount) => {
//   const [data, setData] = useState([]);
//   const [error, setError] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const fullDataset = useRef(null);

//   const fetchData = useCallback(async () => {
//     setIsLoading(true);
//     setError(null);

//     try {
//       const response = await fetch(`../../../data/eurusd/EURUSD_${timeframe}.json`);
//       if (!response.ok) {
//         throw new Error('Failed to fetch data');
//       }

//       const rawData = await response.json();

//       // Format data into lightweight-charts compatible format
//       const formattedData = rawData.time.map((time, index) => ({
//         time,
//         open: rawData.open[index],
//         high: rawData.high[index],
//         low: rawData.low[index],
//         close: rawData.close[index],
//       }));

//       fullDataset.current = formattedData;
//       setData(formattedData.slice(-barCount));
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setIsLoading(false);
//     }
//   }, [timeframe, barCount]);

//   useEffect(() => {
//     fetchData();
//   }, [fetchData]);

//   const addNextCandle = () => {
//     if (fullDataset.current && fullDataset.current.length > data.length) {
//       setData((prevData) => [...prevData, fullDataset.current[prevData.length]]);
//     }
//   };

//   return {
//     data,
//     error,
//     isLoading,
//     reloadData: fetchData,
//     addNextCandle,
//     fullDataset: fullDataset.current,
//   };
// };

import { useState, useEffect, useCallback, useRef } from 'react';

export const useChartData = (timeframe, barCount) => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const fullDataset = useRef(null);

  const normalizeTimestamp = (timestamp) => {
    // Adjust the base timestamp to match November 2024
    const targetOffset = Math.floor(Date.UTC(2024, 10, 1) / 1000); // November 1, 2024
    const correctedTimestamp = timestamp + (targetOffset - 4655520); // 4655520 is the first timestamp in your data
    return correctedTimestamp;
  };

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`../../../data/eurusd/EURUSD_${timeframe}.json`);
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      const rawData = await response.json();

      // Format data into lightweight-charts compatible format with corrected timestamps
      const formattedData = rawData.time.map((time, index) => ({
        time: normalizeTimestamp(time),
        open: rawData.open[index],
        high: rawData.high[index],
        low: rawData.low[index],
        close: rawData.close[index],
      }));

      fullDataset.current = formattedData;
      setData(formattedData.slice(-barCount));
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [timeframe, barCount]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addNextCandle = () => {
    if (fullDataset.current && fullDataset.current.length > data.length) {
      setData((prevData) => [...prevData, fullDataset.current[prevData.length]]);
    }
  };

  return {
    data,
    error,
    isLoading,
    reloadData: fetchData,
    addNextCandle,
    fullDataset: fullDataset.current,
  };
};