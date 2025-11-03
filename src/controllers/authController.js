import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';
import { User } from '../models/user.js';
import { Session } from '../models/session.js';
import { sendEmail } from '../utils/sendMail.js';
import { createSession, setSessionCookies, deleteSession } from '../services/auth.js';
import dotenv from 'dotenv';

dotenv.config();
const { JWT_SECRET, FRONTEND_DOMAIN, SMTP_FROM } = process.env;

export const registerUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return next(createHttpError(409, 'User already exists'));

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({ email, password: hashedPassword });

    const session = await createSession(newUser._id);
    setSessionCookies(res, session);

    res.status(201).json(newUser.toJSON());
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return next(createHttpError(401, 'Invalid credentials'));

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return next(createHttpError(401, 'Invalid credentials'));

    await deleteSession(user._id);
    const session = await createSession(user._id);
    setSessionCookies(res, session);

    res.status(200).json(user.toJSON());
  } catch (error) {
    next(error);
  }
};

export const logoutUser = async (req, res, next) => {
  try {
    const { sessionId } = req.cookies;
    if (sessionId) await deleteSession(null, sessionId);

    res.clearCookie('sessionId');
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

export const refreshUserSession = async (req, res, next) => {
  try {
    const { sessionId, refreshToken } = req.cookies;
    if (!sessionId || !refreshToken) return next(createHttpError(401, 'Missing tokens'));

    const oldSession = await Session.findById(sessionId);
    if (!oldSession) return next(createHttpError(401, 'Session not found'));
    if (oldSession.refreshToken !== refreshToken) return next(createHttpError(401, 'Invalid session token'));
    if (oldSession.refreshTokenValidUntil && new Date(oldSession.refreshTokenValidUntil) < new Date()) {
      await deleteSession(null, sessionId);
      return next(createHttpError(401, 'Session token expired'));
    }

    await deleteSession(null, sessionId);
    const newSession = await createSession(oldSession.userId);
    setSessionCookies(res, newSession);

    res.status(200).json({ message: 'Session refreshed' });
  } catch (error) {
    next(error);
  }
};

export const requestResetEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({ message: 'Password reset email sent successfully' });
    }

    const token = jwt.sign({ sub: user._id.toString(), email: user.email }, JWT_SECRET, { expiresIn: '15m' });
    const resetLink = `${FRONTEND_DOMAIN.replace(/\/$/, '')}/reset-password?token=${token}`;

    const templatePath = path.resolve('src/templates/reset-password-email.html');
    const source = fs.readFileSync(templatePath, 'utf8');
    const compiled = handlebars.compile(source);
    const html = compiled({ username: user.username || user.email, resetLink });

    try {
      await sendEmail({ to: user.email, subject: 'Password reset', html, from: SMTP_FROM });
    } catch (err) {
      return next(createHttpError(500, 'Failed to send the email, please try again later.'));
    }

    res.status(200).json({ message: 'Password reset email sent successfully' });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const { token, password } = req.body;
    let payload;
    try {
      payload = jwt.verify(token, JWT_SECRET);
    } catch {
      return next(createHttpError(401, 'Invalid or expired token'));
    }

    const { sub: userId, email } = payload;
    const user = await User.findOne({ _id: userId, email });
    if (!user) return next(createHttpError(404, 'User not found'));

    user.password = await bcrypt.hash(password, 10);
    await user.save();

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
};
