// import { Request, Response, NextFunction } from "express";
// import TradeStats from "../models/tradeStats-model";
// import getCandleModel from "../models/candle-model";
// import { Position } from "../interfaces/position-interface";

// export const getTradeStats = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     if (!req.user) {
//       res.status(401).json({ message: "Unauthorized." });
//       return;
//     }

//     const userId = req.user.id;
//     let stats = await TradeStats.findOne({ userId });

//     if (!stats) {
//       stats = new TradeStats({ userId, tradeCount: 0, tradeResult: 0 });
//       await stats.save();
//     }

//     res.status(200).json({
//       tradeCount: stats.tradeCount,
//       tradeResult: stats.tradeResult,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// export const resetTradeStats = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     if (!req.user) {
//       res.status(401).json({ message: "Unauthorized." });
//       return;
//     }

//     const userId = req.user.id;
//     const stats = await TradeStats.findOneAndUpdate(
//       { userId },
//       { tradeCount: 0, tradeResult: 0 },
//       { new: true }
//     );

//     if (!stats) {
//       res.status(404).json({ message: "Stats not found for user." });
//       return;
//     }

//     res.status(200).json({
//       tradeCount: stats.tradeCount,
//       tradeResult: stats.tradeResult,
//       message: "Trade stats reset successfully.",
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// export const addTrade = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     if (!req.user) {
//       res.status(401).json({ message: "Unauthorized." });
//       return;
//     }

//     const userId = req.user.id;
//     const { tradeCount, tradeResult } = req.body;

//     let stats = await TradeStats.findOne({ userId });

//     if (!stats) {
//       stats = new TradeStats({ userId, tradeCount, tradeResult });
//     } else {
//       stats.tradeCount += tradeCount;
//       stats.tradeResult += tradeResult;
//     }

//     await stats.save();

//     res.status(200).json({
//       tradeCount: stats.tradeCount,
//       tradeResult: stats.tradeResult,
//     });
//   } catch (error) {
//     next(error);
//   }
// };

// export const takePosition = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     if (!req.user) {
//       res.status(401).json({ message: "Unauthorized." });
//       return;
//     }

//     //positionType: short || long
//     const { collectionName, positionType } = req.body; 
//     const Candle = getCandleModel(collectionName);

//     //get the last candle
//     const lastCandle = await Candle.findOne().sort({ time: -1 }).lean();
//     if (!lastCandle) {
//       res.status(404).json({ message: "No candles found." });
//       return;
//     }

//     // save the position with the last candle's close price
//     const position = {
//       userId: req.user.id,
//       positionType,
//       entryPrice: lastCandle.close,
//       isOpen: true,
//     };
//     console.log('trying take position')

//     res.status(200).json({ message: "Position taken successfully.", position });
//   } catch (error) {
//     next(error);
//   }
// };

// export const closePosition = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<void> => {
//   try {
//     if (!req.user) {
//       res.status(401).json({ message: "Unauthorized." });
//       return;
//     }

//     const { collectionName } = req.body;
//     const Candle = getCandleModel(collectionName);

//     // get the last candle
//     const lastCandle = await Candle.findOne().sort({ time: -1 }).lean();
//     if (!lastCandle) {
//       res.status(404).json({ message: "No candles found." });
//       return;
//     }

//     //Fetch the open position
//     const position: Position = {
//       isOpen: false,
//       positionType: "",
//       entryPrice: 0,
//       profitLoss: 0,
//       exitPrice: 0
//     }; 

//     if (!position?.isOpen) {
//       res.status(404).json({ message: "No open position found." });
//       return;
//     }

//     //calc profit/loss
//     const profitLoss = position.positionType === 'buy'
//       ? lastCandle.close - position.entryPrice
//       : position.entryPrice - lastCandle.close;

//     //upd position to closed
//     position.isOpen = false;
//     position.exitPrice = lastCandle.close;
//     position.profitLoss = profitLoss;

//     res.status(200).json({ message: "Position closed successfully.", position });
//   } catch (error) {
//     next(error);
//   }
// };
