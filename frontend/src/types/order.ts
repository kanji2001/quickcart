type OrderItem = {
  product: string;
  productName: string;
  productImage?: string;
  price: number;
  quantity: number;
  subtotal: number;
};

export type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded';
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';

export type Order = {
  _id: string;
  orderNumber: string;
  user: Types.ObjectId;
  items: OrderItem[];
  paymentMethod: 'razorpay' | 'cod';
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  subtotal: number;
  shippingCharges: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  couponCode?: string;
  appliedCoupon?: {
    code: string;
    description?: string;
    discountType: 'percent' | 'flat';
    discountValue: number;
    minCartValue: number;
    maxDiscount?: number;
    discountAmount: number;
  };
  orderNotes?: string;
  createdAt?: string;
  statusHistory?: Array<{ status: OrderStatus; date: string; note?: string }>;
};

