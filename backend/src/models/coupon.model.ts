import mongoose, { Schema } from 'mongoose';
import type { Coupon, CouponDocument, CouponModelType } from '../types/coupon';

const couponSchema = new Schema<Coupon, CouponModelType>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, trim: true },
    discountType: { type: String, enum: ['percent', 'flat'], required: true },
    discountValue: { type: Number, required: true, min: 0 },
    minCartValue: { type: Number, default: 0, min: 0 },
    maxDiscount: { type: Number, min: 0 },
    startDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    usageLimit: { type: Number },
    usageCount: { type: Number, default: 0 },
    perUserLimit: { type: Number },
    applicableCategories: { type: [{ type: Schema.Types.ObjectId, ref: 'Category' }], default: [] },
    applicableProducts: { type: [{ type: Schema.Types.ObjectId, ref: 'Product' }], default: [] },
  },
  { timestamps: true },
);

couponSchema.index({ isActive: 1, startDate: 1, expiryDate: 1 });

export const CouponModel =
  (mongoose.models.Coupon as CouponModelType) || mongoose.model<Coupon, CouponModelType>('Coupon', couponSchema);
