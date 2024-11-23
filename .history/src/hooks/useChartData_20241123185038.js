import { useState, useEffect, useCallback, useRef } from "react";

// Helper function to find the closest index in the target dataset
const findSynchronizedIndex = (sourceTime, targetData) => {
  return targetData.findIndex(candle => candle.time >= sourceTime);
};

export const useChartData = (timeframe, barCount) => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const fullDataset = useRef(null);
  const lastSyncTime = useRef(null);

  const fetchData = useCallback(async (options = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`../../../data/eurusd/EURUSD_${timeframe}.json`);
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const rawData = await response.json();

      const formattedData = rawData.time.map((time, index) => ({
        time: time * 60 + new Date('2000-01-01').getTime() / 1000,
        open: rawData.open[index],
        high: rawData.high[index],
        low: rawData.low[index],
        close: rawData.close[index],
      }));

      fullDataset.current = formattedData;

      let startIndex;
      if (options.startIndex !== undefined) {
        // Use provided start index for random navigation
        startIndex = options.startIndex;
      } else if (lastSyncTime.current && options.sync !== false) {
        // Find synchronized position based on last sync time
        startIndex = findSynchronizedIndex(lastSyncTime.current, formattedData);
        if (startIndex === -1) startIndex = Math.max(0, formattedData.length - barCount);
      } else {
        // Default to latest data
        startIndex = Math.max(0, formattedData.length - barCount);
      }

      // Store the time of the first visible candle for future sync
      if (formattedData[startIndex]) {
        lastSyncTime.current = formattedData[startIndex].time;
      }

      setCurrentIndex(startIndex);
      const endIndex = Math.min(startIndex + barCount, formattedData.length);
      setData(formattedData.slice(startIndex, endIndex));

    } catch (err) {
      setError(err.message);
      console.error("Error fetching data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [timeframe, barCount]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addNextCandle = useCallback(() => {
    if (fullDataset.current && currentIndex + data.length < fullDataset.current.length) {
      setData(prevData => {
        const nextCandle = fullDataset.current[currentIndex + prevData.length];
        const newData = [...prevData, nextCandle];
        // Remove first candle if we exceed barCount
        if (newData.length > barCount) {
          newData.shift();
          setCurrentIndex(prev => prev + 1);
        }
        return newData;
      });
    }
  }, [currentIndex, data.length, barCount]);

  const goToRandomDate = useCallback(() => {
    if (fullDataset.current) {
      const maxStartIndex = fullDataset.current.length - barCount;
      const randomIndex = Math.floor(Math.random() * maxStartIndex);
      if (fullDataset.current[randomIndex]) {
        lastSyncTime.current = fullDataset.current[randomIndex].time;
      }
      fetchData({ startIndex: randomIndex });
    }
  }, [barCount, fetchData]);

  // Method to manually set sync time (useful for external sync)
  const setSyncTime = useCallback((time) => {
    lastSyncTime.current = time;
    fetchData();
  }, [fetchData]);

  return {
    data,
    error,
    isLoading,
    reloadData: fetchData,
    addNextCandle,
    goToRandomDate,
    setSyncTime,
    fullDataset: fullDataset.current,
    currentIndex,
    currentTime: data[0]?.time,
  };
};









// import { useState, useEffect, useCallback, useRef } from "react";
// import { getSynchronizedDataIndex } from "../utils/chartUtils";

// export const useChartData = (timeframe, barCount) => {
//   const [data, setData] = useState([]);
//   const [error, setError] = useState(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const fullDataset = useRef(null);

//   const fetchData = useCallback(async (options = {}) => {
//     setIsLoading(true);
//     setError(null);

//     try {
//       const response = await fetch(`../../../data/eurusd/EURUSD_${timeframe}.json`);
//       if (!response.ok) {
//         throw new Error("Failed to fetch data");
//       }

//       const rawData = await response.json();

//       // Format data into lightweight-charts compatible format
//       const formattedData = rawData.time.map((time, index) => ({
//         time: time * 60 + new Date('2000-01-01').getTime() / 1000,
//         open: rawData.open[index],
//         high: rawData.high[index],
//         low: rawData.low[index],
//         close: rawData.close[index],
//       }));

//       fullDataset.current = formattedData;

//       // If a specific start index is provided (for random navigation)
//       if (options.startIndex !== undefined) {
//         const syncedIndex = getSynchronizedDataIndex(options.syncTime, formattedData);

//         setCurrentIndex(options.startIndex);
//         const endIndex = Math.min(options.startIndex + barCount, formattedData.length);
//         setData(formattedData.slice(options.startIndex, endIndex));
//       } else {
//         // Default behavior: show last barCount bars
//         setCurrentIndex(Math.max(0, formattedData.length - barCount));
//         setData(formattedData.slice(-barCount));
//       }
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
//     if (fullDataset.current && currentIndex + data.length < fullDataset.current.length) {
//       setData(prevData => [...prevData, fullDataset.current[currentIndex + prevData.length]]);
//     }
//   };

//   const goToRandomDate = () => {
//     if (fullDataset.current) {
//       // Calculate a random index that ensures we have enough data ahead
//       const maxStartIndex = fullDataset.current.length - barCount;
//       const randomIndex = Math.floor(Math.random() * maxStartIndex);
//       fetchData({ startIndex: randomIndex });
//     }
//   };

//   return {
//     data,
//     error,
//     isLoading,
//     reloadData: fetchData,
//     addNextCandle,
//     goToRandomDate,
//     fullDataset: fullDataset.current,
//     currentIndex,
//   };
// };



//-------------------------
// import { useState, useEffect, useCallback, useRef } from "react";

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
//         throw new Error("Failed to fetch data");
//       }

//       const rawData = await response.json();

//       // adjust time field to seconds since UNIX epoch
//       const formattedData = rawData.time.map((time, index) => ({
//         // convert minutes to seconds
//         time: time * 60 + new Date('2000-01-01').getTime() / 1000,
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
