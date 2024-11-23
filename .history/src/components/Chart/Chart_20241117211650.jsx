import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createChart } from 'lightweight-charts';

// Constants moved to a separate configuration file
const CHART_CONFIG = {
  backgroundColor: '#1e1e1e',
  textColor: '#d1d4dc',
  gridColor: '#2a2a2a',
  upColor: '#26a69a',
  downColor: '#ef5350',
};

const TIMEFRAME_MAP = {
  '1min': 'M1',
  '5min': 'M5',
  '15min': 'M15',
  '30min': 'M30',
  '1h': 'H1',
  '4h': 'H4',
  '1day': 'D1',
};

// Custom hook for chart data loading
const useChartData = (timeframe) => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`../../../data/eurusd/EURUSD_${TIMEFRAME_MAP[timeframe]}.json`);
      console.log(timeframe)
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }

      const rawData = await response.json();
      const epochStart = new Date('2000-01-01T00:00:00Z').getTime() / 1000;

      const formattedData = rawData.time.map((time, i) => ({
        time: time * 60 + epochStart,
        open: rawData.open[i],
        high: rawData.high[i],
        low: rawData.low[i],
        close: rawData.close[i],
      }));

      setData(formattedData);
    } catch (err) {
      setError(err.message);
      console.error('Error loading chart data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [timeframe]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { data, error, isLoading, reloadData: loadData };
};

// Custom hook for chart instance
const useChartInstance = (containerRef, timeframe) => {
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || chartRef.current) return;

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

const TradingChart = ({ timeframe = '15min' }) => {
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

  // Error and loading states
  if (error) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-gray-900 rounded-lg border border-red-500">
        <div className="text-red-500">
          Error loading chart data: {error}
        </div>
      </div>
    );
  }

  if (isLoading && !data) {
    return (
      <div className="flex items-center justify-center h-[400px] bg-gray-900 rounded-lg">
        <div className="text-blue-500">Loading chart data...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div 
        ref={containerRef} 
        className="border border-gray-700 rounded-lg"
      />
      {currentPrice && (
        <div className="text-right text-sm">
          Current Price: {currentPrice.toFixed(5)}
        </div>
      )}
    </div>
  );
};

export default TradingChart;