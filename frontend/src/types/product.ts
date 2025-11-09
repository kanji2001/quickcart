import type { Category } from './category';

export type ImageAsset = {
  publicId?: string;
  url: string;
};

export type Product = {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: Category | string;
  subCategory?: Category | string | null;
  brand?: string;
  sku: string;
  stock: number;
  sold: number;
  images: ImageAsset[];
  thumbnail?: ImageAsset | null;
  features?: string[];
  specifications?: Record<string, unknown>;
  rating: number;
  numReviews: number;
  isFeatured: boolean;
  isNew: boolean;
  isTrending: boolean;
  isActive: boolean;
  tags?: string[];
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  createdAt?: string;
  updatedAt?: string;
  discountPercent?: number;
};

