import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import dotenv from "dotenv";
import { connectDb } from "./db"; 

dotenv.config({ path: './src/config/.env' });

interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  spreads?: number;
}

// ----------------       verify ticker before run!     ----------------
const pathJson = path.resolve(__dirname, "../data/EURUSD_M30.json");

export const loadJsonToDb = async (filePath: string): Promise<void> => {
  try {
    //explicitly connect to the database
    await connectDb();
    console.log('Mongoose Connection State:', mongoose.connection.readyState);

    //tload and parse the json file
    const rawData = fs.readFileSync(filePath, "utf-8");
    const jsonData = JSON.parse(rawData);

    const { symbol, period, time, open, high, low, close, volume, spreads } = jsonData;

    if (!symbol || !period || !time || !open || !high || !low || !close || !volume) {
      throw new Error("Invalid JSON file structure.");
    }

    //transform the data
    const formattedData: CandleData[] = time.map((t: number, index: number) => ({
      time: Math.floor(new Date("2000-01-01").getTime() / 1000 + t * 60),
      open: open[index],
      high: high[index],
      low: low[index],
      close: close[index],
      volume: volume[index],
      spreads: spreads ? spreads[index] : undefined,
    }));


// ----------------       verify ticker before run!     ----------------

    const collectionName = "EURUSD_M30";
    const collection = mongoose.connection.collection(collectionName);

    // insert the data with increased timeout
    const result = await collection.insertMany(formattedData, { 
      writeConcern: { w: 1, wtimeout: 30000 } 
    });

    console.log(`Successfully inserted ${result.insertedCount} records into ${collectionName}`);
  } catch (error) {
    console.error("Detailed Error:", error);
    process.exit(1);
  } finally {
    //close the connection
    await mongoose.connection.close();
  }
};

//call the function only if this script is run directly
if (require.main === module) {
  loadJsonToDb(pathJson)
    .then(() => console.log("Data loading complete"))
    .catch(error => {
      console.error("Data loading failed", error);
      process.exit(1);
    });
}