import { Document } from "mongoose";

export default interface ITradeStats extends Document {
  userId: string;
  tradeCount: number;
  tradeResult: number;
}
