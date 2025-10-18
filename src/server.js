import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { logger } from "./middleware/logger.js";
import { notFoundHandler } from "./middleware/notFoundHandler.js";
import { errorHandler } from "./middleware/errorHandler.js";
import notesRouter from "./routes/notesRoutes.js";
import { connectMongoDB } from "./db/connectMongoDB.js";

dotenv.config();

const app = express();

app.use(logger);
app.use(cors());
app.use(express.json());

app.use(notesRouter);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 3030;

const startServer = async () => {
  try {
    await connectMongoDB();
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

startServer();
