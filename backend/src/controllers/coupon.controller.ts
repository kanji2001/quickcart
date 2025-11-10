import { Request, Response } from 'express';
import asyncHandler from 'express-async-handler';
import { StatusCodes } from 'http-status-codes';
import { CouponModel } from '../models';
import { successResponse } from '../utils/response';
import { ApiError } from '../utils/api-error';
import { evaluateCouponForCart, listApplicableCoupons } from '../services/coupon.service';
import type { CouponDocument } from '../types/coupon';

const serializeCoupon = (coupon: CouponDocument) => ({
  _id: coupon._id,
  code: coupon.code,
  description: coupon.description ?? '',
  discountType: coupon.discountType,
  discountValue: coupon.discountValue,
  minCartValue: coupon.minCartValue ?? 0,
  maxDiscount: coupon.maxDiscount,
  startDate: coupon.startDate,
  expiryDate: coupon.expiryDate,
  isActive: coupon.isActive,
  usageLimit: coupon.usageLimit,
  usageCount: coupon.usageCount,
  perUserLimit: coupon.perUserLimit ?? coupon.userUsageLimit,
  applicableCategories: coupon.applicableCategories ?? [],
  applicableProducts: coupon.applicableProducts ?? [],
  createdAt: coupon.createdAt,
  updatedAt: coupon.updatedAt,
});

export const validateCoupon = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError({ message: 'Unauthorized', statusCode: StatusCodes.UNAUTHORIZED });
  }

  const { code, cartTotal } = req.body;

  const evaluation = await evaluateCouponForCart({
    code,
    cartTotal,
    userId: req.user._id,
  });

  const payableAmount = Math.max(0, cartTotal - evaluation.discountAmount);

  return successResponse(res, {
    message: 'Coupon is valid',
    data: {
      coupon: serializeCoupon(evaluation.coupon),
      discountAmount: evaluation.discountAmount,
      payableAmount,
    },
  });
});

export const getCoupons = asyncHandler(async (req: Request, res: Response) => {
  const now = new Date();
  const { search, status, sortBy, sortOrder, discountType } = req.query;

  const filters: Record<string, unknown> = {};

  if (search && typeof search === 'string' && search.trim()) {
    filters.$or = [
      { code: { $regex: search.trim(), $options: 'i' } },
      { description: { $regex: search.trim(), $options: 'i' } },
    ];
  }

  if (discountType && typeof discountType === 'string') {
    filters.discountType = discountType;
  }

  if (status && typeof status === 'string') {
    switch (status) {
      case 'active':
        filters.isActive = true;
        filters.startDate = { $lte: now };
        filters.expiryDate = { $gte: now };
        break;
      case 'inactive':
        filters.isActive = false;
        break;
      case 'upcoming':
        filters.startDate = { $gt: now };
        break;
      case 'expired':
        filters.expiryDate = { $lt: now };
        break;
      default:
        break;
    }
  }

  const sortField = typeof sortBy === 'string' && sortBy.length > 0 ? sortBy : 'createdAt';
  const sortDirection = sortOrder === 'asc' ? 1 : -1;

  const coupons = await CouponModel.find(filters).sort({ [sortField]: sortDirection, createdAt: -1 });

  return successResponse(res, {
    message: 'Coupons fetched successfully',
    data: { items: coupons.map(serializeCoupon) },
  });
});

export const createCoupon = asyncHandler(async (req: Request, res: Response) => {
  const payload = {
    ...req.body,
    discountType: req.body.discountType === 'fixed' ? 'flat' : req.body.discountType,
  };

  const coupon = await CouponModel.create({
    ...payload,
    code: payload.code.toUpperCase(),
  });

  return successResponse(res, {
    message: 'Coupon created successfully',
    statusCode: StatusCodes.CREATED,
    data: { coupon: serializeCoupon(coupon) },
  });
});

export const updateCoupon = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;

  const payload = {
    ...req.body,
    discountType: req.body.discountType === 'fixed' ? 'flat' : req.body.discountType,
  };

  const coupon = await CouponModel.findByIdAndUpdate(
    id,
    { ...payload, code: payload.code?.toUpperCase() },
    { new: true, runValidators: true },
  );

  if (!coupon) {
    throw new ApiError({ message: 'Coupon not found', statusCode: StatusCodes.NOT_FOUND });
  }

  return successResponse(res, {
    message: 'Coupon updated successfully',
    data: { coupon: serializeCoupon(coupon) },
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

export const toggleCouponStatus = asyncHandler(async (req: Request, res: Response) => {
  const { id } = req.params;
  const desiredStatus = req.body?.isActive;

  const coupon = await CouponModel.findById(id);
  if (!coupon) {
    throw new ApiError({ message: 'Coupon not found', statusCode: StatusCodes.NOT_FOUND });
  }

  coupon.isActive = typeof desiredStatus === 'boolean' ? desiredStatus : !coupon.isActive;
  await coupon.save();

  return successResponse(res, {
    message: `Coupon ${coupon.isActive ? 'activated' : 'deactivated'} successfully`,
    data: { coupon: serializeCoupon(coupon) },
  });
});

export const getApplicableCoupons = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError({ message: 'Unauthorized', statusCode: StatusCodes.UNAUTHORIZED });
  }

  const parsedCartTotal = Number(req.query.cartTotal ?? 0);
  const cartTotal = Number.isFinite(parsedCartTotal) && parsedCartTotal > 0 ? parsedCartTotal : 0;

  const evaluations = await listApplicableCoupons({
    cartTotal,
    userId: req.user._id,
  });

  return successResponse(res, {
    message: 'Applicable coupons fetched successfully',
    data: {
      bestCouponCode: evaluations[0]?.coupon.code ?? null,
      items: evaluations.map(({ coupon, discountAmount }) => ({
        ...serializeCoupon(coupon),
        estimatedDiscount: discountAmount,
        estimatedPayable: Math.max(0, cartTotal - discountAmount),
      })),
    },
  });
});

