import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { connectMongoDB } from './db/connectMongoDB.js';
import { logger } from './middleware/logger.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';
import { errors } from 'celebrate';
import authRouter from './routes/authRoutes.js';
import userRouter from './routes/userRoutes.js';
import notesRouter from './routes/notesRoutes.js';

dotenv.config();

const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(logger);

// --- Routes ---
app.use(authRouter);
app.use(userRouter);
app.use(notesRouter);

// --- Error handlers ---
app.use(notFoundHandler);
app.use(errors());
app.use(errorHandler);

// --- Start server ---
const startServer = async () => {
  try {
    await connectMongoDB();
    const PORT = process.env.PORT || 3030;
    app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
  } catch (error) {
    console.error('❌ Error connecting to MongoDB:', error.message);
    process.exit(1);
  }
};

startServer();
