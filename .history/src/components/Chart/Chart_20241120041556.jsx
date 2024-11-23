import React, { useEffect, useRef, useState, useCallback } from 'react';
import { createChart } from 'lightweight-charts';

const CHART_CONFIG = {
  backgroundColor: '#1e1e1e',
  textColor: '#d1d4dc',
  gridColor: '#2a2a2a33',
  upColor: '#26a69a',
  downColor: '#ef5350',
};

const TIMEFRAMES = ['1m', '5m', '15m', '1h'];
const BAR_OPTIONS = [50, 100, 250, 500, 1000];

const TradingChart = () => {
  const containerRef = useRef(null);
  const [selectedBars, setSelectedBars] = useState([]);
  const [selectedTimeframes, setSelectedTimeframes] = useState([]);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

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
    });

    return () => {
      chartRef.current.remove();
    };
  }, []);

  const toggleSelection = (option, type) => {
    if (type === 'bars') {
      setSelectedBars((prev) =>
        prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]
      );
    } else if (type === 'timeframe') {
      setSelectedTimeframes((prev) =>
        prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option]
      );
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-4">
        <div className="flex gap-2">
          {BAR_OPTIONS.map((bars) => (
            <button
              key={bars}
              onClick={() => toggleSelection(bars, 'bars')}
              className={`px-2 py-1 rounded ${
                selectedBars.includes(bars) ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'
              }`}
            >
              {bars} Bars
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {TIMEFRAMES.map((timeframe) => (
            <button
              key={timeframe}
              onClick={() => toggleSelection(timeframe, 'timeframe')}
              className={`px-2 py-1 rounded ${
                selectedTimeframes.includes(timeframe)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300'
              }`}
            >
              {timeframe}
            </button>
          ))}
        </div>
      </div>

      <div ref={containerRef} className="border border-gray-700 rounded-lg" style={{ height: 400 }} />
    </div>
  );
};

export default TradingChart;
