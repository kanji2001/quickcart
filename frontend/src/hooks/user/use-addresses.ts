import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userApi } from '@/api/user';
import type { Address } from '@/types/api';

export const addressesQueryKey = ['user', 'addresses'] as const;

type UseAddressesOptions = {
  enabled?: boolean;
};

export const useAddressesQuery = (options?: UseAddressesOptions) =>
  useQuery({
    queryKey: addressesQueryKey,
    queryFn: async () => {
      const { data } = await userApi.getAddresses();
      return data.data.addresses as Address[];
    },
    enabled: options?.enabled ?? true,
  });

export const useCreateAddressMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: userApi.createAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addressesQueryKey });
    },
  });
};

export const useUpdateAddressMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Address> }) => userApi.updateAddress(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addressesQueryKey });
    },
  });
};

export const useDeleteAddressMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userApi.deleteAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addressesQueryKey });
    },
  });
};

export const useSetDefaultAddressMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userApi.setDefaultAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: addressesQueryKey });
    },
  });
};


