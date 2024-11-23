import React, { useEffect, useRef, useState } from 'react';
import { useChartInstance } from '../../hooks/useChartInstance';
import { useChartData } from '../../hooks/useChartData';
import Controls from '../Controls';
import { BAR_OPTIONS } from '../../constants/chartConfig';

const Chart = ({ timeframe }) => {
  const [localTf, setTimeframe] = useState(timeframe);
  const [barCount, setBarCount] = useState(250);
  const containerRef = useRef(null);
  const { chartRef, candleSeriesRef } = useChartInstance(containerRef);
  const {
    data,
    error,
    isLoading,
    reloadData,
    fullDataset,
    addNextCandle,
  } = useChartData(localTf, 250);

  useEffect(() => {
    if (data && candleSeriesRef.current) {
      candleSeriesRef.current.setData(data);
    }
  }, [data, candleSeriesRef]);

  const handleRandomDateNavigation = () => {
    if (fullDataset) {
      const randomIndex = Math.floor(Math.random() * fullDataset.length);
      reloadData({ startIndex: randomIndex });
    }
  };

  if (error) {
    return <div className="error-container">Error: {error}</div>;
  }

  return (
    <div className="chart-container">
      <Controls
        onTimeframeChange={setTimeframe}
        currentTimeframe={localTf}
        fullDataset={fullDataset}
        // onRandomNavigation={onRandomNavigation}
        // onAddCandle={onAddCandle}
      />
      <div ref={containerRef} className="chart-wrapper" />
      {isLoading && <div className="loading-overlay">Loading...</div>}
    </div>
  );
};

export default Chart;



