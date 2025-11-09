import { Document, Model, Types } from 'mongoose';

export type DiscountType = 'percentage' | 'fixed';

export interface Coupon {
  code: string;
  description?: string;
  discountType: DiscountType;
  discountValue: number;
  minPurchaseAmount: number;
  maxDiscountAmount?: number;
  usageLimit?: number;
  usageCount: number;
  userUsageLimit?: number;
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
  applicableCategories: Types.ObjectId[];
  applicableProducts: Types.ObjectId[];
}

export type CouponDocument = Coupon & Document;

export type CouponModel = Model<CouponDocument>;

