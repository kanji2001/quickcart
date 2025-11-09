import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { authApi } from '@/api/auth';
import { useAuthStore, selectAccessToken } from '@/stores/auth-store';

const queryKey = ['auth', 'me'];

export const useAuthSession = () => {
  const accessToken = useAuthStore(selectAccessToken);
  const setUser = useAuthStore((state) => state.setUser);
  const clearSession = useAuthStore((state) => state.clearSession);
  const setLoading = useAuthStore((state) => state.setLoading);

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      const { data } = await authApi.me();
      return data.data.user;
    },
    enabled: Boolean(accessToken),
    staleTime: 10 * 60 * 1000,
    retry: false,
  });

  useEffect(() => {
    setLoading(query.isFetching);
  }, [query.isFetching, setLoading]);

  useEffect(() => {
    if (query.data) {
      setUser(query.data);
    }
  }, [query.data, setUser]);

  useEffect(() => {
    if (query.isError) {
      clearSession();
    }
  }, [query.isError, clearSession]);

  return query;
};

export const AUTH_SESSION_QUERY_KEY = queryKey;

