import { http } from '@/lib/http-client';
import { API_ROUTES } from '@/config/api';
import type { Category } from '@/types/category';
import type { ApiResponse } from '@/types/api';

export const categoriesApi = {
  list: () => http.get<ApiResponse<{ items: Category[] }>>(API_ROUTES.categories.root),
  detail: (idOrSlug: string) => http.get<ApiResponse<{ category: Category }>>(API_ROUTES.categories.byId(idOrSlug)),
};

