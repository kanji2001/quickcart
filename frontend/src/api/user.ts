import { http } from '@/lib/http-client';
import { API_ROUTES } from '@/config/api';
import type { Address, AddressInput, ApiResponse, User } from '@/types/api';

export const userApi = {
  getProfile: () => http.get<ApiResponse<{ user: User }>>(API_ROUTES.user.profile),
  updateProfile: (payload: FormData) =>
    http.put<ApiResponse<{ user: User }>>(API_ROUTES.user.profile, payload, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getAddresses: () => http.get<ApiResponse<{ addresses: Address[] }>>(API_ROUTES.user.address),
  createAddress: (payload: AddressInput) =>
    http.post<ApiResponse<{ address: Address }>>(API_ROUTES.user.address, payload),
  updateAddress: (id: string, payload: Partial<AddressInput>) =>
    http.put<ApiResponse<{ address: Address }>>(API_ROUTES.user.addressById(id), payload),
  deleteAddress: (id: string) => http.delete<ApiResponse<Record<string, never>>>(API_ROUTES.user.addressById(id)),
  setDefaultAddress: (id: string) =>
    http.put<ApiResponse<{ address: Address }>>(API_ROUTES.user.setDefaultAddress(id), {}),
};


