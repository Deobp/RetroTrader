export default interface ICandle {
  id: number;
  symbol_id: number;
  timeframe_id: number;
  datetime: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}