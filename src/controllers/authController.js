import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';
import { User } from '../models/user.js';
import { Session } from '../models/session.js';
import { createSession } from '../services/sessionService.js';
import { setSessionCookies, clearSessionCookies } from '../utils/cookies.js';
import { sendEmail } from '../utils/sendMail.js';
import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';

const { JWT_SECRET, SMTP_FROM } = process.env;

/**
 * 🔐 Реєстрація нового користувача
 */
export const registerUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) throw createHttpError(409, 'Email already in use');

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ email, password: hashedPassword });

    // ✅ створити сесію та встановити куки
    const session = await createSession(user._id);
    setSessionCookies(res, session);

    res.status(201).json({
      user: { id: user._id, email: user.email },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 🔑 Вхід користувача
 */
export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) throw createHttpError(401, 'Invalid email or password');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw createHttpError(401, 'Invalid email or password');

    // 🧹 видалити попередні сесії користувача
    await Session.deleteMany({ userId: user._id });

    // ✅ створити нову сесію
    const session = await createSession(user._id);
    setSessionCookies(res, session);

    res.json({
      user: { id: user._id, email: user.email },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 🚪 Вихід користувача
 */
export const logoutUser = async (req, res, next) => {
  try {
    const { sessionId } = req.cookies;

    if (sessionId) {
      await Session.findByIdAndDelete(sessionId);
    }

    // 🧹 очистити куки
    clearSessionCookies(res);

    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

/**
 * 🔄 Оновлення сесії
 */
export const refreshUserSession = async (req, res, next) => {
  try {
    const { sessionId, refreshToken } = req.cookies;
    if (!sessionId || !refreshToken) throw createHttpError(401, 'Not authorized');

    const oldSession = await Session.findById(sessionId);
    if (!oldSession || oldSession.refreshToken !== refreshToken) {
      throw createHttpError(401, 'Invalid session');
    }

    // ❌ видалити стару сесію
    await Session.findByIdAndDelete(sessionId);

    // ✅ створити нову
    const newSession = await createSession(oldSession.userId);
    setSessionCookies(res, newSession);

    res.status(200).json({ message: 'Session refreshed' });
  } catch (error) {
    next(error);
  }
};

/**
 * ✉️ Надсилання листа для скидання паролю
 */
export const requestResetEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // 🔒 захист від user enumeration
    if (!user) return res.status(200).json({ message: 'If user exists, email sent' });

    const token = jwt.sign({ id: user._id, email: user.email }, JWT_SECRET, { expiresIn: '15m' });

    // 📨 підготовка шаблону
    const templatePath = path.resolve('src/templates/resetPassword.html');
    const source = fs.readFileSync(templatePath, 'utf8');
    const compiled = handlebars.compile(source);
    const html = compiled({ resetLink: `${process.env.FRONTEND_URL}/reset-password?token=${token}` });

    await sendEmail({
      to: user.email,
      subject: 'Password Reset',
      html,
      from: SMTP_FROM,
    });

    res.status(200).json({ message: 'If user exists, email sent' });
  } catch (error) {
    next(error);
  }
};

/**
 * 🔁 Скидання паролю
 */
export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;

    const payload = jwt.verify(token, JWT_SECRET);
    const user = await User.findOne({ _id: payload.id, email: payload.email });
    if (!user) throw createHttpError(400, 'Invalid or expired token');

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    next(error);
  }
};
