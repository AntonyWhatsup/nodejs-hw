import { Session } from '../models/session.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();
const { JWT_SECRET } = process.env;

export const createSession = async (userId) => {
  const accessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });

  const accessTokenValidUntil = new Date(Date.now() + 15 * 60 * 1000);
  const refreshTokenValidUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

  const session = await Session.create({
    userId,
    accessToken,
    refreshToken,
    accessTokenValidUntil,
    refreshTokenValidUntil,
  });

  return session;
};

export const setSessionCookies = (res, session) => {
  res.cookie('sessionId', session._id.toString(), { httpOnly: true, sameSite: 'strict' });
  res.cookie('accessToken', session.accessToken, { httpOnly: true, sameSite: 'strict' });
  res.cookie('refreshToken', session.refreshToken, { httpOnly: true, sameSite: 'strict' });
};

export const deleteSession = async (userId, sessionId) => {
  if (sessionId) {
    await Session.findByIdAndDelete(sessionId);
  } else if (userId) {
    await Session.deleteMany({ userId });
  }
};
