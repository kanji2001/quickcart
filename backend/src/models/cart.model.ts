import mongoose, { Schema } from 'mongoose';
import type { CartDocument, CartModel } from '../types/cart';

const cartItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
  },
  { _id: true },
);

const cartSchema = new Schema<CartDocument, CartModel>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true },
    items: [cartItemSchema],
    totalAmount: { type: Number, default: 0 },
    totalItems: { type: Number, default: 0 },
  },
  { timestamps: true },
);

cartSchema.methods.calculateTotals = function calculateTotals() {
  const totals = this.items.reduce(
    (acc, item) => {
      acc.totalItems += item.quantity;
      acc.totalAmount += item.quantity * item.price;
      return acc;
    },
    { totalAmount: 0, totalItems: 0 },
  );

  this.totalAmount = totals.totalAmount;
  this.totalItems = totals.totalItems;
};

cartSchema.pre<CartDocument>('save', function preSave(next) {
  this.calculateTotals();
  next();
});

export const CartModel = (mongoose.models.Cart as CartModel) || mongoose.model<CartDocument, CartModel>('Cart', cartSchema);

