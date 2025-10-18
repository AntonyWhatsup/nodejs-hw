export const getAllNotes = async (req, res, next) => {
  try {
    const { page = 1, perPage = 10, tag, search } = req.query;
    const skip = (page - 1) * perPage;

    const filter = {};
    if (tag) filter.tag = tag;
    if (search) {
      filter.$text = { $search: search };
    }

    const totalNotes = await Note.countDocuments(filter);
    const notes = await Note.find(filter)
      .skip(skip)
      .limit(perPage)
      .sort({ createdAt: -1 });

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
