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

      const startPoint = startIndex !== null 
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

const TradingChart = () => {
  const containerRef = useRef(null);
  const [timeframe, setTimeframe] = useState('1h');
  const [barCount, setBarCount] = useState(250);
  const [startIndex, setStartIndex] = useState(null);
  const [lastViewedIndex, setLastViewedIndex] = useState(null);

  const { 
    data, 
    error, 
    isLoading,
    fullDataset,
    addNextCandle
  } = useChartData(timeframe, barCount, startIndex ?? lastViewedIndex);

  const { chartRef, candleSeriesRef } = useChartInstance(containerRef);

  useEffect(() => {
    if (data && candleSeriesRef.current) {
      candleSeriesRef.current.setData(data);
    }
  }, [data]);

  const handleRandomDateNavigation = () => {
    if (fullDataset) {
      const randomIndex = Math.floor(
        Math.random() * (fullDataset.length - barCount)
      );
      setLastViewedIndex(randomIndex);
      setStartIndex(randomIndex);
    }
  };

  const handleTimeframeChange = (newTimeframe) => {
    setTimeframe(newTimeframe);
    setStartIndex(null); // Reset navigation
  };

  return (
    <div className="chart">
      <div>
        {Object.keys(TIMEFRAME_MAP).map((tf) => (
          <button
            key={tf}
            onClick={() => handleTimeframeChange(tf)}
            style={{
              fontWeight: timeframe === tf ? 'bold' : 'normal',
              color: timeframe === tf ? '#26a69a' : '#d1d4dc',
            }}
          >
            {tf}
          </button>
        ))}
      </div>
      <div>
        <select onChange={(e) => setBarCount(Number(e.target.value))} value={barCount}>
          {BAR_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option} Candles
            </option>
          ))}
        </select>
      </div>
      <button onClick={handleRandomDateNavigation}>Random History Point</button>
      <button onClick={addNextCandle}>Next Candle</button>
      <div ref={containerRef} className="chart-container" />
      {isLoading && <div>Loading...</div>}
      {error && <div>Error: {error}</div>}
    </div>
  );
};

export default TradingChart;
