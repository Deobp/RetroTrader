import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import { connectDb } from "./db";

async function renameCollection(oldName: string, newName: string) {
  try {
    await connectDb();

    const db = mongoose.connection.db;

    if (!db) {
      throw new Error("Database connection is not established.");
    }

    const collections = await db.listCollections({ name: oldName }).toArray();
    if (collections.length === 0) {
      console.error(`Collection "${oldName}" does not exist.`);
      return;
    }

    await db.collection(oldName).rename(newName);
    console.log(`Collection renamed from "${oldName}" to "${newName}".`);
  } catch (error) {
    console.error("Error renaming collection:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

async function main() {
  const oldCollectionName = "eurusd_w";
  const newCollectionName = "EURUSD_W";

  await renameCollection(oldCollectionName, newCollectionName);
}

main();
