import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi, type OrderListFilters } from '@/api/orders';
import type { Order, PaginatedResponse } from '@/types/api';

export const ordersQueryKey = (filters?: OrderListFilters) => ['orders', filters ?? {}] as const;

type OrdersListResponse = {
  items: Order[];
  pagination: PaginatedResponse<Order>['pagination'];
};

export const useOrders = (filters?: OrderListFilters) =>
  useQuery<OrdersListResponse>({
    queryKey: ordersQueryKey(filters),
    queryFn: async () => {
      const { data } = await ordersApi.list(filters);
      return data.data;
    },
  });

export const useCancelOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const { data } = await ordersApi.cancel(id, reason);
      return data.data.order as Order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ordersQueryKey() });
    },
  });
};

