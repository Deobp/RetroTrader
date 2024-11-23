import { useEffect, useRef } from 'react';
import { createChart } from 'lightweight-charts';
import { CHART_CONFIG } from '../constants/chartConfig';

export const useChartInstance = (containerRef) => {
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    chartRef.current = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: 800,
      ...CHART_CONFIG.layout,
    });

    candleSeriesRef.current = chartRef.current.addCandlestickSeries(
      CHART_CONFIG.seriesOptions
    );

    const handleResize = () => {
      if (chartRef.current) {
        chartRef.current.applyOptions({
          width: containerRef.current.clientWidth,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      chartRef.current.remove();
    };
  }, []);

  return { chartRef, candleSeriesRef };
};
