import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config(); // <- ОБОВ’ЯЗКОВО перед використанням process.env

const app = express();
app.use(express.json());

const { PORT = 3000, MONGODB_URI } = process.env;

console.log("MONGODB_URI:", MONGODB_URI); // 🔍 тимчасово виводимо для перевірки

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI is missing in .env file");
  process.exit(1);
}

mongoose.connect(MONGODB_URI)
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

app.get("/", (req, res) => {
  res.send("Hello from MongoDB project!");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
