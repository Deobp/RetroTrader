import { Request, Response, NextFunction } from "express";
import getCandleModel from "../models/candle-model";

//get the last 250 candles
export const getLast250Candles = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { collectionName } = req.params;
    const { lastCandleTime } = req.query;

    if (!collectionName) {
      res.status(400).json({ message: "Collection name is required" });
      return;
    }

    const Candle = getCandleModel(collectionName);

    let candles;
    if (lastCandleTime) {
      // Fetch last 250 candles after the specified lastCandleTime
      candles = await Candle.find({ time: { $lte: Number(lastCandleTime) } })
        .sort({ time: -1 })
        .limit(250)
        .lean();
    } else {
      // Default behavior, fetch the last 250 candles
      candles = await Candle.find()
        .sort({ time: -1 })
        .limit(250)
        .lean();
    }

    res.status(200).json(candles.reverse());
  } catch (error) {
    console.error("Error fetching last 250 candles:", error);
    next(error);
  }
};


// get random historical candles
export const getRandomHistoricalCandles = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { collectionName } = req.params;
    if (!collectionName) {
      res.status(400).json({ message: "Collection name is required" });
      return;
    }

    const Candle = getCandleModel(collectionName);

    const totalCandlesCount = await Candle.countDocuments();
    const randomIndex = Math.floor(Math.random() * totalCandlesCount);

    const randomCandle = await Candle.findOne()
      .skip(randomIndex)
      .lean();

    if (!randomCandle) {
      res.status(404).json({ message: "No random candle found" });
      return;
    }

    const historicalTime = randomCandle.time;
    const candles = await Candle.find({ time: { $lte: historicalTime } })
      .sort({ time: -1 })
      .limit(250)
      .lean();

    res.status(200).json(candles.reverse());
  } catch (error) {
    console.error("Error fetching random historical candles:", error);
    next(error);
  }
};

// get the next candle
export const getNextCandle = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { collectionName } = req.params;
    const { lastCandleTime, timeframe } = req.query;

    if (!collectionName) {
      res.status(400).json({ message: "Collection name is required" });
      return;
    }

    if (!lastCandleTime) {
      res.status(400).json({ message: "Last candle time is required" });
      return;
    }

    const lastTime = Number(lastCandleTime);
    const Candle = getCandleModel(collectionName);

    const nextCandle = await Candle.findOne({ time: { $gt: lastTime } })
      .sort({ time: 1 })
      .lean();

    if (!nextCandle) {
      res.status(404).json({ message: "No next candle found" });
      return;
    }

    if (timeframe) {
      const timeInFrame = new Date(nextCandle.time);
      if (timeframe === "hour") {
        timeInFrame.setMinutes(0, 0, 0);
      } else if (timeframe === "minute") {
        timeInFrame.setSeconds(0, 0);
      }
      nextCandle.time = timeInFrame.getTime();
    }

    res.status(200).json(nextCandle);
  } catch (error) {
    console.error("Error fetching next candle:", error);
    next(error);
  }
};

// get specific date candle
export const getCandlesByDate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { collectionName } = req.params;
    const { timestamp, timeframe } = req.query;

    if (!collectionName) {
      res.status(400).json({ message: "Collection name is required." });
      return;
    }

    if (!timestamp || isNaN(Number(timestamp))) {
      res.status(400).json({ message: "Valid timestamp is required." });
      return;
    }

    const time = Number(timestamp);
    const Candle = getCandleModel(collectionName);

    const candles = await Candle.find({ time: { $lte: time } })
      .sort({ time: -1 })
      .limit(250)
      .lean();

    if (!candles || candles.length === 0) {
      res.status(404).json({ message: "No candles found for the given timestamp." });
      return;
    }

    if (timeframe) {
      const adjustedCandles = candles.map((candle) => {
        const timeInFrame = new Date(candle.time);
        if (timeframe === "hour") {
          timeInFrame.setMinutes(0, 0, 0);
        } else if (timeframe === "minute") {
          timeInFrame.setSeconds(0, 0);
        }
        candle.time = timeInFrame.getTime();
        return candle;
      });
      res.status(200).json({ message: "Candles fetched successfully.", data: adjustedCandles.reverse() });
    } else {
      res.status(200).json({ message: "Candles fetched successfully.", data: candles.reverse() });
    }
  } catch (error) {
    console.error("Error fetching candles by date:", error);
    next(error);
  }
};
