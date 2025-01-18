import dotenv from "dotenv";
dotenv.config(); 
console.log("Current directory:", process.cwd());  // Check current directory
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { connectDb } from "./db"; 


interface CandleData {
  time: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  spreads?: number;
}

// // ----------------       verify ticker before run!     ----------------
// const pathJson = path.resolve(__dirname, "../data/EURUSD_M30.json");

// export const loadJsonToDb = async (filePath: string): Promise<void> => {
//   try {
//     //explicitly connect to the database
//     await connectDb();
//     console.log('Mongoose Connection State:', mongoose.connection.readyState);

//     //tload and parse the json file
//     const rawData = fs.readFileSync(filePath, "utf-8");
//     const jsonData = JSON.parse(rawData);

//     const { symbol, period, time, open, high, low, close, volume, spreads } = jsonData;

//     if (!symbol || !period || !time || !open || !high || !low || !close || !volume) {
//       throw new Error("Invalid JSON file structure.");
//     }

//     //transform the data
//     const formattedData: CandleData[] = time.map((t: number, index: number) => ({
//       time: Math.floor(new Date("2000-01-01").getTime() / 1000 + t * 60),
//       open: open[index],
//       high: high[index],
//       low: low[index],
//       close: close[index],
//       volume: volume[index],
//       spreads: spreads ? spreads[index] : undefined,
//     }));


// // ----------------       verify ticker before run!     ----------------

//     const collectionName = "EURUSD_M30";
//     const collection = mongoose.connection.collection(collectionName);

//     // insert the data with increased timeout
//     const result = await collection.insertMany(formattedData, { 
//       writeConcern: { w: 1, wtimeout: 30000 } 
//     });

//     console.log(`Successfully inserted ${result.insertedCount} records into ${collectionName}`);
//   } catch (error) {
//     console.error("Detailed Error:", error);
//     process.exit(1);
//   } finally {
//     //close the connection
//     await mongoose.connection.close();
//   }
// };

// //call the function only if this script is run directly
// if (require.main === module) {
//   loadJsonToDb(pathJson)
//     .then(() => console.log("Data loading complete"))
//     .catch(error => {
//       console.error("Data loading failed", error);
//       process.exit(1);
//     });
// }



import csvParser from 'csv-parser';

// Define the schema for the collection
const dataSchema = new mongoose.Schema({
  time: { type: Number, required: true },
  open: { type: Number, required: true },
  high: { type: Number, required: true },
  low: { type: Number, required: true },
  close: { type: Number, required: true },
  volume: { type: Number, required: true },
});

// Function to dynamically create a model for a given collection name
function getModel(collectionName: string) {
  return mongoose.model(collectionName, dataSchema, collectionName);
}

// Main function to process the CSV
async function processCSV(filePath: string) {
  // Explicitly set the ticker and timeframe
  const ticker = 'EURUSD';
  const timeFrame = '3M';
  const collectionName = `${ticker}_${timeFrame}`; // e.g., EURUSD_1M

  try {
    // Connect to the database
    await connectDb();
    console.log('Connected to MongoDB');

    // Define the schema with an index
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
            parseInt(dateParts[0]), // Year
            parseInt(dateParts[1]) - 1, // Month
            parseInt(dateParts[2]), // Day
            parseInt(timeParts[0]), // Hours
            parseInt(timeParts[1]) // Minutes
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

        // Insert the processed data into the collection
        await DataModel.insertMany(data);
        console.log(`Data inserted into ${collectionName}`);

        // Close the Mongoose connection
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
      });
  } catch (error) {
    console.error('Error:', error);
    await mongoose.disconnect();
  }
}

// Example usage
const filePath = '../data/DAT_MT_EURUSD_M1_2020.csv';
processCSV(filePath);
