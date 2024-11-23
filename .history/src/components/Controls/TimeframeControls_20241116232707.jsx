import React from "react";

const TimeframeControls = ({ setTf, activeTf }) => {
  return (
    <div className="timeframe-buttons">
      <button
        onClick={() => setTf("1m")}
        className={activeTf === "1m" ? "active" : ""}
      >
        M1
      </button>
      <button
        onClick={() => setTf("5m")}
        className={activeTf === "5m" ? "active" : ""}
      >
        M5
      </button>
      <button
        onClick={() => setTf("15m")}
        className={activeTf === "15m" ? "active" : ""}
      >
        M15
      </button>
      <button
        onClick={() => setTf("30m")}
        className={activeTf === "30m" ? "active" : ""}
      >
        M30
      </button>
      <button
        onClick={() => setTf("1h")}
        className={activeTf === "1h" ? "active" : ""}
      >
        H1
      </button>
      <button
        onClick={() => setTf("4h")}
        className={activeTf === "4h" ? "active" : ""}
      >
        H4
      </button>
      <button
        onClick={() => setTf("1d")}
        className={activeTf === "1d" ? "active" : ""}
      >
        D1
      </button>
    </div>
  );
};

export default TimeframeControls;
