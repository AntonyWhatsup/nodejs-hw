import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import notesRouter from './routes/notesRoutes.js';
import { errors } from 'celebrate';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', notesRouter);

// обробник неіснуючих маршрутів
app.use((req, res) => {
  res.status(404).json({ message: 'Not found' });
});

// middleware errors з celebrate (має бути перед обробником помилок)
app.use(errors());

// обробник помилок
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({
    message: err.message || 'Server error',
  });
});

const { MONGO_URL, PORT = 3000 } = process.env;

mongoose
  .connect(MONGO_URL)
  .then(() => {
    console.log('Database connection successful');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(error => {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  });
