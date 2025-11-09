import { useQuery } from '@tanstack/react-query';
import { adminApi } from '@/api/admin';

export const adminDashboardQueryKey = ['admin', 'dashboard'] as const;

export const useAdminDashboard = () =>
  useQuery({
    queryKey: adminDashboardQueryKey,
    queryFn: async () => {
      const { data } = await adminApi.dashboard();
      return data.data;
    },
    staleTime: 60 * 1000,
  });
