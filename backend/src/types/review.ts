import { HydratedDocument, Model, Types } from 'mongoose';
import { ImageAsset } from './common';

export interface Review {
  _id?: Types.ObjectId;
  product: Types.ObjectId;
  user: Types.ObjectId;
  order?: Types.ObjectId;
  rating: number;
  comment: string;
  images: ImageAsset[];
  isVerifiedPurchase: boolean;
  helpful: number;
}

export type ReviewDocument = HydratedDocument<Review>;

export type ReviewModelType = Model<Review>;

