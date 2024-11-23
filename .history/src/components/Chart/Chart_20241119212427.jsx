import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createChart } from 'lightweight-charts';

const CHART_CONFIG = {
  backgroundColor: '#1e1e1e',
  textColor: '#d1d4dc',
  gridColor: '#2a2a2a',
  upColor: '#26a69a',
  downColor: '#ef5350',
};

const TIMEFRAME_MAP = {
  '1m': 'M1',
  '5m': 'M5',
  '15m': 'M15',
  '30m': 'M30',
  '1h': 'H1',
  '4h': 'H4',
  '1d': 'D1',
};

const BAR_OPTIONS = [50, 100, 250, 500, 1000];

// Modified custom hook for chart data loading with better error handling and logging
const useChartData = (timeframe, barCount, startIndex = null) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [fullDataset, setFullDataset] = useState(null);
  const abortControllerRef = useRef(null);

  const loadData = useCallback(async () => {
    // Cancel any ongoing requests
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `../../../data/eurusd/EURUSD_${TIMEFRAME_MAP[timeframe]}.json`,
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

      // Determine the slice of data to show
      let startPoint = startIndex !== null 
      ? startIndex 
      : Math.max(0, formattedData.length - barCount);

      const slicedData = formattedData.slice(startPoint, startPoint + barCount);

      setData(slicedData);

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
    }
  }, [fullDataset, data]);

  // Clear data when timeframe changes
  useEffect(() => {
    setData(null);
    loadData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadData]);

  return { data, error, isLoading, reloadData: loadData };
};

// Modified custom hook for chart instance with better cleanup
const useChartInstance = (containerRef, timeframe) => {
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clean up existing chart if it exists
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
        secondsVisible: ['1min', '5min'].includes(timeframe),
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
  const [currentPrice, setCurrentPrice] = useState(null);
  const { data, error, isLoading } = useChartData(timeframe);
  const { chartRef, candleSeriesRef } = useChartInstance(containerRef, timeframe);

  // Update data when it changes
  useEffect(() => {
    if (data && candleSeriesRef.current) {
      candleSeriesRef.current.setData(data);
      
      if (data.length > 0) {
        setCurrentPrice(data[data.length - 1].close);
      }
    }
  }, [data]);

  // Handle window resize
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