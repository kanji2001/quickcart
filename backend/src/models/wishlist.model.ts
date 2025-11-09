import mongoose, { Schema } from 'mongoose';
import type { WishlistDocument, WishlistModel } from '../types/wishlist';

const wishlistSchema = new Schema<WishlistDocument, WishlistModel>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    products: { type: [{ type: Schema.Types.ObjectId, ref: 'Product' }], default: [] },
  },
  { timestamps: true },
);

export const WishlistModel =
  (mongoose.models.Wishlist as WishlistModel) ||
  mongoose.model<WishlistDocument, WishlistModel>('Wishlist', wishlistSchema);

