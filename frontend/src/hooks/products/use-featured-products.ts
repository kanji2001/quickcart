import { useQuery } from '@tanstack/react-query';
import { productsApi } from '@/api/products';
import type { Product } from '@/types/product';

export const featuredProductsQueryKey = ['products', 'featured'] as const;

export const useFeaturedProducts = () =>
  useQuery({
    queryKey: featuredProductsQueryKey,
    queryFn: async () => {
      const { data } = await productsApi.featured();
      return data.data.items as Product[];
    },
  });

