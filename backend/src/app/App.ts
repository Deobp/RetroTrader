import dotenv from 'dotenv';
dotenv.config({ path: './src/config/.env' });
import express, { Application, Request, Response, NextFunction } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from '../middleware/error-handler';
import userRoutes from '../routes/user-routes';
import candleRoutes from '../routes/candles-routes';
import { connectDb } from '../config/db';
import tradeStatsRoutes from "../routes/tradeStats-routes";

const bootstrap = async (): Promise<void> => {
  const app: Application = express();
  const PORT: number = parseInt(process.env.PORT || '5173', 10);

  try {
    // connect to the db
    await connectDb();
    console.log('\x1b[32mDatabase connection established successfully.\x1b[0m');

    // middleware
    app.use(express.json());
    app.use(cookieParser());

    app.use(cors({ origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173', credentials: true }));
    app.use(helmet());

    app.get('/', (_req: Request, res: Response) => {
      res.status(200).send('API is running!');
    });

    // routes
    app.use('/api/users', userRoutes);
    app.use("/api", candleRoutes);
    app.use("/api", tradeStatsRoutes);

    // global error handler
    app.use(errorHandler);

    app.listen(PORT, () => {
      console.log(`\x1b[34mServer running on port ${PORT}\x1b[0m`);
    });
  } catch (error) {
    console.error('\x1b[31mFailed to start server:\x1b[0m', error);
    process.exit(1); 
  }
};

// start app
bootstrap().catch((error) => {
  console.error('\x1b[31mUnhandled error during bootstrap:\x1b[0m', error);
  process.exit(1);
});
