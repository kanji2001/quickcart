import jwt, { JwtPayload } from 'jsonwebtoken';
import { envConfig } from '../config/env';
import { ApiError } from '../utils/api-error';
import { StatusCodes } from 'http-status-codes';

type AccessTokenPayload = {
  sub: string;
  role: string;
};

type RefreshTokenPayload = AccessTokenPayload & {
  tokenType: 'refresh';
};

export const tokenService = {
  generateAccessToken(payload: AccessTokenPayload) {
    return jwt.sign(payload, envConfig.jwt.accessSecret, {
      expiresIn: envConfig.jwt.accessExpire,
    });
  },

  generateRefreshToken(payload: AccessTokenPayload) {
    return jwt.sign(
      {
        ...payload,
        tokenType: 'refresh',
      } satisfies RefreshTokenPayload,
      envConfig.jwt.refreshSecret,
      {
        expiresIn: envConfig.jwt.refreshExpire,
      },
    );
  },

  verifyAccessToken(token: string) {
    try {
      return jwt.verify(token, envConfig.jwt.accessSecret) as JwtPayload & AccessTokenPayload;
    } catch (error) {
      throw new ApiError({
        message: 'Invalid or expired access token',
        statusCode: StatusCodes.UNAUTHORIZED,
      });
    }
  },

  verifyRefreshToken(token: string) {
    try {
      const payload = jwt.verify(token, envConfig.jwt.refreshSecret) as JwtPayload & RefreshTokenPayload;
      if (payload.tokenType !== 'refresh') {
        throw new ApiError({ message: 'Invalid refresh token', statusCode: StatusCodes.UNAUTHORIZED });
      }
      return payload;
    } catch (error) {
      throw new ApiError({
        message: 'Invalid or expired refresh token',
        statusCode: StatusCodes.UNAUTHORIZED,
      });
    }
  },
};

