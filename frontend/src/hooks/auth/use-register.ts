import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi, type RegisterRequest } from '@/api/auth';
import { useAuthStore } from '@/stores/auth-store';
import { AUTH_SESSION_QUERY_KEY } from './use-auth-session';

export const useRegisterMutation = () => {
  const queryClient = useQueryClient();
  const clearSession = useAuthStore((state) => state.clearSession);

  return useMutation({
    mutationFn: async (payload: RegisterRequest) => {
      const { data } = await authApi.register(payload);
      return data.data;
    },
    onSuccess: () => {
      clearSession();
      queryClient.invalidateQueries({ queryKey: AUTH_SESSION_QUERY_KEY });
    },
  });
};

