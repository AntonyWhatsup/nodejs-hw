export const setSessionCookies = (res, session) => {
  res.cookie('sessionId', session._id.toString(), {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 днів
  });

  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const clearSessionCookies = (res) => {
  res.clearCookie('sessionId');
  res.clearCookie('refreshToken');
};
