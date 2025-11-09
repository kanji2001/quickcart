import { Document, Model, Types } from 'mongoose';

export interface CartItem {
  product: Types.ObjectId;
  quantity: number;
  price: number;
}

export interface Cart {
  user: Types.ObjectId;
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
}

export interface CartDocument extends Cart, Document {
  calculateTotals(): void;
}

export type CartModel = Model<CartDocument>;

