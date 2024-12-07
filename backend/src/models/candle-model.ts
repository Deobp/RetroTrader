import { Schema, model, models, Model } from "mongoose";
import ICandle from "../interfaces/candle-interface";

const CandleSchema: Schema<ICandle> = new Schema<ICandle>({
  time: { type: Number, required: true },
  open: { type: Number, required: true },
  high: { type: Number, required: true },
  low: { type: Number, required: true },
  close: { type: Number, required: true },
  volume: { type: Number, required: true },
  spreads: { type: Number, required: true },
});

//create an index on the time field in descending order
CandleSchema.index({ time: -1 }, { background: true });

//dynamically get or create a candle model for a given collection name.
export const getCandleModel = (collection: string): Model<ICandle> => {
  if (models[collection]) {
    return models[collection] as Model<ICandle>;
  }

  return model<ICandle>(collection, CandleSchema, collection);
};

export default getCandleModel;


