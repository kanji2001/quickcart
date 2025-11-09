import mongoose, { Schema } from 'mongoose';
import type { ProductDocument, ProductModel } from '../types/product';

const productSchema = new Schema<ProductDocument, ProductModel>(
  {
    name: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    subCategory: { type: Schema.Types.ObjectId, ref: 'Category' },
    brand: { type: String, trim: true, index: true },
    sku: { type: String, required: true, unique: true, trim: true },
    stock: { type: Number, default: 0, min: 0 },
    sold: { type: Number, default: 0 },
    images: [
      {
        publicId: { type: String, required: true },
        url: { type: String, required: true },
      },
    ],
    thumbnail: {
      publicId: { type: String },
      url: { type: String },
    },
    features: [{ type: String }],
    specifications: { type: Schema.Types.Mixed, default: {} },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
    isNew: { type: Boolean, default: false },
    isTrending: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    tags: [{ type: String, index: true }],
    weight: { type: Number },
    dimensions: {
      length: { type: Number },
      width: { type: Number },
      height: { type: Number },
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } },
);

productSchema.virtual('discountPercent').get(function calculateDiscount() {
  if (!this.discountPrice || this.price <= 0) {
    return 0;
  }
  const discount = ((this.price - this.discountPrice) / this.price) * 100;
  return Math.round(discount);
});

productSchema.index({ name: 'text', description: 'text', brand: 'text', tags: 'text' });
productSchema.index({ category: 1, price: 1, rating: -1 });
productSchema.index({ isFeatured: 1 });
productSchema.index({ isActive: 1 });

productSchema.statics.getFeatured = function getFeatured(limit = 10) {
  return this.find({ isFeatured: true, isActive: true }).limit(limit).sort({ createdAt: -1 });
};

export const ProductModel =
  (mongoose.models.Product as ProductModel) || mongoose.model<ProductDocument, ProductModel>('Product', productSchema);

