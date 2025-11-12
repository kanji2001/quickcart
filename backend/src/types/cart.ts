import { HydratedDocument, Model, Types } from 'mongoose';

export interface CartItem {
  product: Types.ObjectId;
  quantity: number;
  price: number;
}

export interface Cart {
  _id?: Types.ObjectId;
  user: Types.ObjectId;
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
}

export interface CartMethods {
  calculateTotals(): void;
  calculateTotal(): void;
}

export type CartDocument = HydratedDocument<Cart, CartMethods>;

export type CartModelType = Model<Cart, {}, CartMethods>;

