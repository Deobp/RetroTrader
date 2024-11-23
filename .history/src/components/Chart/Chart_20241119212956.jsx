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

const useChartData = (timeframe, barCount, startIndex = null) => {
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
        secondsVisible: ['1m', '5m'].includes(timeframe),
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

const TradingChart = (timeframe) => {
  const containerRef = useRef(null);
  const [timeframe, setTimeframe] = useState(timeframe);
  const [barCount, setBarCount] = useState(250);
  const [currentPrice, setCurrentPrice] = useState(null);
  const [startIndex, setStartIndex] = useState(null);

  const { 
    data, 
    error, 
    isLoading,
    fullDataset,
    addNextCandle
  } = useChartData(timeframe, barCount, startIndex);
  
  const { 
    chartRef, 
    candleSeriesRef 
  } = useChartInstance(containerRef, timeframe);

  // Update data and price when data changes
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

  const handleRandomDateNavigation = () => {
    if (fullDataset) {
      const randomIndex = Math.floor(
        Math.random() * (fullDataset.length - barCount)
      );
      setStartIndex(randomIndex);
    }
  };

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
          onClick={handleRandomDateNavigation}
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
        <div className="flex justify-between text-sm">
          <div>Current Timeframe: {timeframe}</div>
          <div>Current Price: {currentPrice.toFixed(5)}</div>
        </div>
      )}
    </div>
  );
};

export default TradingChart;