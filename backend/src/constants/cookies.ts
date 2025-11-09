import { CookieOptions } from 'express';
import { isProduction } from '../config/env';

export const COOKIE_KEYS = {
  refreshToken: 'quickcart_refresh',
} as const;

const sevenDaysInMs = 7 * 24 * 60 * 60 * 1000;

export const refreshTokenCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'none' : 'strict',
  maxAge: sevenDaysInMs,
  path: '/',
};

