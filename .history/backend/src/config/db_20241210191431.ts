import mongoose from 'mongoose';

export const connectDb = async (): Promise<void> => {
  if (!process.env.DB_CONNECT) {
    throw new Error('Database connection string is not defined in environment variables.');
  }

  try {
    mongoose.set('strictQuery', true);

    const options = {
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    };

    await mongoose.connect(process.env.DB_CONNECT, options);
    console.log('\x1b[32mMongoDB connected successfully\x1b[0m');
  } catch (error) {
    console.error('\x1b[31mMongoDB connection error:\x1b[0m', error);
    process.exit(1);
  }
};