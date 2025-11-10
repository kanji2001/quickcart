export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type PaginatedResponse<T> = {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};
export type ImageAsset = {
  publicId?: string;
  url?: string;
};

export type User = {
  _id: string;
  name: string;
  email: string;
  phone: string;
  role: 'user' | 'admin';
  avatar?: ImageAsset;
  isVerified?: boolean;
  isBlocked?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type Category = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: ImageAsset;
  parentCategory?: string;
  isActive: boolean;
};

export type Product = {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: Category | string;
  subCategory?: Category | string;
  brand?: string;
  sku: string;
  stock: number;
  sold: number;
  images: ImageAsset[];
  thumbnail?: ImageAsset;
  features: string[];
  specifications: Record<string, unknown>;
  rating: number;
  numReviews: number;
  isFeatured: boolean;
  isNew: boolean;
  isTrending: boolean;
  isActive: boolean;
  tags: string[];
  weight?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
  };
  discountPercent?: number;
};

export type PaginatedResponse<T> = {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  filters?: Record<string, unknown>;
};

export type AuthResponse = {
  user: User;
  accessToken: string;
};

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
};

export type Address = {
  _id: string;
  user?: string;
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  isDefault?: boolean;
  addressType?: 'home' | 'office' | 'other';
  createdAt?: string;
  updatedAt?: string;
};

export type AddressInput = Omit<
  Address,
  '_id' | 'user' | 'isDefault' | 'addressType' | 'createdAt' | 'updatedAt'
> & {
  addressType?: Address['addressType'];
  isDefault?: boolean;
};

export type OrderItem = {
  _id: string;
  product: Product;
  productName: string;
  productImage?: string;
  price: number;
  quantity: number;
  subtotal: number;
};

export type Order = {
  _id: string;
  orderNumber: string;
  user: string;
  items: OrderItem[];
  shippingAddress: Address;
  billingAddress: Address;
  paymentMethod: 'razorpay' | 'cod';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'refunded';
  orderStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned';
  subtotal: number;
  shippingCharges: number;
  taxAmount: number;
  discountAmount: number;
  totalAmount: number;
  couponCode?: string;
  createdAt: string;
  statusHistory: Array<{
    status: Order['orderStatus'];
    date: string;
    note?: string;
  }>;
};

