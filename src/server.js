import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import { errors } from 'celebrate';

import { logger } from './middleware/logger.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';
import { connectMongoDB } from './db/connectMongoDB.js';

import notesRouter from './routes/notesRoutes.js';
import authRouter from './routes/authRoutes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(logger);

app.use('/notes', notesRouter);
app.use('/auth', authRouter);

app.use(notFoundHandler);
app.use(errors());
app.use(errorHandler);

const PORT = process.env.PORT || 3030;

const startServer = async () => {
  try {
    await connectMongoDB();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

startServer();
