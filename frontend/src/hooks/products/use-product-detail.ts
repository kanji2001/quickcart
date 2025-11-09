import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/api/products';
import type { Product } from '@/types/product';

export const productDetailQueryKey = (idOrSlug: string) => ['product', idOrSlug] as const;

export const useProductDetail = (idOrSlug: string) =>
  useQuery({
    queryKey: productDetailQueryKey(idOrSlug),
    queryFn: async () => {
      const { data } = await productsApi.detail(idOrSlug);
      return data.data.product as Product;
    },
    enabled: Boolean(idOrSlug),
  });

