import { useMutation } from '@tanstack/react-query';
import { supportApi, type ContactRequest } from '@/api/support';

export const useContactMutation = () => {
  return useMutation({
    mutationFn: async (payload: ContactRequest) => {
      const response = await supportApi.contact(payload);
      return response.data;
    },
  });
};


