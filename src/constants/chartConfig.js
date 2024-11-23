export const CHART_CONFIG = {
  layout: {
    layout: { backgroundColor: '#1e1e1e', textColor: '#d1d4dc' },
    grid: { vertLines: { color: '#2a2a2a33' }, horzLines: { color: '#2a2a2a33' } },
    timeScale: { timeVisible: true },
  },
  seriesOptions: {
    upColor: '#26a69a',
    downColor: '#ef5350',
    priceFormat: { type: 'price', precision: 5, minMove: 0.00001 },
  },
};

export const BAR_OPTIONS = [50, 100, 250, 500, 1000];
export const TIMEFRAMES = ['M1', 'M5', 'M15', 'M30', 'H1', 'H4', 'D1'];
