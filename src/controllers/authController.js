import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';
import { User } from '../models/user.js';
import { sendEmail } from '../utils/sendMail.js';
import { createSession, setSessionCookies, deleteSession } from '../services/auth.js';

dotenv.config();

const { JWT_SECRET, FRONTEND_DOMAIN } = process.env;

export const registerUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) throw createHttpError(409, 'User already exists');
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
    if (!user) throw createHttpError(401, 'Invalid credentials');
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) throw createHttpError(401, 'Invalid credentials');
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
    if (!sessionId || !refreshToken) throw createHttpError(401, 'Missing tokens');
    const oldSession = await createSession.validateAndReplace(sessionId, refreshToken);
    const newSession = await createSession(oldSession.userId);
    setSessionCookies(res, newSession);
    res.status(200).json({ message: 'Session refreshed successfully' });
  } catch (error) {
    next(error);
  }
};

export const requestResetEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(200).json({ message: 'If user exists, email sent' });
    const token = jwt.sign({ sub: user._id.toString(), email: user.email }, JWT_SECRET, { expiresIn: '15m' });
    const resetLink = `${FRONTEND_DOMAIN.replace(/\/$/, '')}/reset-password?token=${token}`;
    const templatePath = path.resolve('src/templates/reset-password-email.html');
    const source = fs.readFileSync(templatePath, 'utf8');
    const compiled = handlebars.compile(source);
    const html = compiled({ username: user.email, resetLink });
    await sendEmail({ to: user.email, subject: 'Password reset', html, from: process.env.SMTP_FROM });
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
      throw createHttpError(401, 'Invalid or expired token');
    }
    const { sub: userId, email } = payload;
    const user = await User.findOne({ _id: userId, email });
    if (!user) throw createHttpError(404, 'User not found');
    user.password = await bcrypt.hash(password, 10);
    await user.save();
    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
};
