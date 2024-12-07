import { TIMEFRAMES } from "../../constants/chartConfig";
import { useSelector, useDispatch } from 'react-redux';
import { setTimeframe } from '../../redux/slices/timeframeSlice';
const Controls = ({onRandomNavigation,onNextCandle,}) => {
  //access global tf
  const timeframe = useSelector((state) => state.timeframe);
  const dispatch = useDispatch();

  const handleTimeframeChange = (newTimeframe) => {
    //dispatch to update tf
    dispatch(setTimeframe(newTimeframe));
  };
  return (
    <div className="controls">
      <div className="timeframes">
        {TIMEFRAMES.map((tf) => (
          <button
            key={tf}
            onClick={() => handleTimeframeChange(tf)}
            className={`timeframe-button ${
              timeframe === tf ? "active" : ""
            }`}
          >
            {tf}
          </button>
        ))}
      </div>

      <div className="actions">
        <button onClick={onRandomNavigation}>Random Historical Data</button>
        <button onClick={onNextCandle}>Next Candle</button>
      </div>
    </div>
  );
};

export default Controls;
