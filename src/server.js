import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import { connectMongoDB } from "./db/connectMongoDB.js";
import { logger } from "./middleware/logger.js";
import { notFoundHandler } from "./middleware/notFoundHandler.js";
import { errorHandler } from "./middleware/errorHandler.js";
import notesRouter from "./routes/notesRouter.js";

dotenv.config();

const PORT = process.env.PORT || 3030;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ Missing MONGODB_URI in .env file");
  process.exit(1);
}

const app = express();

// --- Middleware ---
app.use(cors());
app.use(express.json());
app.use(logger);

// --- Routes ---
app.use("/api/notes", notesRouter);

// --- Handlers ---
app.use(notFoundHandler);
app.use(errorHandler);

// --- Connect to DB and start server ---
const startServer = async () => {
  try {
    await connectMongoDB(MONGODB_URI);
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

startServer();
