import { useState, useCallback } from "react";
import { useSelector } from "react-redux";
import styles from "./TradeStats.module.css";

const TradeStats = () => {
  const lastCandleClosePrice = useSelector((state) => state.lastCandle.closePrice);

  const [tradeStats, setTradeStats] = useState({
    tradeCount: 0,
    totalResult: 0,
  });
  const [lastTrade, setLastTrade] = useState(null);
  const [currentPosition, setCurrentPosition] = useState(null);
  const [error, setError] = useState(null);

  const resetTradeStats = useCallback(() => {
    setTradeStats({ tradeCount: 0, totalResult: 0 });
    setLastTrade(null);
    setCurrentPosition(null);
    setError(null);
  }, []);

  const addTrade = useCallback((tradeResult) => {
    setTradeStats((prevStats) => ({
      tradeCount: prevStats.tradeCount + 1,
      totalResult: prevStats.totalResult + tradeResult,
    }));
    setLastTrade({ tradeResult });
  }, []);

  const handlePositionOpen = useCallback(
    (type) => {
      if (currentPosition) {
        setError(`You already have an open ${currentPosition.type} position.`);
        return;
      }

      if (!lastCandleClosePrice) {
        setError("Unable to determine entry price. Please check data source.");
        return;
      }

      setCurrentPosition({ type, entryPrice: lastCandleClosePrice });
      setError(null);
    },
    [currentPosition, lastCandleClosePrice]
  );

  const handleClosePosition = useCallback(() => {
    if (!currentPosition) {
      setError("No open position to close.");
      return;
    }

    if (!lastCandleClosePrice) {
      setError("Unable to determine exit price. Please check data source.");
      return;
    }

    const exitPrice = lastCandleClosePrice;
    const profitLoss =
      currentPosition.type === "long"
        ? exitPrice - currentPosition.entryPrice
        : currentPosition.entryPrice - exitPrice;

    addTrade(profitLoss * 1000);

    setCurrentPosition(null);
    setError(null);
  }, [currentPosition, lastCandleClosePrice, addTrade]);

  return (
    <div className={styles.tradeStatsContainer}>
      <div className={styles.tradeActions}>
        <button
          onClick={() => handlePositionOpen("long")}
          className={styles.actionButton}
        >
          Long
        </button>
        <button
          onClick={() => handlePositionOpen("short")}
          className={styles.actionButton}
        >
          Short
        </button>
        <button onClick={handleClosePosition} className={styles.actionButton}>
          Close Position
        </button>
        <button onClick={resetTradeStats} className={styles.actionButton}>
          Reset Stats
        </button>
      </div>
      <h2>Trade Statistics</h2>
      {error && <div className={styles.errorMessage}>{error}</div>}

      <div className={styles.statsDisplay}>
        <p>Trade Count: {tradeStats.tradeCount}</p>
        <p>Total Result: ${tradeStats.totalResult.toFixed(2)}</p>
        {lastTrade && (
          <div className={styles.lastTrade}>
            <p>Last Trade Result: ${lastTrade.tradeResult.toFixed(2)}</p>
          </div>
        )}
        {currentPosition && (
          <div className={styles.currentPosition}>
            <p>
              Current Position: {currentPosition.type.toUpperCase()} at $
              {currentPosition.entryPrice}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TradeStats;
