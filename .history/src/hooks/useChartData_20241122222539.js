import { useState, useEffect, useCallback, useRef } from 'react';

export const useChartData = (timeframe, barCount) => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const fullDataset = useRef(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`../../../data/eurusd/EURUSD_${timeframe}.json`);
      if (!response.ok) throw new Error('Failed to fetch data');
      const rawData = await response.json();

      // format  data into lightweight-charts compatible format
      const formattedData = rawData.time.map((time, index) => ({
        time,
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
    if (fullDataset.current.length > data.length) {
      setData((prevData) => [...prevData, fullDataset.current[prevData.length]]);
    }
  };

  return { data, error, isLoading, reloadData: fetchData, addNextCandle, fullDataset };
};


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