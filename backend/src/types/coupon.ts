import { Document, Model, Types } from 'mongoose';

export type DiscountType = 'percent' | 'flat';

export interface Coupon {
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  minCartValue: number;
  maxDiscount?: number;
  startDate: Date;
  expiryDate: Date;
  isActive: boolean;
  usageLimit?: number;
  usageCount: number;
  perUserLimit?: number;
  applicableCategories: Types.ObjectId[];
  applicableProducts: Types.ObjectId[];
  createdAt?: Date;
  updatedAt?: Date;
  // Legacy field support
  userUsageLimit?: number;
}

export interface CouponDocument extends Coupon, Document {}

export type CouponModel = Model<CouponDocument>;

