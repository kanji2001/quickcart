import mongoose, { Schema } from 'mongoose';
import type { Wishlist, WishlistDocument, WishlistModelType } from '../types/wishlist';

const wishlistSchema = new Schema<Wishlist, WishlistModelType>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    products: { type: [{ type: Schema.Types.ObjectId, ref: 'Product' }], default: [] },
  },
  { timestamps: true },
);

export const WishlistModel =
  (mongoose.models.Wishlist as WishlistModelType) || mongoose.model<Wishlist, WishlistModelType>('Wishlist', wishlistSchema);

