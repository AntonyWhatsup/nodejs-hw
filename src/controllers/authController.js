import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import { User } from '../models/user.js';
import { sendEmail } from '../utils/sendMail.js';
import { createSession, setSessionCookies } from '../services/auth.js';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';

dotenv.config();
const { JWT_SECRET, FRONTEND_DOMAIN } = process.env;

export const requestResetEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // якщо немає користувача — все одно відповідаємо 200 (щоб не зливати перелік емейлів)
    if (!user) {
      return res.status(200).json({ message: 'Password reset email sent successfully' });
    }

    const token = jwt.sign({ sub: user._id.toString(), email: user.email }, JWT_SECRET, { expiresIn: '15m' });

    const resetLink = `${FRONTEND_DOMAIN.replace(/\/$/, '')}/reset-password?token=${token}`;

    try {
      await sendEmail({
        to: user.email,
        subject: 'Password reset',
        templateName: 'reset-password-email',
        templateData: { username: user.username || user.email, resetLink }
      });
    } catch (err) {
      return next(createHttpError(500, 'Failed to send the email, please try again later.'));
    }

    res.status(200).json({ message: 'Password reset email sent successfully' });
  } catch (err) {
    next(err);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return next(createHttpError(401, 'Invalid or expired token'));
    }

    const { sub: userId, email } = payload;
    const user = await User.findOne({ _id: userId, email });
    if (!user) return next(createHttpError(404, 'User not found'));

    // оновити пароль (pre('save') у моделі зробить хешування)
    user.password = password;
    await user.save();

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (err) {
    next(err);
  }
};
