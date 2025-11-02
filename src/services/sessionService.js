import { Session } from '../models/session.js';
import { randomUUID } from 'crypto';

/**
 * Створює нову сесію користувача
 */
export const createSession = async (userId) => {
  const accessToken = randomUUID();
  const refreshToken = randomUUID();

  const session = await Session.create({
    userId,
    accessToken,
    refreshToken,
    createdAt: new Date(),
  });

  return session;
};
