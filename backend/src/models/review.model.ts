import mongoose, { Schema } from 'mongoose';
import type { ReviewDocument, ReviewModel } from '../types/review';

const reviewSchema = new Schema<ReviewDocument, ReviewModel>(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    order: { type: Schema.Types.ObjectId, ref: 'Order' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, minlength: 10 },
    images: [
      {
        publicId: { type: String },
        url: { type: String },
      },
    ],
    isVerifiedPurchase: { type: Boolean, default: false },
    helpful: { type: Number, default: 0 },
  },
  { timestamps: true },
);

reviewSchema.index({ product: 1, user: 1 }, { unique: true });

export const ReviewModel =
  (mongoose.models.Review as ReviewModel) || mongoose.model<ReviewDocument, ReviewModel>('Review', reviewSchema);

