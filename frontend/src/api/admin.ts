import { http } from '@/lib/http-client';
import { API_ROUTES } from '@/config/api';
import type { ApiResponse } from '@/types/api';
import type { Product } from '@/types/product';
import type { Order } from '@/types/order';
import type { AuthUser } from '@/stores/auth-store';

export type AdminDashboardResponse = {
  totals: {
    users: number;
    products: number;
    orders: number;
    deliveredOrders: number;
    revenue: number;
  };
  recentOrders: Array<Pick<Order, 'orderNumber' | 'totalAmount' | 'paymentStatus' | 'orderStatus' | 'createdAt'> & {
    user: Pick<AuthUser, '_id' | 'name' | 'email'>;
  }>;
  lowStockProducts: Array<Pick<Product, '_id' | 'name' | 'slug' | 'stock' | 'sold' | 'price' | 'thumbnail' | 'sku'>>;
  topProducts: Array<Pick<Product, '_id' | 'name' | 'slug' | 'stock' | 'sold' | 'price' | 'thumbnail' | 'sku'>>;
};

export type AdminProductsResponse = {
  items: Array<
    Pick<
      Product,
      |
        '_id'
        | 'name'
        | 'slug'
        | 'sku'
        | 'price'
        | 'discountPrice'
        | 'stock'
        | 'sold'
        | 'isFeatured'
        | 'isTrending'
        | 'isActive'
        | 'thumbnail'
        | 'createdAt'
        | 'updatedAt'
    > & {
      category?: { _id: string; name: string; slug: string };
    }
  >;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

export type AdminUsersResponse = {
  items: Array<
    Pick<AuthUser, '_id' | 'name' | 'email' | 'role'> & {
      phone?: string;
      createdAt?: string;
      isBlocked?: boolean;
    }
  >;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
};

export type AdminAnalyticsResponse = {
  salesByMonth: Array<{
    _id: { year: number; month: number };
    total: number;
    orders: number;
  }>;
  productPerformance: Array<{
    productId: string;
    name: string;
    slug: string;
    sku: string;
    totalSold: number;
    revenue: number;
    price: number;
    thumbnail?: Product['thumbnail'];
  }>;
};

export type AdminProductsQuery = {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'active' | 'inactive' | 'featured';
  tag?: string;
};

export const adminApi = {
  dashboard: () => http.get<ApiResponse<AdminDashboardResponse>>(API_ROUTES.admin.dashboard),
  products: (params?: AdminProductsQuery) => http.get<ApiResponse<AdminProductsResponse>>(API_ROUTES.admin.products, { params }),
  users: (params?: { page?: number; limit?: number; search?: string; role?: 'user' | 'admin' }) =>
    http.get<ApiResponse<AdminUsersResponse>>(API_ROUTES.admin.users, { params }),
  analytics: () => http.get<ApiResponse<AdminAnalyticsResponse>>(API_ROUTES.admin.analytics),
  createProduct: (payload: FormData) =>
    http.post<ApiResponse<{ product: Product }>>(API_ROUTES.products.root, payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  updateProduct: (id: string, payload: Partial<Product>) => http.put<ApiResponse<{ product: Product }>>(`/products/${id}`, payload),
  deleteProduct: (id: string) => http.delete<ApiResponse<{ product: Product }>>(`/products/${id}`),
  toggleUserRole: (id: string, role: 'user' | 'admin') =>
    http.put<ApiResponse<{ user: AuthUser }>>(API_ROUTES.admin.userRole(id), { role }),
  toggleUserBlock: (id: string, isBlocked: boolean) =>
    http.put<ApiResponse<{ user: AuthUser }>>(API_ROUTES.admin.userBlock(id), { isBlocked }),
  adminOrders: (params?: { page?: number; limit?: number; status?: string }) =>
    http.get<ApiResponse<{ items: Order[]; pagination: { page: number; limit: number; total: number; pages: number } }>>(
      API_ROUTES.orders.adminAll,
      { params },
    ),
  updateOrderStatus: (id: string, payload: { status: string; note?: string }) =>
    http.put<ApiResponse<{ order: Order }>>(API_ROUTES.orders.status(id), payload),
};
