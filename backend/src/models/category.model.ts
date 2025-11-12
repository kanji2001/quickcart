import mongoose, { Schema } from 'mongoose';
import type { Category, CategoryDocument, CategoryModelType } from '../types/category';

const categorySchema = new Schema<Category, CategoryModelType>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true },
    image: {
      publicId: { type: String },
      url: { type: String },
    },
    parentCategory: { type: Schema.Types.ObjectId, ref: 'Category' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

categorySchema.index({ isActive: 1 });

export const CategoryModel =
  (mongoose.models.Category as CategoryModelType) ||
  mongoose.model<Category, CategoryModelType>('Category', categorySchema);

