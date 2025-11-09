import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import { AddressModel, UserModel } from '../models';
import { successResponse } from '../utils/response';
import { ApiError } from '../utils/api-error';

const sanitizeUser = (user: any) => {
  const { password, refreshToken, resetPasswordToken, resetPasswordExpire, verificationToken, __v, ...rest } = user.toObject();
  return rest;
};

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError({ message: 'Unauthorized', statusCode: StatusCodes.UNAUTHORIZED });
  }

  return successResponse(res, {
    message: 'Profile fetched successfully',
    data: { user: sanitizeUser(req.user) },
  });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError({ message: 'Unauthorized', statusCode: StatusCodes.UNAUTHORIZED });
  }

  const user = await UserModel.findByIdAndUpdate(
    req.user._id,
    {
      name: req.body.name,
      phone: req.body.phone,
    },
    { new: true, runValidators: true },
  );

  if (!user) {
    throw new ApiError({ message: 'User not found', statusCode: StatusCodes.NOT_FOUND });
  }

  return successResponse(res, {
    message: 'Profile updated successfully',
    data: { user: sanitizeUser(user) },
  });
});

export const changePassword = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError({ message: 'Unauthorized', statusCode: StatusCodes.UNAUTHORIZED });
  }

  const { currentPassword, newPassword } = req.body;
  const user = await UserModel.findById(req.user._id).select('+password');

  if (!user) {
    throw new ApiError({ message: 'User not found', statusCode: StatusCodes.NOT_FOUND });
  }

  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    throw new ApiError({ message: 'Current password is incorrect', statusCode: StatusCodes.UNAUTHORIZED });
  }

  user.password = newPassword;
  await user.save();

  return successResponse(res, {
    message: 'Password updated successfully',
  });
});

export const addAddress = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError({ message: 'Unauthorized', statusCode: StatusCodes.UNAUTHORIZED });
  }

  const address = await AddressModel.create({
    ...req.body,
    user: req.user._id,
  });

  return successResponse(res, {
    message: 'Address added successfully',
    statusCode: StatusCodes.CREATED,
    data: { address },
  });
});

export const updateAddress = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError({ message: 'Unauthorized', statusCode: StatusCodes.UNAUTHORIZED });
  }

  const { id } = req.params;
  const address = await AddressModel.findOneAndUpdate({ _id: id, user: req.user._id }, req.body, {
    new: true,
    runValidators: true,
  });

  if (!address) {
    throw new ApiError({ message: 'Address not found', statusCode: StatusCodes.NOT_FOUND });
  }

  return successResponse(res, {
    message: 'Address updated successfully',
    data: { address },
  });
});

export const deleteAddress = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError({ message: 'Unauthorized', statusCode: StatusCodes.UNAUTHORIZED });
  }

  const { id } = req.params;

  const address = await AddressModel.findOneAndDelete({ _id: id, user: req.user._id });

  if (!address) {
    throw new ApiError({ message: 'Address not found', statusCode: StatusCodes.NOT_FOUND });
  }

  return successResponse(res, {
    message: 'Address deleted successfully',
  });
});

export const setDefaultAddress = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError({ message: 'Unauthorized', statusCode: StatusCodes.UNAUTHORIZED });
  }

  const { id } = req.params;

  const address = await AddressModel.findOne({ _id: id, user: req.user._id });
  if (!address) {
    throw new ApiError({ message: 'Address not found', statusCode: StatusCodes.NOT_FOUND });
  }

  await AddressModel.updateMany({ user: req.user._id }, { isDefault: false });
  address.isDefault = true;
  await address.save();

  return successResponse(res, {
    message: 'Default address updated',
    data: { address },
  });
});

