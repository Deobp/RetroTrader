export const CHART_CONFIG = {
  layout: {
    backgroundColor: '#dad8cc',
    textColor: '#000000',
  },
  grid: {
    vertLines: { color: '#dad8cc' },
    horzLines: { color: '#dad8cc' },
  },
  crosshair: {
    mode: 0,
    vertLine: {
      color: '#849fdb',
      width: 1,
      style: 1,
      labelVisible: true,
    },
    horzLine: {
      color: '#849fdb',
      width: 1,
      style: 1,
      labelVisible: true,
    },
  },
  priceScale: {
    borderColor: '#849fdb',
    position: 'right',
    mode: 1,
    scaleMargins: { top: 0.2, bottom: 0.2 },
    autoScale: true,
    drawTicks: true,
    textColor: '#000000',
  },
  timeScale: {
    borderColor: '#485c7b',
    timeVisible: true,
    secondsVisible: false,
    rightOffset: 10,
    barSpacing: 6,
    fixLeftEdge: true,
    drawTicks: true,
    textColor: '#849fdb',
    tickMarkFormatter: (timestamp) => {
      const date = new Date(timestamp * 1000);
      return `${date.getUTCHours()}:${date.getUTCMinutes()}`;
    },
  },
};

export const CANDLE_SERIES_OPTIONS = {
  upColor: '#fefdff',
  downColor: '#5d5c65',
  borderUpColor: '#000000',
  borderDownColor: '#000000',
  wickUpColor: '#000000',
  wickDownColor: '#000000',
  priceLineVisible: true,
  lastValueVisible: true,
  priceFormat: {
    type: 'price',
    precision: 5,
    minMove: 0.00001,
  },
};

export const TIMEFRAMES = ['M1', 'M3', 'M5', 'M15', 'H1', 'H4', 'D1', 'W'];
