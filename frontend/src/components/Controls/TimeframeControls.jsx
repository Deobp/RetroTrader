import { useSelector, useDispatch } from "react-redux";
import { TIMEFRAMES } from "../../constants/chartConfig";
import { setTimeframe } from "../../redux/slices/timeframeSlice";
import styles from "./TimeframeControls.module.css";

const Controls = ({ onRandomNavigation, onNextCandle }) => {
  const timeframe = useSelector((state) => state.timeframe);
  const dispatch = useDispatch();

  const handleTimeframeChange = (newTimeframe) => {
    dispatch(setTimeframe(newTimeframe));
  };

  return (
    <div className={styles.controls}>
      {/* Timeframe Buttons */}
      <div className={styles.timeframes}>
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf}
            onClick={() => handleTimeframeChange(tf)}
            className={`${styles.timeframeButton} ${
              timeframe === tf ? styles.active : ""
            }`}
          >
            {tf}
          </button>
        ))}
      </div>

      <div className={styles.actions}>
        <button onClick={onRandomNavigation} className={styles.actionButton}>
          Random Historical Data
        </button>
        <button onClick={onNextCandle} className={styles.actionButton}>
          Next Candle
        </button>
      </div>
    </div>
  );
};

export default Controls;
