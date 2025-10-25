import createHttpError from 'http-errors';
import { Note } from '../models/note.js';

export const getAllNotes = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page ?? '1', 10);
    const perPage = parseInt(req.query.perPage ?? '10', 10);
    const tag = req.query.tag;
    const search = req.query.search ?? '';

    const skip = (page - 1) * perPage;

    const filter = {};
    if (tag) filter.tag = tag;
    if (search) filter.$text = { $search: search };

    const [notes, totalNotes] = await Promise.all([
      Note.find(filter).skip(skip).limit(perPage).sort({ createdAt: -1 }),
      Note.countDocuments(filter),
    ]);

    const totalPages = Math.ceil(totalNotes / perPage);

    res.status(200).json({
      page,
      perPage,
      totalNotes,
      totalPages,
      notes,
    });
  } catch (error) {
    next(error);
  }
};

export const getNoteById = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const note = await Note.findById(noteId);
    if (!note) throw createHttpError(404, 'Note not found');
    res.status(200).json(note);
  } catch (error) {
    next(error);
  }
};

export const createNote = async (req, res, next) => {
  try {
    const created = await Note.create(req.body);
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
};

export const updateNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const updated = await Note.findByIdAndUpdate(noteId, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) throw createHttpError(404, 'Note not found');
    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

export const deleteNote = async (req, res, next) => {
  try {
    const { noteId } = req.params;
    const deleted = await Note.findByIdAndDelete(noteId);
    if (!deleted) throw createHttpError(404, 'Note not found');
    res.status(200).json(deleted);
  } catch (error) {
    next(error);
  }
};
