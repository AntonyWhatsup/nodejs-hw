import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { errors } from "celebrate";

import { logger } from "./middleware/logger.js";
import { notFoundHandler } from "./middleware/notFoundHandler.js";
import { errorHandler } from "./middleware/errorHandler.js";
import connectMongoDB from "./db/connectMongoDB.js";
import notesRouter from "./routes/notesRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use(logger);

app.use(notesRouter);

app.use(notFoundHandler);
app.use(errors());
app.use(errorHandler);

const PORT = process.env.PORT || 3030;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI is not defined in .env");
  process.exit(1);
}

await connectMongoDB(MONGODB_URI);

app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
