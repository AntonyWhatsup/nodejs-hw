import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { User } from '../models/user.js';
import { sendEmail } from '../utils/sendMail.js';
import { createSession, setSessionCookies } from '../services/auth.js';
import dotenv from 'dotenv';

dotenv.config();
const { JWT_SECRET, FRONTEND_DOMAIN } = process.env;

// 🟢 Реєстрація нового користувача
export const registerUser = async (req, res, next) => {
  try {
    const { email, password, username } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw createHttpError(409, 'User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ email, password: hashedPassword, username });

    res.status(201).json({ message: 'User registered successfully', user: { email: newUser.email, username: newUser.username } });
  } catch (err) {
    next(err);
  }
};

// 🟢 Логін користувача
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) throw createHttpError(401, 'Invalid credentials');

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw createHttpError(401, 'Invalid credentials');

    const session = await createSession(user._id);
    setSessionCookies(res, session.accessToken, session.refreshToken);

    res.json({ message: 'Login successful' });
  } catch (err) {
    next(err);
  }
};

// 🟢 Вихід користувача
export const logoutUser = async (req, res, next) => {
  try {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.status(200).json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

// 🟢 Оновлення сесії
export const refreshUserSession = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) throw createHttpError(401, 'Missing refresh token');

    const payload = jwt.verify(refreshToken, JWT_SECRET);
    const session = await createSession(payload.sub);
    setSessionCookies(res, session.accessToken, session.refreshToken);

    res.json({ message: 'Session refreshed' });
  } catch (err) {
    next(err);
  }
};

// 🟢 Запит на email для скидання пароля
export const requestResetEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(200).json({ message: 'Password reset email sent successfully' });

    const token = jwt.sign({ sub: user._id.toString(), email: user.email }, JWT_SECRET, { expiresIn: '15m' });
    const resetLink = `${FRONTEND_DOMAIN.replace(/\/$/, '')}/reset-password?token=${token}`;

    await sendEmail({
      to: user.email,
      subject: 'Password reset',
      templateName: 'reset-password-email',
      templateData: { username: user.username || user.email, resetLink },
    });

    res.status(200).json({ message: 'Password reset email sent successfully' });
  } catch (err) {
    next(err);
  }
};

// 🟢 Скидання пароля
export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    const payload = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(payload.sub);
    if (!user) throw createHttpError(404, 'User not found');

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (err) {
    next(err);
  }
};
