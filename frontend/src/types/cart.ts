import type { Product } from './product';

export type CartItem = {
  _id: string;
  product: Product;
  quantity: number;
  price: number;
};

export type Cart = {
  _id: string;
  user: string;
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
  createdAt?: string;
  updatedAt?: string;
};

