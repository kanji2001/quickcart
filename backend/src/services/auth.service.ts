import crypto from 'node:crypto';
import { StatusCodes } from 'http-status-codes';
import { UserModel } from '../models';
import { ApiError } from '../utils/api-error';
import { tokenService } from './token.service';
import type { User } from '../types/user';
import { emailService } from './email.service';
import { envConfig, isDevelopment } from '../config/env';

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  phone: string;
};

type LoginPayload = {
  email: string;
  password: string;
};

export const authService = {
  async register(payload: RegisterPayload) {
    const existingUser = await UserModel.findOne({ email: payload.email });

    if (existingUser) {
      throw new ApiError({
        message: 'Email already registered',
        statusCode: StatusCodes.CONFLICT,
      });
    }

    const verificationToken = crypto.randomBytes(32).toString('hex');

    const user = await UserModel.create({
      ...payload,
      verificationToken,
    });

    const accessToken = tokenService.generateAccessToken({ sub: user._id.toString(), role: user.role });
    const refreshToken = tokenService.generateRefreshToken({ sub: user._id.toString(), role: user.role });

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    const verifyUrl = `${envConfig.clientUrl}/verify-email/${verificationToken}`;
    await emailService.sendEmail({
      to: user.email,
      subject: 'Verify your QuickCart account',
      html: `<p>Hello ${user.name},</p><p>Thanks for registering with QuickCart. Please verify your email by clicking the link below:</p><p><a href="${verifyUrl}">${verifyUrl}</a></p>`,
    });

    return { user, accessToken, refreshToken };
  },

  async login(payload: LoginPayload) {
    const user = await UserModel.findOne({ email: payload.email });
    if (!user) {
      throw new ApiError({ message: 'User not found', statusCode: StatusCodes.NOT_FOUND });
    }

    if (user.isBlocked) {
      throw new ApiError({ message: 'Account is blocked. Contact support.', statusCode: StatusCodes.FORBIDDEN });
    }

    const isPasswordMatch = await user.comparePassword(payload.password);
    if (!isPasswordMatch) {
      throw new ApiError({ message: 'Invalid credentials', statusCode: StatusCodes.UNAUTHORIZED });
    }

    const accessToken = tokenService.generateAccessToken({ sub: user._id.toString(), role: user.role });
    const refreshToken = tokenService.generateRefreshToken({ sub: user._id.toString(), role: user.role });

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { user, accessToken, refreshToken };
  },

  async logout(userId: string) {
    await UserModel.findByIdAndUpdate(userId, { $unset: { refreshToken: 1 } });
  },

  async refreshTokens(refreshToken: string) {
    const payload = tokenService.verifyRefreshToken(refreshToken);

    const user = await UserModel.findById(payload.sub);
    if (!user || !user.refreshToken || user.refreshToken !== refreshToken) {
      throw new ApiError({ message: 'Invalid refresh token', statusCode: StatusCodes.UNAUTHORIZED });
    }

    const accessToken = tokenService.generateAccessToken({ sub: user._id.toString(), role: user.role });
    const newRefreshToken = tokenService.generateRefreshToken({ sub: user._id.toString(), role: user.role });

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    return { user, accessToken, refreshToken: newRefreshToken };
  },

  async forgotPassword(email: string) {
    const user = await UserModel.findOne({ email });
    if (!user) {
      throw new ApiError({ message: 'User not found', statusCode: StatusCodes.NOT_FOUND });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = new Date(Date.now() + 60 * 60 * 1000);
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${envConfig.clientUrl}/reset-password/${resetToken}`;
    await emailService.sendEmail({
      to: user.email,
      subject: 'Reset your QuickCart password',
      html: `<p>Hello ${user.name},</p><p>You requested to reset your password. Click the link below to proceed:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you did not request this, ignore this email.</p>`,
    });

    return { user, resetToken };
  },

  async resetPassword(token: string, newPassword: string) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await UserModel.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: new Date() },
    });

    if (!user) {
      throw new ApiError({ message: 'Invalid or expired reset token', statusCode: StatusCodes.BAD_REQUEST });
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    return user;
  },

  async verifyEmail(token: string) {
    const user = await UserModel.findOne({ verificationToken: token });
    if (!user) {
      throw new ApiError({ message: 'Invalid verification token', statusCode: StatusCodes.BAD_REQUEST });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save({ validateBeforeSave: false });

    return user;
  },

  sanitizeUser(user: User) {
    const plainUser = user as unknown as Record<string, unknown>;
    const { password, refreshToken, resetPasswordToken, resetPasswordExpire, verificationToken, ...rest } = plainUser;
    return rest;
  },
};

