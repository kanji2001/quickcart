import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi, type LoginRequest } from '@/api/auth';
import { useAuthStore } from '@/stores/auth-store';
import { AUTH_SESSION_QUERY_KEY } from './use-auth-session';

export const useLoginMutation = () => {
  const queryClient = useQueryClient();
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: async (payload: LoginRequest) => {
      const { data } = await authApi.login(payload);
      return data.data;
    },
    onSuccess: (data) => {
      setSession(data);
      queryClient.invalidateQueries({ queryKey: AUTH_SESSION_QUERY_KEY });
    },
  });
};

