import { HydratedDocument, Model, Types } from 'mongoose';
import { ImageAsset } from './common';

export interface Category {
  _id?: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  image?: ImageAsset | null;
  parentCategory?: Types.ObjectId | null;
  isActive: boolean;
}

export type CategoryDocument = HydratedDocument<Category>;

export type CategoryModelType = Model<Category>;

