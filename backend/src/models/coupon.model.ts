import mongoose, { Schema } from 'mongoose';
import type { CouponDocument, CouponModel } from '../types/coupon';

const couponSchema = new Schema<CouponDocument, CouponModel>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String },
    discountType: { type: String, enum: ['percentage', 'fixed'], required: true },
    discountValue: { type: Number, required: true, min: 0 },
    minPurchaseAmount: { type: Number, default: 0 },
    maxDiscountAmount: { type: Number },
    usageLimit: { type: Number },
    usageCount: { type: Number, default: 0 },
    userUsageLimit: { type: Number },
    validFrom: { type: Date, required: true },
    validUntil: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    applicableCategories: { type: [{ type: Schema.Types.ObjectId, ref: 'Category' }], default: [] },
    applicableProducts: { type: [{ type: Schema.Types.ObjectId, ref: 'Product' }], default: [] },
  },
  { timestamps: true },
);

couponSchema.index({ isActive: 1, validFrom: 1, validUntil: 1 });

export const CouponModel =
  (mongoose.models.Coupon as CouponModel) || mongoose.model<CouponDocument, CouponModel>('Coupon', couponSchema);

