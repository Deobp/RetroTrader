import { useEffect, useRef, useState, useCallback, useContext } from "react";
import { createChart } from "lightweight-charts";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { CHART_CONFIG, CANDLE_SERIES_OPTIONS } from "../../constants/chartConfig";
import Controls from "../Controls/TimeframeControls";
import { setLastCandleClosePrice } from "../../redux/slices/lastCandleSlice";
import TradeStats from "../TradeStats";
import { AuthContext } from "../../context/AuthContext";
import styles from "./Chart.module.css";

const Chart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);
  const timeframe = useSelector((state) => state.timeframe);

  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastCandleTime, setLastCandleTime] = useState(null);

  const fetchCandles = useCallback(
    async (endpoint, queryParams = {}) => {
      setIsLoading(true);
      setError(null);
      try {
        let url;

        if (endpoint === "next") {
          const { symbol, timeframe, date } = queryParams;
          const params = new URLSearchParams({
            symbol,
            timeframe,
            date,
          }).toString();
          url = `http://localhost:5001/api/candles/${endpoint}?${params}`;
        } else if (endpoint === "goToDate") {
          const params = new URLSearchParams(queryParams).toString();
          url = `http://localhost:5001/api/candles/EURUSD/${timeframe}/${endpoint}?${params}`;
        } else {
          const params = new URLSearchParams(queryParams).toString();
          url = `http://localhost:5001/api/candles/EURUSD/${timeframe}/${endpoint}?${params}`;
        }

        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Failed to fetch data from ${endpoint}.`);
        }

        const rawData = await response.json();

        if (Array.isArray(rawData) && rawData.length > 0) {
          const formattedData = rawData.map((candle) => ({
            time: Math.floor(new Date(candle.datetime).getTime() / 1000),
            open: parseFloat(candle.open),
            high: parseFloat(candle.high),
            low: parseFloat(candle.low),
            close: parseFloat(candle.close),
          }));

          if (candleSeriesRef.current) {
            candleSeriesRef.current.setData(formattedData);
            const lastCandle = formattedData[formattedData.length - 1];
            setLastCandleTime(lastCandle.time);
            dispatch(setLastCandleClosePrice(lastCandle.close));
          }
        } else if (rawData.datetime) {
          const nextCandle = {
            time: Math.floor(new Date(rawData.datetime).getTime() / 1000),
            open: parseFloat(rawData.open),
            high: parseFloat(rawData.high),
            low: parseFloat(rawData.low),
            close: parseFloat(rawData.close),
          };

          if (candleSeriesRef.current) {
            candleSeriesRef.current.update(nextCandle);
            setLastCandleTime(nextCandle.time);
            dispatch(setLastCandleClosePrice(nextCandle.close));
          }
        } else {
          throw new Error("Invalid or empty data format from API.");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    },
    [timeframe, dispatch]
  );

  useEffect(() => {
    if (containerRef.current && !chartRef.current) {
      chartRef.current = createChart(containerRef.current, {
        width: containerRef.current.clientWidth,
        height: 400,
        ...CHART_CONFIG.layout,
        localization: {
          locale: "en-US",
          timeFormatter: (time) => {
            const date = new Date(time * 1000);
            return date.toLocaleString("en-US", { month: "short", day: "numeric" });
          },
        },
      });

      candleSeriesRef.current = chartRef.current.addCandlestickSeries(
        CANDLE_SERIES_OPTIONS
      );

      chartRef.current.applyOptions({
        handleScale: true,
        handleScroll: true,
      });

      const handleResize = () => {
        chartRef.current.applyOptions({
          width: containerRef.current.clientWidth,
        });
      };

      window.addEventListener("resize", handleResize);
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }
    if (!lastCandleTime) {
      fetchCandles("last250");
    } else {
      const date = new Date(lastCandleTime * 1000).toISOString();
      fetchCandles(`${date}/goToDate`);
    }
  }, [fetchCandles, lastCandleTime]);

  return (
    <div className={styles.container}>
      <div className={styles.navigation}>
        <button
          onClick={() => navigate("/")}
          className={`${styles.navButton} ${styles.homeButton}`}
        >
          Home
        </button>
        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          className={`${styles.navButton} ${styles.logoutButton}`}
        >
          Logout
        </button>
      </div>

      <Controls
        onRandomNavigation={() => fetchCandles("random")}
        onNextCandle={() => {
          if (lastCandleTime) {
            const date = new Date(lastCandleTime * 1000).toISOString();
            fetchCandles("next", {
              symbol: "EURUSD",
              timeframe: timeframe,
              date: date,
            });
          } else {
            console.error("Last candle time is not available.");
          }
        }}
      />

      {isLoading && <div className={styles.loadingOverlay}>Loading...</div>}
      {error && <div className={styles.errorOverlay}>Error: {error}</div>}

      <div
        ref={containerRef}
        className={styles.chartWrapper}
      />
            <TradeStats />
    </div>
  );
};

export default Chart;