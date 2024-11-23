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

const useChartData = (timeframe) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const abortControllerRef = useRef(null);

  const loadData = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    setError(null);

    // Use absolute path from public folder
    const dataUrl = `/data/eurusd/EURUSD_${TIMEFRAME_MAP[timeframe]}.json`;
    console.log('Fetching data from:', dataUrl);

    try {
      const response = await fetch(dataUrl, {
        signal: abortControllerRef.current.signal,
        headers: {
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch data (${response.status})`);
      }

      const rawData = await response.json();

      if (!rawData || !Array.isArray(rawData)) {
        throw new Error('Invalid data format received');
      }

      // Assuming the data is already in the correct format
      setData(rawData);
    } catch (err) {
      if (err.name === 'AbortError') {
        console.log('Fetch aborted due to timeframe change');
        return;
      }
      setError(err.message);
      console.error('Error loading chart data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [timeframe]);

  useEffect(() => {
    loadData();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [loadData]);

  return { data, error, isLoading, reloadData: loadData };
};

const useChartInstance = (containerRef, timeframe) => {
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Cleanup existing chart
    if (chartRef.current) {
      chartRef.current.remove();
    }

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { color: CHART_CONFIG.backgroundColor },
        textColor: CHART_CONFIG.textColor,
      },
      grid: {
        vertLines: { color: CHART_CONFIG.gridColor },
        horzLines: { color: CHART_CONFIG.gridColor },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: timeframe === '1m' || timeframe === '5m',
      },
      crosshair: {
        mode: 0,
      },
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: CHART_CONFIG.upColor,
      downColor: CHART_CONFIG.downColor,
      borderVisible: false,
      wickUpColor: CHART_CONFIG.upColor,
      wickDownColor: CHART_CONFIG.downColor,
    });

    chartRef.current = chart;
    candleSeriesRef.current = candleSeries;

    return () => {
      chart.remove();
    };
  }, [timeframe]);

  return { chartRef, candleSeriesRef };
};

const TimeframeButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1 rounded ${
      active 
        ? 'bg-blue-500 text-white' 
        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
    }`}
  >
    {children}
  </button>
);

const TradingChart = () => {
  const containerRef = useRef(null);
  const [timeframe, setTimeframe] = useState('15m');
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

  // Define available timeframes
  const timeframes = [
    { label: '1m', value: '1m' },
    { label: '5m', value: '5m' },
    { label: '15m', value: '15m' },
    { label: '30m', value: '30m' },
    { label: '1h', value: '1h' },
    { label: '4h', value: '4h' },
    { label: '1D', value: '1d' },
  ];

  return (
    <div className="flex flex-col gap-4 p-4 bg-gray-800 rounded-lg">
      {/* Timeframe selector */}
      <div className="flex gap-2 mb-2">
        {timeframes.map(({ label, value }) => (
          <TimeframeButton
            key={value}
            active={timeframe === value}
            onClick={() => setTimeframe(value)}
          >
            {label}
          </TimeframeButton>
        ))}
      </div>

      {/* Chart container */}
      <div className="relative">
        <div 
          ref={containerRef} 
          className="border border-gray-700 rounded-lg"
        />
        
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 rounded-lg">
            <div className="text-blue-500">Loading...</div>
          </div>
        )}

        {/* Error overlay */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 rounded-lg">
            <div className="text-red-500 text-center p-4">
              <div className="mb-2">Error: {error}</div>
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Retry
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Current price display */}
      {currentPrice && (
        <div className="text-right text-sm text-gray-300">
          Current Price: {currentPrice.toFixed(5)}
        </div>
      )}
    </div>
  );
};

export default TradingChart;