import { Document, Model, Types } from 'mongoose';
import { Address, StatusHistoryEntry } from './common';

export type PaymentMethod = 'razorpay' | 'cod';
export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';

export interface OrderItem {
  product: Types.ObjectId;
  productName: string;
  productImage?: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface PaymentDetails {
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  paidAt?: Date;
}

export interface Order {
  orderNumber: string;
  user: Types.ObjectId;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentDetails: PaymentDetails;
  orderStatus: OrderStatus;
  statusHistory: StatusHistoryEntry[];
  subtotal: number;
  shippingCharges: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  couponCode?: string;
  orderNotes?: string;
  trackingNumber?: string;
  shippedAt?: Date;
  deliveredAt?: Date;
  cancelledAt?: Date;
  cancellationReason?: string;
}

export interface OrderDocument extends Order, Document {
  markPaid(details: PaymentDetails): void;
  addStatusHistory(status: OrderStatus, note?: string): void;
}

export type OrderModel = Model<OrderDocument>;

