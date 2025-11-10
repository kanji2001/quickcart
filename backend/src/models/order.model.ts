import mongoose, { Schema } from 'mongoose';
import type { Address } from '../types/common';
import type { OrderDocument, OrderModel, OrderStatus } from '../types/order';

const addressSchema = new Schema<Address>(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    addressLine1: { type: String, required: true, trim: true },
    addressLine2: { type: String, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true },
    isDefault: { type: Boolean, default: false },
    addressType: { type: String, enum: ['home', 'office', 'other'], default: 'home' },
  },
  { _id: false },
);

const orderItemSchema = new Schema(
  {
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    productName: { type: String, required: true },
    productImage: { type: String },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true },
  },
  { _id: true },
);

const statusHistorySchema = new Schema(
  {
    status: { type: String, required: true },
    date: { type: Date, default: Date.now },
    note: { type: String },
  },
  { _id: true },
);

const paymentDetailsSchema = new Schema(
  {
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    razorpaySignature: { type: String },
    paidAt: { type: Date },
  },
  { _id: false },
);

const orderSchema = new Schema<OrderDocument, OrderModel>(
  {
    orderNumber: { type: String, unique: true, index: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    items: [orderItemSchema],
    shippingAddress: { type: addressSchema, required: true },
    billingAddress: { type: addressSchema, required: true },
    paymentMethod: { type: String, enum: ['razorpay', 'cod'], required: true },
    paymentStatus: { type: String, enum: ['pending', 'completed', 'failed', 'refunded'], default: 'pending' },
    paymentDetails: { type: paymentDetailsSchema, default: {} },
    orderStatus: {
      type: String,
      enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled', 'returned'],
      default: 'pending',
    },
    statusHistory: { type: [statusHistorySchema], default: [] },
    subtotal: { type: Number, required: true },
    shippingCharges: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    discountAmount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    couponCode: { type: String },
    appliedCoupon: {
      code: { type: String },
      description: { type: String },
      discountType: { type: String, enum: ['percent', 'flat'] },
      discountValue: { type: Number },
      minCartValue: { type: Number },
      maxDiscount: { type: Number },
      discountAmount: { type: Number },
    },
    orderNotes: { type: String },
    trackingNumber: { type: String },
    shippedAt: { type: Date },
    deliveredAt: { type: Date },
    cancelledAt: { type: Date },
    cancellationReason: { type: String },
  },
  { timestamps: true },
);

const generateOrderNumber = () => {
  const random = Math.floor(Math.random() * 1_000_000_0000)
    .toString()
    .padStart(10, '0');
  return `ORD-${random}`;
};

orderSchema.pre<OrderDocument>('save', function assignOrderNumber(next) {
  if (!this.orderNumber) {
    this.orderNumber = generateOrderNumber();
  }
  if (!this.statusHistory?.length) {
    this.statusHistory = [{ status: this.orderStatus, date: new Date() }];
  }
  next();
});

orderSchema.methods.markPaid = function markPaid(details) {
  this.paymentStatus = 'completed';
  this.paymentDetails = {
    ...this.paymentDetails,
    ...details,
    paidAt: details.paidAt ?? new Date(),
  };
};

orderSchema.methods.addStatusHistory = function addStatusHistory(status: OrderStatus, note?: string) {
  this.statusHistory.push({
    status,
    date: new Date(),
    note,
  });
  this.orderStatus = status;

  if (status === 'shipped') {
    this.shippedAt = new Date();
  }
  if (status === 'delivered') {
    this.deliveredAt = new Date();
  }
  if (status === 'cancelled') {
    this.cancelledAt = new Date();
  }
};

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ createdAt: -1 });

export const OrderModel =
  (mongoose.models.Order as OrderModel) || mongoose.model<OrderDocument, OrderModel>('Order', orderSchema);

