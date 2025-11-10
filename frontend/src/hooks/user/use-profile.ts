import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { userApi } from '@/api/user';
import type { User } from '@/types/api';
import { useAuthStore } from '@/stores/auth-store';

export const profileQueryKey = ['profile'] as const;

type UseProfileOptions = {
  enabled?: boolean;
};

export const useProfileQuery = (options?: UseProfileOptions) =>
  useQuery({
    queryKey: profileQueryKey,
    queryFn: async () => {
      const { data } = await userApi.getProfile();
      return data.data.user as User;
    },
    enabled: options?.enabled ?? true,
  });

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: async (payload: FormData) => {
      const { data } = await userApi.updateProfile(payload);
      return data.data.user as User;
    },
    onSuccess: (user) => {
      setUser(user);
      queryClient.setQueryData(profileQueryKey, user);
    },
  });
};



