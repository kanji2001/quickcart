import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';
import { CouponModel, OrderModel } from '../models';
import { successResponse } from '../utils/response';
import { ApiError } from '../utils/api-error';

export const validateCoupon = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError({ message: 'Unauthorized', statusCode: StatusCodes.UNAUTHORIZED });
  }

  const { code, cartTotal } = req.body;

  const coupon = await CouponModel.findOne({
    code: code.toUpperCase(),
    isActive: true,
    validFrom: { $lte: new Date() },
    validUntil: { $gte: new Date() },
  });

  if (!coupon) {
    throw new ApiError({ message: 'Coupon is not valid', statusCode: StatusCodes.BAD_REQUEST });
  }

  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    throw new ApiError({ message: 'Coupon usage limit reached', statusCode: StatusCodes.BAD_REQUEST });
  }

  if (coupon.minPurchaseAmount && cartTotal < coupon.minPurchaseAmount) {
    throw new ApiError({ message: `Minimum purchase amount is ${coupon.minPurchaseAmount}`, statusCode: StatusCodes.BAD_REQUEST });
  }

  if (coupon.userUsageLimit) {
    const userUsageCount = await OrderModel.countDocuments({
      user: req.user._id,
      couponCode: coupon.code,
    });
    if (userUsageCount >= coupon.userUsageLimit) {
      throw new ApiError({ message: 'You have already used this coupon', statusCode: StatusCodes.BAD_REQUEST });
    }
  }

  let discountAmount = 0;
  if (coupon.discountType === 'percentage') {
    discountAmount = (cartTotal * coupon.discountValue) / 100;
    if (coupon.maxDiscountAmount) {
      discountAmount = Math.min(discountAmount, coupon.maxDiscountAmount);
    }
  } else {
    discountAmount = coupon.discountValue;
  }

  return successResponse(res, {
    message: 'Coupon is valid',
    data: {
      coupon,
      discountAmount,
    },
  });
});

export const getCoupons = asyncHandler(async (_req: Request, res: Response) => {
  const coupons = await CouponModel.find().sort({ createdAt: -1 });

  return successResponse(res, {
    message: 'Coupons fetched successfully',
    data: { items: coupons },
  });
});

export const createCoupon = asyncHandler(async (req: Request, res: Response) => {
  const coupon = await CouponModel.create({
    ...req.body,
    code: req.body.code.toUpperCase(),
  });

  return successResponse(res, {
    message: 'Coupon created successfully',
    statusCode: StatusCodes.CREATED,
    data: { coupon },
  });
});

export const updateCoupon = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const coupon = await CouponModel.findByIdAndUpdate(
    id,
    { ...req.body, code: req.body.code?.toUpperCase() },
    { new: true, runValidators: true },
  );

  if (!coupon) {
    throw new ApiError({ message: 'Coupon not found', statusCode: StatusCodes.NOT_FOUND });
  }

  return successResponse(res, {
    message: 'Coupon updated successfully',
    data: { coupon },
  });
});

export const deleteCoupon = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const coupon = await CouponModel.findByIdAndDelete(id);

  if (!coupon) {
    throw new ApiError({ message: 'Coupon not found', statusCode: StatusCodes.NOT_FOUND });
  }

  return successResponse(res, {
    message: 'Coupon deleted successfully',
  });
});

