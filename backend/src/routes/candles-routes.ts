import { Router } from "express";
import {
  getLast250Candles,
  getRandomHistoricalCandles,
  getNextCandle,
  getCandlesByDate,
} from "../controllers/candles-controller";

const router: Router = Router();

//fetch the last 250 candles from a specific collection
router.get("/candles/:collectionName/last250", getLast250Candles);

//fetch a random historical candle and its preceding 250 candles
router.get("/candles/:collectionName/random", getRandomHistoricalCandles);

//fetch the next candle based on the provided last candle time
router.get("/candles/:collectionName/next", getNextCandle);

//fetch candles by a specific date (timestamp) and timeframe
router.get("/candles/:collectionName/goToDate", getCandlesByDate);

export default router;
