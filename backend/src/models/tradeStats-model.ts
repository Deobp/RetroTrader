import mongoose, { Document, Model } from "mongoose";
import ITradeStats from "../interfaces/tradeStats-interface";

const TradeStatsSchema = new mongoose.Schema<ITradeStats>({
  userId: {
    type: String,
    required: true,
  },
  tradeCount: {
    type: Number,
    required: true,
  },
  tradeResult: {
    type: Number,
    required: true,
  },
});

const TradeStatsModel = mongoose.model<ITradeStats>(
  "TradeStats",
  TradeStatsSchema
);

export default TradeStatsModel;
