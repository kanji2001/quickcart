import { Document, Model, Types } from 'mongoose';
import { ImageAsset } from './common';

export interface Category {
  name: string;
  slug: string;
  description?: string;
  image?: ImageAsset | null;
  parentCategory?: Types.ObjectId | null;
  isActive: boolean;
}

export type CategoryDocument = Category & Document;

export type CategoryModel = Model<CategoryDocument>;

