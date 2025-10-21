import Note from '../models/Note.js';

export const getAllNotes = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, tag, search } = req.query;
    const skip = (page - 1) * limit;

    let query = Note.find();

    if (tag) {
      query = query.where('tags').in([tag]);
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
