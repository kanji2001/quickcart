import { useQuery } from '@tanstack/react-query';
import { categoriesApi } from '@/api/categories';
import type { Category } from '@/types/category';

export const categoriesQueryKey = ['categories'] as const;

export const useCategories = () =>
  useQuery({
    queryKey: categoriesQueryKey,
    queryFn: async () => {
      const { data } = await categoriesApi.list();
      return data.data.items as Category[];
    },
  });

