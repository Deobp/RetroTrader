import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

const TradeStats = () => {
  const dispatch = useDispatch();
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

  const handlePositionOpen = useCallback((type) => {
    if (currentPosition) {
      setError(`You already have an open ${currentPosition.type} position.`);
      return;
    }
    console.log(lastCandleClosePrice)
    if (!lastCandleClosePrice) {
      setError("Unable to determine entry price. Please check data source.");
      return;
    }

    setCurrentPosition({ 
      type, 
      entryPrice: lastCandleClosePrice 
    });

    //clear any prev err's
    setError(null);
  }, [currentPosition, lastCandleClosePrice]);

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
    let profitLoss = 0;

    //calc profit/loss only if the position is opened and closed
    if (currentPosition.entryPrice !== exitPrice) {
      profitLoss = currentPosition.type === 'long'
        ? (exitPrice - currentPosition.entryPrice)
        : (currentPosition.entryPrice - exitPrice);

      //mult by 1000 to reflect the $100 000 trade
      addTrade(profitLoss * 1000);
    }

    //clear curr position and any err's
    setCurrentPosition(null);
    setError(null);
  }, [currentPosition, lastCandleClosePrice, addTrade]);

  return (
    <div className="trade-stats-container">
      <h2>Trade Statistics</h2>
      {error && <div className="error-message">{error}</div>}
      
      <div className="stats-display">
        <p>Trade Count: {tradeStats.tradeCount}</p>
        <p>Total Result: ${tradeStats.totalResult.toFixed(2)}</p>
        
        {lastTrade && (
          <div className="last-trade">
            <p>Last Trade Result: ${lastTrade.tradeResult.toFixed(2)}</p>
          </div>
        )}
        
        {currentPosition && (
          <div className="current-position">
            <p>Current Position: {currentPosition.type.toUpperCase()} at ${currentPosition.entryPrice}</p>
          </div>
        )}
      </div>

      <div className="trade-actions">
        <button onClick={() => handlePositionOpen('long')}>Long</button>
        <button onClick={() => handlePositionOpen('short')}>Short</button>
        <button onClick={handleClosePosition}>Close Position</button>
        <button onClick={resetTradeStats}>Reset Stats</button>
      </div>
    </div>
  );
};

export default TradeStats;