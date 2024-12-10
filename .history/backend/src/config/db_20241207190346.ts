// import mongoose from 'mongoose';

// export const connectDb = async (): Promise<void> => {
//   if (!process.env.DB_CONNECT) {
//     throw new Error('Database connection string is not defined in environment variables.');
//   }

//   try {
//     // set mongoose options to avoid deprecation warnings
//     mongoose.set('strictQuery', true);

//     await mongoose.connect(process.env.DB_CONNECT);
//     console.log('\x1b[32mMongoDB connected successfully\x1b[0m');
//   } catch (error) {
//     console.error('\x1b[31mMongoDB connection error:\x1b[0m', error);
//     // exit process with failure
//     process.exit(1);
//   }
// };

// import mongoose from 'mongoose';

// export const connectDb = async (): Promise<void> => {
//   if (!process.env.DB_CONNECT) {
//     throw new Error('Database connection string is not defined in environment variables.');
//   }

//   try {
//     // Set mongoose options to avoid deprecation warnings
//     mongoose.set('strictQuery', true);

//     // MongoDB connection options with increased timeouts
//     const options = {
//       connectTimeoutMS: 120000,  // Increase connection timeout to 60 seconds
//       socketTimeoutMS: 120000,   // Increase socket timeout to 60 seconds
//     };

//     // Establish connection to MongoDB with the specified options
//     await mongoose.connect(process.env.DB_CONNECT, options);
//     console.log('\x1b[32mMongoDB connected successfully\x1b[0m');
//   } catch (error) {
//     console.error('\x1b[31mMongoDB connection error:\x1b[0m', error);
//     // Exit process with failure
//     process.exit(1);
//   }
// };



import mongoose from 'mongoose';

export const connectDb = async (): Promise<void> => {
  if (!process.env.DB_CONNECT) {
    throw new Error('Database connection string is not defined in environment variables.');
  }

  try {
    //set mongoose options to avoid deprecation warnings
    mongoose.set('strictQuery', true);

    //increase timeouts
    const options = {
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    };

    //establish connection to mdb with the specified options
    await mongoose.connect(process.env.DB_CONNECT, options);
    console.log('\x1b[32mMongoDB connected successfully\x1b[0m');
  } catch (error) {
    console.error('\x1b[31mMongoDB connection error:\x1b[0m', error);
    //exit process with failure
    process.exit(1);
  }
};