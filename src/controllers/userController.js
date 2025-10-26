import createHttpError from 'http-errors';
import { saveFileToCloudinary } from '../utils/saveFileToCloudinary.js';
import { User } from '../models/user.js';

export const updateUserAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(createHttpError(400, 'No file'));
    }

    const result = await saveFileToCloudinary(req.file.buffer);
    const secureUrl = result.secure_url;

    const userId = req.user._id;
    const updated = await User.findByIdAndUpdate(userId, { avatar: secureUrl }, { new: true });
    res.status(200).json({ url: secureUrl });
  } catch (err) {
    next(err);
  }
};
