import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';
import { AddressModel, UserModel } from '../models';
import { successResponse } from '../utils/response';
import { ApiError } from '../utils/api-error';
import { uploadToCloudinary, deleteFromCloudinary } from '../services/cloudinary.service';

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

export const getAddresses = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError({ message: 'Unauthorized', statusCode: StatusCodes.UNAUTHORIZED });
  }

  const addresses = await AddressModel.find({ user: req.user._id }).sort({ isDefault: -1, updatedAt: -1, createdAt: -1 });

  return successResponse(res, {
    message: 'Addresses fetched successfully',
    data: { addresses },
  });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError({ message: 'Unauthorized', statusCode: StatusCodes.UNAUTHORIZED });
  }

  const user = await UserModel.findById(req.user._id);

  if (!user) {
    throw new ApiError({ message: 'User not found', statusCode: StatusCodes.NOT_FOUND });
  }

  const { name, phone, removeAvatar } = req.body as { name?: string; phone?: string; removeAvatar?: boolean };

  if (name !== undefined) {
    user.name = name;
  }

  if (phone !== undefined) {
    user.phone = phone;
  }

  const shouldRemoveAvatar = Boolean(removeAvatar) && !req.file;

  if (req.file) {
    const uploadResult = await uploadToCloudinary(req.file.buffer, 'quickcart/user-avatars', {
      transformation: [{ width: 400, height: 400, crop: 'fill', gravity: 'face' }],
    });

    if (user.avatar?.publicId) {
      await deleteFromCloudinary(user.avatar.publicId);
    }

    user.avatar = {
      publicId: uploadResult.public_id,
      url: uploadResult.secure_url,
    };
  } else if (shouldRemoveAvatar && user.avatar?.publicId) {
    await deleteFromCloudinary(user.avatar.publicId);
    delete user.avatar;
  }

  await user.save();
  req.user = user;

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

  const existingAddresses = await AddressModel.find({ user: req.user._id });

  const address = await AddressModel.create({
    ...req.body,
    user: req.user._id,
    isDefault: req.body.isDefault ?? existingAddresses.length === 0,
  });

  if (address.isDefault) {
    await AddressModel.updateMany({ user: req.user._id, _id: { $ne: address._id } }, { $set: { isDefault: false } });
  }

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
  const address = await AddressModel.findOne({ _id: id, user: req.user._id });

  if (!address) {
    throw new ApiError({ message: 'Address not found', statusCode: StatusCodes.NOT_FOUND });
  }

  address.set(req.body);
  await address.save();

  if (req.body.isDefault) {
    await AddressModel.updateMany({ user: req.user._id, _id: { $ne: id } }, { $set: { isDefault: false } });
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

