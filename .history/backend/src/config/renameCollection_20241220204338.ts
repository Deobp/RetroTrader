import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import { connectDb } from "./db";

// Function to rename a collection
async function renameCollection(oldName: string, newName: string) {
  try {
    // Connect to the database
    await connectDb();

    // Get a reference to the MongoDB native driver
    const db = mongoose.connection.db;

    // Check if `db` is defined
    if (!db) {
      throw new Error("Database connection is not established.");
    }

    // Check if the source collection exists
    const collections = await db.listCollections({ name: oldName }).toArray();
    if (collections.length === 0) {
      console.error(`Collection "${oldName}" does not exist.`);
      return;
    }

    // Rename the collection
    await db.collection(oldName).rename(newName);
    console.log(`Collection renamed from "${oldName}" to "${newName}".`);
  } catch (error) {
    console.error("Error renaming collection:", error);
  } finally {
    // Disconnect from the database
    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  }
}

// Example usage
async function main() {
  const oldCollectionName = "eurusd_w";
  const newCollectionName = "EURUSD_W";

  await renameCollection(oldCollectionName, newCollectionName);
}

main();
