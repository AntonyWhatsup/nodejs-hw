import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config(); // обов’язково на початку

export const connectMongoDB = async () => {
  try {
    const mongoUrl = process.env.MONGODB_URI; // <-- правильно
    if (!mongoUrl) {
      throw new Error('MONGODB_URI not defined in environment variables');
    }
    await mongoose.connect(mongoUrl);
    console.log('✅ MongoDB connection established successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};
