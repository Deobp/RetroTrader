import dotenv from "dotenv";
dotenv.config(); 
console.log("Current directory:", process.cwd()); 
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { connectDb } from "./db"; 
import csvParser from 'csv-parser';



interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  spreads?: number;
}


const dataSchema = new mongoose.Schema({
  time: { type: Number, required: true },
  open: { type: Number, required: true },
  high: { type: Number, required: true },
  low: { type: Number, required: true },
  close: { type: Number, required: true },
  volume: { type: Number, required: true },
});

function getModel(collectionName: string) {
  return mongoose.model(collectionName, dataSchema, collectionName);
}

async function processCSV(filePath: string) {
  const ticker = 'EURUSD';
  const timeFrame = '3M';
  const collectionName = `${ticker}_${timeFrame}`;

  try {
    await connectDb();
    console.log('Connected to MongoDB');

    const schema = new mongoose.Schema({
      time: { type: Number, index: true },
      open: Number,
      high: Number,
      low: Number,
      close: Number,
      spread: Number,
    });

    const DataModel = mongoose.model(collectionName, schema);

    const data: any[] = [];

    fs.createReadStream(filePath)
      .pipe(csvParser({ headers: ['date', 'time', 'open', 'high', 'low', 'close', 'spread'] }))
      .on('data', (row) => {
        const dateParts = row.date.split('.');
        const timeParts = row.time.split(':');

        const timestamp = Math.floor(
          new Date(
            // year
            parseInt(dateParts[0]), 
            // month
            parseInt(dateParts[1]) - 1, 
            // day
            parseInt(dateParts[2]), 
            // hours
            parseInt(timeParts[0]), 
            // minutes
            parseInt(timeParts[1]) 
          ).getTime() / 1000
        );

        data.push({
          time: timestamp,
          open: parseFloat(row.open),
          high: parseFloat(row.high),
          low: parseFloat(row.low),
          close: parseFloat(row.close),
        });
      })
      .on('end', async () => {
        console.log(`Finished processing file: ${filePath}`);

        await DataModel.insertMany(data);
        console.log(`Data inserted into ${collectionName}`);

        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
      });
  } catch (error) {
    console.error('Error:', error);
    await mongoose.disconnect();
  }
}

const filePath = '../data/DAT_MT_EURUSD_M1_2020.csv';
processCSV(filePath);
