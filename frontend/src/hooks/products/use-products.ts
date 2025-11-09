import { useQuery } from '@tanstack/react-query';
import { productsApi, type ProductQueryParams } from '@/api/products';
import type { Product } from '@/types/product';
import type { PaginatedResponse } from '@/types/api';

export const productsQueryKey = (params?: ProductQueryParams) => ['products', params ?? {}] as const;

type ProductsData = {
  items: Product[];
  pagination: PaginatedResponse<Product>['pagination'];
  filters: unknown;
};

export const useProducts = (params?: ProductQueryParams) => {
  return useQuery({
    queryKey: productsQueryKey(params),
    queryFn: async () => {
      const { data } = await productsApi.list(params);
      return data.data as ProductsData;
    },
    keepPreviousData: true,
  });
};

