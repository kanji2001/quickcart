import { Types } from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import { CouponModel, OrderModel } from '../models';
import { ApiError } from '../utils/api-error';
import type { CouponDocument } from '../types/coupon';

type EvaluateCouponParams = {
  code: string;
  cartTotal: number;
  userId: Types.ObjectId;
};

type CouponEvaluation = {
  coupon: CouponDocument;
  discountAmount: number;
};

const normalizeCouponCode = (code: string) => code.trim().toUpperCase();

const ensureCouponAvailability = async (coupon: CouponDocument, userId: Types.ObjectId) => {
  if (!coupon.isActive) {
    throw new ApiError({ message: 'Coupon is inactive', statusCode: StatusCodes.BAD_REQUEST });
  }

  const now = new Date();
  if (coupon.startDate && coupon.startDate > now) {
    throw new ApiError({ message: 'Coupon is not active yet', statusCode: StatusCodes.BAD_REQUEST });
  }

  if (coupon.expiryDate && coupon.expiryDate < now) {
    throw new ApiError({ message: 'Coupon has expired', statusCode: StatusCodes.BAD_REQUEST });
  }

  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    throw new ApiError({ message: 'Coupon usage limit reached', statusCode: StatusCodes.BAD_REQUEST });
  }

  const perUserLimit = coupon.perUserLimit ?? coupon.userUsageLimit;
  if (perUserLimit) {
    const usageCount = await OrderModel.countDocuments({
      user: userId,
      $or: [{ 'appliedCoupon.code': coupon.code }, { couponCode: coupon.code }],
    });

    if (usageCount >= perUserLimit) {
      throw new ApiError({ message: 'Coupon usage limit reached for this user', statusCode: StatusCodes.BAD_REQUEST });
    }
  }
};

export const calculateCouponDiscount = (coupon: CouponDocument, cartTotal: number): number => {
  if (cartTotal <= 0) {
    return 0;
  }

  let discountAmount = 0;

  if (coupon.discountType === 'percent') {
    discountAmount = (cartTotal * coupon.discountValue) / 100;
    if (coupon.maxDiscount !== undefined && coupon.maxDiscount !== null) {
      discountAmount = Math.min(discountAmount, coupon.maxDiscount);
    }
  } else {
    discountAmount = coupon.discountValue;
  }

  return Number(Math.max(0, Math.min(discountAmount, cartTotal)).toFixed(2));
};

export const evaluateCouponForCart = async ({
  code,
  cartTotal,
  userId,
}: EvaluateCouponParams): Promise<CouponEvaluation> => {
  if (!code) {
    throw new ApiError({ message: 'Coupon code is required', statusCode: StatusCodes.BAD_REQUEST });
  }

  const normalizedCode = normalizeCouponCode(code);

  const coupon = await CouponModel.findOne({ code: normalizedCode });
  if (!coupon) {
    throw new ApiError({ message: 'Coupon does not exist', statusCode: StatusCodes.BAD_REQUEST });
  }

  await ensureCouponAvailability(coupon, userId);

  if (coupon.minCartValue && cartTotal < coupon.minCartValue) {
    throw new ApiError({
      message: `Minimum cart value should be ₹${coupon.minCartValue} to use this coupon`,
      statusCode: StatusCodes.BAD_REQUEST,
    });
  }

  const discountAmount = calculateCouponDiscount(coupon, cartTotal);
  if (discountAmount <= 0) {
    throw new ApiError({ message: 'Coupon is not applicable on current cart value', statusCode: StatusCodes.BAD_REQUEST });
  }

  return { coupon, discountAmount };
};

export const listApplicableCoupons = async ({
  cartTotal,
  userId,
}: {
  cartTotal: number;
  userId: Types.ObjectId;
}): Promise<Array<{ coupon: CouponDocument; discountAmount: number }>> => {
  const now = new Date();

  const coupons = await CouponModel.find({
    isActive: true,
    startDate: { $lte: now },
    expiryDate: { $gte: now },
    minCartValue: { $lte: cartTotal },
  }).sort({ minCartValue: 1, discountValue: -1 });

  const evaluations: Array<{ coupon: CouponDocument; discountAmount: number }> = [];

  for (const coupon of coupons) {
    try {
      await ensureCouponAvailability(coupon, userId);
      const discountAmount = calculateCouponDiscount(coupon, cartTotal);
      if (discountAmount > 0) {
        evaluations.push({ coupon, discountAmount });
      }
    } catch {
      // Ignore coupons that are no longer applicable for the current user/cart state.
    }
  }

  evaluations.sort((a, b) => {
    if (b.discountAmount === a.discountAmount) {
      return a.coupon.minCartValue - b.coupon.minCartValue;
    }
    return b.discountAmount - a.discountAmount;
  });

  return evaluations;
};


