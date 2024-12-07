export interface ICandle {
  _id?: any;
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  spreads: number;
}

export default ICandle;
