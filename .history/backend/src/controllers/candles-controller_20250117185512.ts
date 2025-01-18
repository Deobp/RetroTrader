
import { Request, Response } from 'express';
import { Op } from 'sequelize';
import Candle from '../models/candle-model';
import Symbol from '../models/symbol-model';
import Timeframe from '../models/timeframe-model';

export const getLast250Candles = async (req: Request, res: Response): Promise<void> => {
  try {
    const { collectionName, timeframeName } = req.params;

    if (!collectionName || !timeframeName) {
      res.status(400).json({ error: 'Collection name and timeframe are required parameters.' });
      return;
    }

    const symbolRecord = await Symbol.findOne({ where: { name: collectionName } });
    const timeframeRecord = await Timeframe.findOne({ where: { name: timeframeName } });

    if (!symbolRecord || !timeframeRecord) {
      res.status(404).json({ error: 'Invalid collection name or timeframe.' });
      return;
    }

    const candles = await Candle.findAll({
      where: {
        symbol_id: symbolRecord.id,
        timeframe_id: timeframeRecord.id,
      },
      order: [['datetime', 'DESC']],
      limit: 300,
      raw: true,
    });

    if (!candles || candles.length === 0) {
      res.status(404).json({ error: 'No candles found for the specified parameters.' });
      return;
    }

    res.status(200).json(candles.reverse());
  } catch (error) {
    console.error('Error fetching last 250 candles:', error);
    res.status(500).json({ error: 'Failed to fetch candles due to server error.' });
  }
};


export const getRandomHistoricalCandles = async (req: Request, res: Response): Promise<void> => {
  try {
    const { collectionName, timeframeName } = req.params;

    if (!collectionName || !timeframeName) {
      res.status(400).json({ error: 'Collection name and timeframe are required parameters.' });
      return;
    }

    const symbolRecord = await Symbol.findOne({ where: { name: collectionName }, raw: true });
    const timeframeRecord = await Timeframe.findOne({ where: { name: timeframeName }, raw: true });

    if (!symbolRecord || !timeframeRecord) {
      res.status(404).json({ error: 'Invalid collection name or timeframe.' });
      return;
    }

    const firstCandle = await Candle.min<number, Candle>('id', {
      where: {
        symbol_id: symbolRecord.id,
        timeframe_id: timeframeRecord.id,
      },
    });

    const lastCandle = await Candle.max<number, Candle>('id', {
      where: {
        symbol_id: symbolRecord.id,
        timeframe_id: timeframeRecord.id,
      },
    });

    if (firstCandle === null || lastCandle === null) {
      res.status(404).json({ error: 'No candles found for the specified parameters.' });
      return;
    }

    console.log(`ID range: ${firstCandle} to ${lastCandle}`);

    const randomId = Math.floor(Math.random() * (lastCandle - firstCandle + 1)) + firstCandle;

    console.log(`Selected random ID: ${randomId}`);

    const candles = await Candle.findAll({
      where: {
        symbol_id: symbolRecord.id,
        timeframe_id: timeframeRecord.id,
        id: {
          [Op.lte]: randomId
        },
      },
      order: [['id', 'DESC']],
      limit: 300,
      raw: true,
    });

    if (candles.length === 0) {
      res.status(404).json({ error: 'No candles found.' });
      return;
    }

    res.status(200).json(candles.reverse());

  } catch (error) {
    console.error('Error fetching random historical candles:', error);
    res.status(500).json({ 
      error: 'Failed to fetch candles.',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// -- <START>: fixing sequlize date parsing issue -- 
import { types } from 'pg';
types.setTypeParser(1114, (stringValue: string) => {
  return new Date(stringValue.substring(0, 10) + 'T' + stringValue.substring(11) + 'Z');
});
// -- <END>: fixing sequlize date parsing issue -- 

export const getNextCandle = async (req: Request, res: Response): Promise<void> => {
  try {
    const { symbol, timeframe, date } = req.query;

    if (!symbol || !timeframe || !date) {
      res.status(400).json({ error: 'symbol, timeframe, and date are required query parameters.' });
      return;
    }

    const targetDate = new Date(date as string);

    if (isNaN(targetDate.getTime())) {
      res.status(400).json({ error: 'Invalid date format. Expected format: YYYY-MM-DDTHH:mm:ss.sssZ' });
      return;
    }

    const symbolRecord = await Symbol.findOne({ where: { name: String(symbol) } });
    const timeframeRecord = await Timeframe.findOne({ where: { name: String(timeframe) } });

    if (!symbolRecord || !timeframeRecord) {
      res.status(404).json({ error: 'Invalid symbol or timeframe.' });
      return;
    }

    const targetCandle = await Candle.findOne({
      where: {
        symbol_id: symbolRecord.id,
        timeframe_id: timeframeRecord.id,
        datetime: { [Op.lte]: targetDate },
      },
      order: [['datetime', 'DESC']],
      raw: true,
    });

    if (!targetCandle) {
      console.log("No target candle found. Query params:", { symbol, timeframe, date });
      res.status(404).json({
        error: 'No target candle found.',
        params: { symbol, timeframe, date },
      });
      return;
    }

    const nextCandle = await Candle.findOne({
      where: {
        symbol_id: symbolRecord.id,
        timeframe_id: timeframeRecord.id,
        datetime: { [Op.gt]: targetCandle.datetime },
      },
      order: [['datetime', 'ASC']],
      raw: true,
    });

    if (!nextCandle) {
      console.log("No next candle found after target candle. Query params:", { symbol, timeframe, date });
      res.status(404).json({
        error: 'No next candle found.',
        params: { symbol, timeframe, date },
      });
      return;
    }

    res.status(200).json(nextCandle);
  } catch (error) {
    console.error('Error fetching next candle:', error);
    res.status(500).json({
      error: 'Failed to fetch next candle.',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};

export const getCandlesUpToDate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { collectionName, timeframeName, date } = req.params;

    if (!collectionName || !timeframeName || !date) {
      res.status(400).json({ error: 'Collection name, timeframe, and date are required parameters.' });
      return;
    }

    const targetDate = new Date(date);

    if (isNaN(targetDate.getTime())) {
      res.status(400).json({ error: 'Invalid date format. Expected format: YYYY-MM-DDTHH:mm:ss.sssZ' });
      return;
    }

    const symbolRecord = await Symbol.findOne({ where: { name: collectionName } });
    const timeframeRecord = await Timeframe.findOne({ where: { name: timeframeName } });

    if (!symbolRecord || !timeframeRecord) {
      res.status(404).json({ error: 'Invalid collection name or timeframe.' });
      return;
    }

    const candles = await Candle.findAll({
      where: {
        symbol_id: symbolRecord.id,
        timeframe_id: timeframeRecord.id,
        datetime: { [Op.lte]: targetDate },
      },
      order: [['datetime', 'DESC']],
      limit: 300,
      raw: true,
    });

    if (!candles || candles.length === 0) {
      res.status(404).json({ error: 'No candles found for the specified parameters.' });
      return;
    }

    res.status(200).json(candles.reverse());
  } catch (error) {
    console.error('Error fetching candles up to the date:', error);
    res.status(500).json({
      error: 'Failed to fetch candles due to server error.',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};