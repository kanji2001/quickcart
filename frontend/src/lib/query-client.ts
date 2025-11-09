import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        if ('response' in (error as any) && (error as any).response?.status === 401) {
          return false;
        }
        return failureCount < 3;
      },
    },
  },
});

