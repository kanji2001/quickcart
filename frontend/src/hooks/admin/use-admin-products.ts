import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, type AdminProductsQuery } from '@/api/admin';
import type { Product } from '@/types/product';

export const adminProductsQueryKey = (params: AdminProductsQuery = {}) => ['admin', 'products', params] as const;

export const useAdminProducts = (params: AdminProductsQuery = {}) =>
  useQuery({
    queryKey: adminProductsQueryKey(params),
    queryFn: async () => {
      const { data } = await adminApi.products(params);
      return data.data;
    },
    keepPreviousData: true,
  });

export const useAdminUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Product> }) => adminApi.updateProduct(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
  });
};
