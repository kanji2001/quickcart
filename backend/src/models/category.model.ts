import mongoose, { Schema } from 'mongoose';
import type { CategoryDocument, CategoryModel } from '../types/category';

const categorySchema = new Schema<CategoryDocument, CategoryModel>(
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

categorySchema.index({ name: 1 }, { unique: true });
categorySchema.index({ slug: 1 }, { unique: true });
categorySchema.index({ isActive: 1 });

export const CategoryModel =
  (mongoose.models.Category as CategoryModel) || mongoose.model<CategoryDocument, CategoryModel>('Category', categorySchema);

