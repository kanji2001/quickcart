import { Document, Model, Types } from 'mongoose';

export interface Wishlist {
  user: Types.ObjectId;
  products: Types.ObjectId[];
}

export type WishlistDocument = Wishlist & Document;

export type WishlistModel = Model<WishlistDocument>;

