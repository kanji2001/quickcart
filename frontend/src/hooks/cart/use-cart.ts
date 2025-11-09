import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cartApi, type AddCartItemRequest, type UpdateCartItemRequest } from '@/api/cart';
import type { Cart } from '@/types/cart';
import { useAuthStore, selectAccessToken } from '@/stores/auth-store';

export const cartQueryKey = ['cart'] as const;

const fetchCart = async () => {
  const { data } = await cartApi.get();
  return data.data.cart as Cart;
};

export const useCartQuery = () => {
  const accessToken = useAuthStore(selectAccessToken);
  return useQuery({
    queryKey: cartQueryKey,
    queryFn: fetchCart,
    enabled: Boolean(accessToken),
  });
};

export const useAddCartItemMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: AddCartItemRequest) => {
      const { data } = await cartApi.addItem(payload);
      return data.data.cart as Cart;
    },
    onSuccess: (cart) => {
      queryClient.setQueryData(cartQueryKey, cart);
    },
  });
};

export const useUpdateCartItemMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: UpdateCartItemRequest) => {
      const { data } = await cartApi.updateItem(payload);
      return data.data.cart as Cart;
    },
    onSuccess: (cart) => {
      queryClient.setQueryData(cartQueryKey, cart);
    },
  });
};

export const useRemoveCartItemMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (itemId: string) => {
      const { data } = await cartApi.removeItem(itemId);
      return data.data.cart as Cart;
    },
    onSuccess: (cart) => {
      queryClient.setQueryData(cartQueryKey, cart);
    },
  });
};

export const useClearCartMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      const { data } = await cartApi.clear();
      return data.data.cart as Cart;
    },
    onSuccess: (cart) => {
      queryClient.setQueryData(cartQueryKey, cart);
    },
  });
};

