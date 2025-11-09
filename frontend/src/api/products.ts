import { http } from '@/lib/http-client';
import { API_ROUTES } from '@/config/api';
import type { Product } from '@/types/product';
import type { ApiResponse, PaginatedResponse } from '@/types/api';

export type ProductQueryParams = {
  page?: number;
  limit?: number;
  category?: string;
  subCategory?: string;
  brand?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  sort?: string;
  isFeatured?: boolean;
  isNew?: boolean;
  isTrending?: boolean;
  isActive?: boolean;
  tags?: string[];
};

const buildQueryString = (params: ProductQueryParams = {}) => {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;

    if (Array.isArray(value)) {
      value.forEach((item) => searchParams.append(key, String(item)));
    } else {
      searchParams.append(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : '';
};

export const productsApi = {
  list: (params?: ProductQueryParams) =>
    http.get<ApiResponse<{ items: Product[]; pagination: PaginatedResponse<Product>['pagination']; filters: unknown }>>(
      `${API_ROUTES.products.root}${buildQueryString(params)}`,
    ),
  featured: () => http.get<ApiResponse<{ items: Product[] }>>(API_ROUTES.products.featured),
  trending: () => http.get<ApiResponse<{ items: Product[] }>>(API_ROUTES.products.trending),
  newArrivals: () => http.get<ApiResponse<{ items: Product[] }>>(API_ROUTES.products.newArrivals),
  detail: (idOrSlug: string) => http.get<ApiResponse<{ product: Product }>>(API_ROUTES.products.byId(idOrSlug)),
  reviews: (productId: string, page?: number, limit?: number) =>
    http.get(
      `${API_ROUTES.products.reviews(productId)}${buildQueryString({ page, limit })}`,
    ) as Promise<ApiResponse<PaginatedResponse<unknown>>>,
  related: (productId: string) => http.get<ApiResponse<{ items: Product[] }>>(API_ROUTES.products.related(productId)),
};

