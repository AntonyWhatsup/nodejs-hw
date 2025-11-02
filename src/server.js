import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errors } from 'celebrate';


import { logger } from './middleware/logger.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';


import notesRouter from './routes/notesRoutes.js';
import authRouter from './routes/authRoutes.js';


import { connectMongoDB } from './db/connectMongoDB.js';

dotenv.config();

const app = express();


app.use(logger); 
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());


app.use(notesRouter);
app.use(authRouter);


app.use(notFoundHandler);


app.use(errors());


app.use(errorHandler);

const PORT = process.env.PORT || 3030;


await connectMongoDB();

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
