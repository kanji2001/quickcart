import { HydratedDocument, Model, Types } from 'mongoose';
import { Dimensions, ImageAsset } from './common';

export type ProductFeature = string;

export interface Product {
  _id?: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: Types.ObjectId;
  subCategory?: Types.ObjectId | null;
  brand?: string;
  sku: string;
  stock: number;
  sold: number;
  images: ImageAsset[];
  thumbnail?: ImageAsset | null;
  features: ProductFeature[];
  specifications: Record<string, unknown>;
  rating: number;
  numReviews: number;
  isFeatured: boolean;
  isNew: boolean;
  isTrending: boolean;
  isActive: boolean;
  tags: string[];
  weight?: number;
  dimensions?: Dimensions | null;
}

export interface ProductMethods {
  discountPercent?: number;
}

export interface ProductModelStatics {
  getFeatured(limit?: number): Promise<ProductDocument[]>;
}

export type ProductDocument = HydratedDocument<Product, ProductMethods>;

export type ProductModelType = Model<Product, {}, ProductMethods> & ProductModelStatics;

