import { useState, useEffect, useCallback, useRef } from "react";

export const useChartData = (timeframe, barCount) => {
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const fullDataset = useRef(null);

  const fetchData = useCallback(async (options = {}) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`../../../data/eurusd/EURUSD_${timeframe}.json`);
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const rawData = await response.json();

      // Format data into lightweight-charts compatible format
      const formattedData = rawData.time.map((time, index) => ({
        time: time * 60 + new Date('2000-01-01').getTime() / 1000,
        open: rawData.open[index],
        high: rawData.high[index],
        low: rawData.low[index],
        close: rawData.close[index],
      }));

      fullDataset.current = formattedData;

      // If a specific start index is provided (for random navigation)
      if (options.startIndex !== undefined) {
        setCurrentIndex(options.startIndex);
        const endIndex = Math.min(options.startIndex + barCount, formattedData.length);
        setData(formattedData.slice(options.startIndex, endIndex));
      } else {
        // Default behavior: show last barCount bars
        setCurrentIndex(Math.max(0, formattedData.length - barCount));
        setData(formattedData.slice(-barCount));
      }
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
    if (fullDataset.current && currentIndex + data.length < fullDataset.current.length) {
      setData(prevData => [...prevData, fullDataset.current[currentIndex + prevData.length]]);
    }
  };

  const goToRandomDate = () => {
    if (fullDataset.current) {
      // Calculate a random index that ensures we have enough data ahead
      const maxStartIndex = fullDataset.current.length - barCount;
      const randomIndex = Math.floor(Math.random() * maxStartIndex);
      fetchData({ startIndex: randomIndex });
    }
  };

  return {
    data,
    error,
    isLoading,
    reloadData: fetchData,
    addNextCandle,
    goToRandomDate,
    fullDataset: fullDataset.current,
    currentIndex,
  };
};

import { useState, useEffect, useCallback, useRef } from "react";

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
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const rawData = await response.json();

      // adjust time field to seconds since UNIX epoch
      const formattedData = rawData.time.map((time, index) => ({
        // convert minutes to seconds
        time: time * 60 + new Date('2000-01-01').getTime() / 1000,
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
