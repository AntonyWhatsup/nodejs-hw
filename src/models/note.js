import mongoose from 'mongoose';
import { TAGS } from '../constants/tags.js';

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
    },
    content: {
      type: String,
      required: [true, 'Content is required'],
    },
    tag: {
      type: String,
      enum: TAGS,
      default: TAGS[0],
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
  },
  { timestamps: true }
);

// Текстовий індекс створюємо ДО створення моделі
noteSchema.index({ title: 'text', content: 'text' });

export const Note = mongoose.model('Note', noteSchema);
