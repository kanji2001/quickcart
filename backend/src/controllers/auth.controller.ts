import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';
import { authService } from '../services/auth.service';
import { successResponse } from '../utils/response';
import { ApiError } from '../utils/api-error';
import { COOKIE_KEYS, refreshTokenCookieOptions } from '../constants/cookies';
import { isProduction } from '../config/env';
import type { UserDocument } from '../types/user';

const attachRefreshCookie = (res: Response, refreshToken: string) => {
  res.cookie(COOKIE_KEYS.refreshToken, refreshToken, refreshTokenCookieOptions);
};

const buildUserResponse = (user: UserDocument) => {
  const { password, refreshToken, resetPasswordToken, resetPasswordExpire, verificationToken, __v, ...rest } = user.toObject();
  return rest;
};

export const register = asyncHandler(async (req: Request, res: Response) => {
  const { user, accessToken, refreshToken } = await authService.register(req.body);
  attachRefreshCookie(res, refreshToken);

  return successResponse(res, {
    message: 'User registered successfully',
    statusCode: StatusCodes.CREATED,
    data: {
      user: buildUserResponse(user),
      accessToken,
    },
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { user, accessToken, refreshToken } = await authService.login(req.body);
  attachRefreshCookie(res, refreshToken);

  return successResponse(res, {
    message: 'Login successful',
    data: {
      user: buildUserResponse(user),
      accessToken,
    },
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError({ message: 'Unauthorized', statusCode: StatusCodes.UNAUTHORIZED });
  }

  await authService.logout(req.user.id);

  res.clearCookie(COOKIE_KEYS.refreshToken, {
    ...refreshTokenCookieOptions,
    maxAge: 0,
  });

  return successResponse(res, {
    message: 'Logged out successfully',
  });
});

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.[COOKIE_KEYS.refreshToken];

  if (!token) {
    throw new ApiError({ message: 'Refresh token missing', statusCode: StatusCodes.UNAUTHORIZED });
  }

  const { user, accessToken, refreshToken: newRefreshToken } = await authService.refreshTokens(token);

  attachRefreshCookie(res, newRefreshToken);

  return successResponse(res, {
    message: 'Token refreshed successfully',
    data: {
      user: buildUserResponse(user),
      accessToken,
    },
  });
});

export const getCurrentUser = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError({ message: 'Unauthorized', statusCode: StatusCodes.UNAUTHORIZED });
  }

  return successResponse(res, {
    message: 'User fetched successfully',
    data: {
      user: req.user,
    },
  });
});

export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
  const { user, resetToken } = await authService.forgotPassword(req.body.email);

  const resetUrl = `${req.body?.redirectUrl ?? req.headers.origin ?? ''}/reset-password/${resetToken}`;

  // TODO: Send reset password email via email service

  if (!isProduction) {
    // expose token in dev to ease testing
    return successResponse(res, {
      message: 'Password reset token generated',
      data: {
        resetToken,
        resetUrl,
        user: buildUserResponse(user),
      },
    });
  }

  return successResponse(res, {
    message: 'Password reset instructions sent to email',
  });
});

export const resetPassword = asyncHandler(async (req: Request, res: Response) => {
  await authService.resetPassword(req.params.token, req.body.password);

  return successResponse(res, {
    message: 'Password reset successfully',
  });
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  await authService.verifyEmail(req.params.token);

  return successResponse(res, {
    message: 'Email verified successfully',
  });
});

