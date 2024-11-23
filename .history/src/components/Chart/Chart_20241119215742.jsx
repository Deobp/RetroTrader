import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createChart } from 'lightweight-charts';

const CHART_CONFIG = {
  backgroundColor: '#1e1e1e',
  textColor: '#d1d4dc',
  gridColor: '#2a2a2a',
  upColor: '#26a69a',
  downColor: '#ef5350',
};

const BAR_OPTIONS = [50, 100, 250, 500, 1000];

const useChartData = (timeframe, barCount, startIndex = null) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fullDataset, setFullDataset] = useState(null);
  const abortControllerRef = useRef(null);
  const lastViewedPositionRef = useRef(null);

  const loadData = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `../../../data/eurusd/EURUSD_${timeframe}.json`,
        { signal: abortControllerRef.current.signal }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }

      const rawData = await response.json();

      if (!rawData.time || !rawData.open || !rawData.high || !rawData.low || !rawData.close) {
        throw new Error('Invalid data format received');
      }

      const epochStart = new Date('2000-01-01T00:00:00Z').getTime() / 1000;
      const formattedData = rawData.time.map((time, i) => ({
        time: time * 60 + epochStart,
        open: rawData.open[i],
        high: rawData.high[i],
        low: rawData.low[i],
        close: rawData.close[i],
      }));

      setFullDataset(formattedData);

      // Use the last viewed position if available, otherwise use startIndex or default to end
      let startPoint = lastViewedPositionRef.current !== null 
        ? lastViewedPositionRef.current
        : startIndex !== null 
          ? startIndex 
          : Math.max(0, formattedData.length - barCount);
      
      // Ensure startPoint is valid for the new dataset
      startPoint = Math.min(startPoint, formattedData.length - barCount);
      startPoint = Math.max(0, startPoint);
      
      const slicedData = formattedData.slice(startPoint, startPoint + barCount);
      setData(slicedData);
      lastViewedPositionRef.current = startPoint;
    } catch (err) {
      if (err.name === 'AbortError') {
        return;
      }
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [timeframe, barCount, startIndex]);

  const addNextCandle = useCallback(() => {
    if (!fullDataset || !data) return;

    const lastIndex = fullDataset.findIndex(
      item => item.time === data[data.length - 1].time
    );

    if (lastIndex < fullDataset.length - 1) {
      const nextCandle = fullDataset[lastIndex + 1];
      setData(prevData => [...prevData, nextCandle]);
      lastViewedPositionRef.current = lastIndex - data.length + 2;
    }
  }, [fullDataset, data]);

  const setRandomHistoryPoint = useCallback(() => {
    if (!fullDataset) return;
    
    const randomIndex = Math.floor(
      Math.random() * (fullDataset.length - barCount)
    );
    lastViewedPositionRef.current = randomIndex;
    const slicedData = fullDataset.slice(randomIndex, randomIndex + barCount);
    setData(slicedData);
  }, [fullDataset, barCount]);

  useEffect(() => {
    loadData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadData]);

  return { 
    data, 
    error, 
    isLoading, 
    reloadData: loadData,
    fullDataset,
    addNextCandle,
    setRandomHistoryPoint
  };
};

const useChartInstance = (containerRef, timeframe) => {
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
    }

    chartRef.current = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 400,
      layout: {
        backgroundColor: CHART_CONFIG.backgroundColor,
        textColor: CHART_CONFIG.textColor,
      },
      grid: {
        vertLines: { color: CHART_CONFIG.gridColor },
        horzLines: { color: CHART_CONFIG.gridColor },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: ['M1', 'M5'].includes(timeframe),
        tickMarkFormatter: (time) => {
          const date = new Date(time * 1000);
          return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          });
        },
      },
      localization: {
        locale: 'en-US',
        dateFormat: 'MMM dd, yyyy',
      },
    });

    candleSeriesRef.current = chartRef.current.addCandlestickSeries({
      upColor: CHART_CONFIG.upColor,
      downColor: CHART_CONFIG.downColor,
      priceFormat: {
        type: 'price',
        precision: 5,
        minMove: 0.00001,
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
        candleSeriesRef.current = null;
      }
    };
  }, [timeframe]);

  return { chartRef, candleSeriesRef };
};

const TradingChart = ({ timeframe }) => {
  const containerRef = useRef(null);
  const [barCount, setBarCount] = useState(250);
  const [currentPrice, setCurrentPrice] = useState(null);

  const { 
    data, 
    error, 
    isLoading,
    addNextCandle,
    setRandomHistoryPoint
  } = useChartData(timeframe, barCount);
  
  const { 
    chartRef, 
    candleSeriesRef 
  } = useChartInstance(containerRef, timeframe);

  useEffect(() => {
    if (data && candleSeriesRef.current) {
      candleSeriesRef.current.setData(data);
      
      if (data.length > 0) {
        setCurrentPrice(data[data.length - 1].close);
      }
    }
  }, [data]);

  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current && containerRef.current) {
        chartRef.current.applyOptions({
          width: containerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-gray-900 rounded-lg border border-red-500">
        <div className="text-red-500">
          Error loading chart data: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 chart">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
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
        </div>
      </div>
      
      <div className="flex gap-2 mb-2">
        <button 
          onClick={setRandomHistoryPoint}
          className="px-4 py-2 bg-purple-600 text-white rounded"
        >
          Random History Point
        </button>
        <button 
          onClick={addNextCandle}
          className="px-4 py-2 bg-yellow-600 text-white rounded"
        >
          Add Next Candle
        </button>
      </div>
      
      <div 
        ref={containerRef} 
        className="border border-gray-700 rounded-lg"
      />
      
      {isLoading && !data && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="text-blue-500">Loading chart data...</div>
        </div>
      )}
      
      {currentPrice && (
        <div className="text-right text-sm">
          Current Price: {currentPrice.toFixed(5)}
        </div>
      )}
    </div>
  );
};

export default TradingChart;import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createChart } from 'lightweight-charts';

const CHART_CONFIG = {
  backgroundColor: '#1e1e1e',
  textColor: '#d1d4dc',
  gridColor: '#2a2a2a',
  upColor: '#26a69a',
  downColor: '#ef5350',
};

const BAR_OPTIONS = [50, 100, 250, 500, 1000];

const useChartData = (timeframe, barCount, startIndex = null) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fullDataset, setFullDataset] = useState(null);
  const abortControllerRef = useRef(null);
  const lastViewedPositionRef = useRef(null);

  const loadData = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `../../../data/eurusd/EURUSD_${timeframe}.json`,
        { signal: abortControllerRef.current.signal }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }

      const rawData = await response.json();

      if (!rawData.time || !rawData.open || !rawData.high || !rawData.low || !rawData.close) {
        throw new Error('Invalid data format received');
      }

      const epochStart = new Date('2000-01-01T00:00:00Z').getTime() / 1000;
      const formattedData = rawData.time.map((time, i) => ({
        time: time * 60 + epochStart,
        open: rawData.open[i],
        high: rawData.high[i],
        low: rawData.low[i],
        close: rawData.close[i],
      }));

      setFullDataset(formattedData);

      // Use the last viewed position if available, otherwise use startIndex or default to end
      let startPoint = lastViewedPositionRef.current !== null 
        ? lastViewedPositionRef.current
        : startIndex !== null 
          ? startIndex 
          : Math.max(0, formattedData.length - barCount);
      
      // Ensure startPoint is valid for the new dataset
      startPoint = Math.min(startPoint, formattedData.length - barCount);
      startPoint = Math.max(0, startPoint);
      
      const slicedData = formattedData.slice(startPoint, startPoint + barCount);
      setData(slicedData);
      lastViewedPositionRef.current = startPoint;
    } catch (err) {
      if (err.name === 'AbortError') {
        return;
      }
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [timeframe, barCount, startIndex]);

  const addNextCandle = useCallback(() => {
    if (!fullDataset || !data) return;

    const lastIndex = fullDataset.findIndex(
      item => item.time === data[data.length - 1].time
    );

    if (lastIndex < fullDataset.length - 1) {
      const nextCandle = fullDataset[lastIndex + 1];
      setData(prevData => [...prevData, nextCandle]);
      lastViewedPositionRef.current = lastIndex - data.length + 2;
    }
  }, [fullDataset, data]);

  const setRandomHistoryPoint = useCallback(() => {
    if (!fullDataset) return;
    
    const randomIndex = Math.floor(
      Math.random() * (fullDataset.length - barCount)
    );
    lastViewedPositionRef.current = randomIndex;
    const slicedData = fullDataset.slice(randomIndex, randomIndex + barCount);
    setData(slicedData);
  }, [fullDataset, barCount]);

  useEffect(() => {
    loadData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadData]);

  return { 
    data, 
    error, 
    isLoading, 
    reloadData: loadData,
    fullDataset,
    addNextCandle,
    setRandomHistoryPoint
  };
};

const useChartInstance = (containerRef, timeframe) => {
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    if (chartRef.current) {
      chartRef.current.remove();
      chartRef.current = null;
      candleSeriesRef.current = null;
    }

    chartRef.current = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 400,
      layout: {
        backgroundColor: CHART_CONFIG.backgroundColor,
        textColor: CHART_CONFIG.textColor,
      },
      grid: {
        vertLines: { color: CHART_CONFIG.gridColor },
        horzLines: { color: CHART_CONFIG.gridColor },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: ['M1', 'M5'].includes(timeframe),
        tickMarkFormatter: (time) => {
          const date = new Date(time * 1000);
          return date.toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false,
          });
        },
      },
      localization: {
        locale: 'en-US',
        dateFormat: 'MMM dd, yyyy',
      },
    });

    candleSeriesRef.current = chartRef.current.addCandlestickSeries({
      upColor: CHART_CONFIG.upColor,
      downColor: CHART_CONFIG.downColor,
      priceFormat: {
        type: 'price',
        precision: 5,
        minMove: 0.00001,
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
        candleSeriesRef.current = null;
      }
    };
  }, [timeframe]);

  return { chartRef, candleSeriesRef };
};

const TradingChart = ({ timeframe }) => {
  const containerRef = useRef(null);
  const [barCount, setBarCount] = useState(250);
  const [currentPrice, setCurrentPrice] = useState(null);

  const { 
    data, 
    error, 
    isLoading,
    addNextCandle,
    setRandomHistoryPoint
  } = useChartData(timeframe, barCount);
  
  const { 
    chartRef, 
    candleSeriesRef 
  } = useChartInstance(containerRef, timeframe);

  useEffect(() => {
    if (data && candleSeriesRef.current) {
      candleSeriesRef.current.setData(data);
      
      if (data.length > 0) {
        setCurrentPrice(data[data.length - 1].close);
      }
    }
  }, [data]);

  useEffect(() => {
    const handleResize = () => {
      if (chartRef.current && containerRef.current) {
        chartRef.current.applyOptions({
          width: containerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-gray-900 rounded-lg border border-red-500">
        <div className="text-red-500">
          Error loading chart data: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 chart">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
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
        </div>
      </div>
      
      <div className="flex gap-2 mb-2">
        <button 
          onClick={setRandomHistoryPoint}
          className="px-4 py-2 bg-purple-600 text-white rounded"
        >
          Random History Point
        </button>
        <button 
          onClick={addNextCandle}
          className="px-4 py-2 bg-yellow-600 text-white rounded"
        >
          Add Next Candle
        </button>
      </div>
      
      <div 
        ref={containerRef} 
        className="border border-gray-700 rounded-lg"
      />
      
      {isLoading && !data && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="text-blue-500">Loading chart data...</div>
        </div>
      )}
      
      {currentPrice && (
        <div className="text-right text-sm">
          Current Price: {currentPrice.toFixed(5)}
        </div>
      )}
    </div>
  );
};

export default TradingChart;