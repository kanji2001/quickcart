import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, type AdminProductsQuery, type AdminProductsResponse } from '@/api/admin';
import type { Product } from '@/types/product';

export const adminProductsQueryKey = (params: AdminProductsQuery = {}) => ['admin', 'products', params] as const;

export const useAdminProducts = (params: AdminProductsQuery = {}) =>
  useQuery<AdminProductsResponse>({
    queryKey: adminProductsQueryKey(params),
    queryFn: async () => {
      const { data } = await adminApi.products(params);
      return data.data;
    },
    placeholderData: (previousData) => previousData,
  });

export const useAdminProduct = (id: string | null, enabled = true) =>
  useQuery({
    queryKey: ['admin', 'product', id],
    enabled: Boolean(id) && enabled,
    queryFn: async () => {
      if (!id) {
        return null;
      }
      const { data } = await adminApi.product(id);
      return data.data.product;
    },
  });

export const useAdminCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: FormData) => adminApi.createProduct(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
  });
};

export const useAdminUpdateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Product> | FormData }) =>
      adminApi.updateProduct(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
  });
};

export const useAdminDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'products'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
  });
};
