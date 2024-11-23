import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createChart } from 'lightweight-charts';

const CHART_CONFIG = {
  backgroundColor: '#1e1e1e',
  textColor: '#d1d4dc',
  gridColor: '#2a2a2a33',
  upColor: '#26a69a',
  downColor: '#ef5350',
};

const BAR_OPTIONS = [50, 100, 250, 500, 1000];

const useChartData = (timeframe, barCount, storedTime) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fullDataset, setFullDataset] = useState(null);
  const abortControllerRef = useRef(null);

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

      let startPoint = Math.max(0, formattedData.length - barCount);

      // Find the closest bar based on the stored time if switching timeframe
      if (storedTime) {
        const closestIndex = formattedData.findIndex((bar) => bar.time >= storedTime);
        startPoint = closestIndex >= 0 ? Math.max(0, closestIndex - Math.floor(barCount / 2)) : startPoint;
      }

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
  }, [timeframe, barCount, storedTime]);

  const addNextCandle = useCallback(() => {
    if (!fullDataset || !data) return;

    const lastIndex = fullDataset.findIndex(
      (item) => item.time === data[data.length - 1].time
    );

    if (lastIndex < fullDataset.length - 1) {
      const nextCandle = fullDataset[lastIndex + 1];
      setData((prevData) => [...prevData, nextCandle]);
    }
  }, [fullDataset, data]);

  useEffect(() => {
    setData(null);
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
    addNextCandle 
  };
};

const useChartInstance = (containerRef) => {
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
      timeScale: { timeVisible: true },
      localization: { locale: 'en-US' },
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
  }, []);

  return { chartRef, candleSeriesRef };
};

const TradingChart = ({ initialTimeframe }) => {
  const containerRef = useRef(null);
  const [timeframe, setTimeframe] = useState(initialTimeframe);
  const [barCount, setBarCount] = useState(250);
  const [storedTime, setStoredTime] = useState(null);

  const { 
    data, 
    error, 
    isLoading, 
    fullDataset, 
    addNextCandle 
  } = useChartData(timeframe, barCount, storedTime);

  const { chartRef, candleSeriesRef } = useChartInstance(containerRef);

  useEffect(() => {
    if (data && candleSeriesRef.current) {
      candleSeriesRef.current.setData(data);
    }
  }, [data]);

  const handleSwitchTimeframe = (newTimeframe) => {
    if (data) {
      setStoredTime(data[data.length - 1].time);
    }
    setTimeframe(newTimeframe);
  };

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
        <div className="text-red-500">Error loading chart data: {error}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 chart">
      <div className="flex gap-2">
        {['1M', '5M', '15M', '1H', '4H', '1D'].map((tf) => (
          <button
            key={tf}
            onClick={() => handleSwitchTimeframe(tf)}
            className={`px-2 py-1 rounded ${
              timeframe === tf ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'
            }`}
          >
            {tf}
          </button>
        ))}
      </div>
      
      <div ref={containerRef} className="border border-gray-700 rounded-lg" />
      
      {isLoading && !data && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
          <div className="text-blue-500">Loading chart data...</div>
        </div>
      )}
    </div>
  );
};

export default TradingChart;
