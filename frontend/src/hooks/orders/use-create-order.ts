import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi, type CreateOrderPayload } from '@/api/orders';
import type { Order } from '@/types/api';
import { ordersQueryKey } from './use-orders';
import { cartQueryKey } from '../cart/use-cart';

export const useCreateOrderMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateOrderPayload) => {
      const { data } = await ordersApi.create(payload);
      return data.data.order as Order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ordersQueryKey() });
      queryClient.invalidateQueries({ queryKey: cartQueryKey });
    },
  });
};


