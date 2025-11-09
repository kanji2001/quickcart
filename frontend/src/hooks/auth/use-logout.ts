import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/api/auth';
import { useAuthStore } from '@/stores/auth-store';
import { AUTH_SESSION_QUERY_KEY } from './use-auth-session';

export const useLogoutMutation = () => {
  const queryClient = useQueryClient();
  const clearSession = useAuthStore((state) => state.clearSession);

  return useMutation({
    mutationFn: async () => {
      await authApi.logout();
    },
    onSuccess: () => {
      clearSession();
      queryClient.removeQueries({ queryKey: AUTH_SESSION_QUERY_KEY });
    },
    onError: () => {
      clearSession();
      queryClient.removeQueries({ queryKey: AUTH_SESSION_QUERY_KEY });
    },
  });
};

