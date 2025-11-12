import { HydratedDocument, Model, Types } from 'mongoose';

export interface Wishlist {
  _id?: Types.ObjectId;
  user: Types.ObjectId;
  products: Types.ObjectId[];
}

export type WishlistDocument = HydratedDocument<Wishlist>;

export type WishlistModelType = Model<Wishlist>;

