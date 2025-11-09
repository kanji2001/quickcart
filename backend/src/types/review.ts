import { Document, Model, Types } from 'mongoose';
import { ImageAsset } from './common';

export interface Review {
  product: Types.ObjectId;
  user: Types.ObjectId;
  order?: Types.ObjectId;
  rating: number;
  comment: string;
  images: ImageAsset[];
  isVerifiedPurchase: boolean;
  helpful: number;
}

export type ReviewDocument = Review & Document;

export type ReviewModel = Model<ReviewDocument>;

