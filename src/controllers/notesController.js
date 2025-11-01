import Note from '../models/note.js';

// Отримати всі нотатки з пагінацією, тегами та пошуком
export const getAllNotes = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, tag, search } = req.query;
    const skip = (page - 1) * limit;

    let query = Note.find();

    if (tag) {
      query = query.where('tag').equals(tag); // у моделі поле tag, не tags
    }

    if (search) {
      query = query.find({ $text: { $search: search } });
    }

    const [notes, total] = await Promise.all([
      query.skip(skip).limit(parseInt(limit)),
      Note.countDocuments(query.getQuery()),
    ]);

    res.status(200).json({
      total,
      page: Number(page),
      limit: Number(limit),
      notes,
    });
  } catch (error) {
    next(error);
  }
};

// Створити нову нотатку
export const createNote = async (req, res, next) => {
  try {
    const { title, content, tag } = req.body;
    const note = await Note.create({ title, content, tag });
    res.status(201).json(note);
  } catch (error) {
    next(error);
  }
};

// Отримати нотатку за ID
export const getNoteById = async (req, res, next) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.status(200).json(note);
  } catch (error) {
    next(error);
  }
};

// Оновити нотатку за ID
export const updateNote = async (req, res, next) => {
  try {
    const note = await Note.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.status(200).json(note);
  } catch (error) {
    next(error);
  }
};

// Видалити нотатку за ID
export const deleteNote = async (req, res, next) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.id);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.status(200).json({ message: 'Note deleted' });
  } catch (error) {
    next(error);
  }
};
