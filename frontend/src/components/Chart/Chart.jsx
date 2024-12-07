import { useEffect, useRef, useState } from "react";
import { createChart } from "lightweight-charts";
import { useSelector, useDispatch } from 'react-redux';

import { CHART_CONFIG, CANDLE_SERIES_OPTIONS } from "../../constants/chartConfig";
import Controls from "../Controls/TimeframeControls";
import { setLastCandleClosePrice } from '../../redux/slices/lastCandleSlice';
import TradeStats from "../TradeStats";

const Chart = () => {
  const dispatch = useDispatch();
  //access global tf
  const timeframe = useSelector((state) => state.timeframe); 

  
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastCandleTime, setLastCandleTime] = useState(null);

  const fetchCandles = async (endpoint, queryParams = "") => {
    setIsLoading(true);
    setError(null);

    try {
      const url = queryParams
        ? `http://localhost:5001/api/candles/EURUSD_${timeframe}/${endpoint}${queryParams}`
        : `http://localhost:5001/api/candles/EURUSD_${timeframe}/${endpoint}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error(`Failed to fetch data from ${endpoint}.`);

      const rawData = await response.json();

      if (endpoint === "next") {

        //handle single candle object
        const nextCandle = {
          time: rawData.time,
          open: rawData.open,
          high: rawData.high,
          low: rawData.low,
          close: rawData.close,
        };

        if (candleSeriesRef.current) {
          candleSeriesRef.current.update(nextCandle);
          //upd last candle time & price
          setLastCandleTime(nextCandle.time); 
          dispatch(setLastCandleClosePrice(nextCandle.close));

        }
      } else {
        //handle array of candles
        const formattedData = rawData.map((candle) => ({
          time: candle.time,
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
        }));

        if (candleSeriesRef.current) {
          candleSeriesRef.current.setData(formattedData);
          setLastCandleTime(formattedData[formattedData.length - 1].time);
          dispatch(setLastCandleClosePrice(formattedData[formattedData.length - 1].close));

        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (containerRef.current && !chartRef.current) {
      chartRef.current = createChart(containerRef.current, {
        width: 1200,
        height: 400,
        ...CHART_CONFIG,
        localization: {
          locale: 'en-US', 
          dateFormat: 'yyyy-MM-dd', 
        },
      });

      candleSeriesRef.current = chartRef.current.addCandlestickSeries(
        CANDLE_SERIES_OPTIONS
      );

      chartRef.current.applyOptions({
        handleScale: true,
        handleScroll: true,
      });
  
    }

    if (lastCandleTime) {
      //fetch candles from last available candle
      fetchCandles("last250", `?lastCandleTime=${lastCandleTime}`);
    } else {
      fetchCandles("last250");
    }

    return () => {
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [timeframe]);

  return (
    <div style={{ position: "relative" }}>

      <Controls 
        onRandomNavigation={() => fetchCandles("random")}
        onNextCandle={() => fetchCandles("next", `?lastCandleTime=${lastCandleTime}`)}
        currentTimeframe={timeframe}
        onTimeframeChange={(newTimeframe) => {
          setLastCandleTime(null);
          fetchCandles("last250", `?lastCandleTime=${lastCandleTime}`);
        }}
      />
      <TradeStats />
      {isLoading && <div className="loading-overlay">Loading...</div>}
      {error && <div>Error: {error}</div>}
      <div ref={containerRef} className="chart-wrapper" style={{ height: 400 }} />
      <div className="debug-info">
        <p>Last Candle Time: {lastCandleTime || "N/A"}</p>
      </div>
    </div>
  );
};

export default Chart;


