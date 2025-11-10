import { useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { couponsApi, type CouponPayload, type ValidateCouponRequest } from '@/api/coupons';
import type { Coupon, CouponWithEstimate } from '@/types/api';

export const couponsQueryKey = (params?: Record<string, unknown>) => ['coupons', params ?? {}] as const;
export const availableCouponsQueryKey = (cartTotal: number) => ['available-coupons', cartTotal] as const;

type CouponsListResponse = {
  items: Coupon[];
};

type ApplicableCouponsResponse = {
  bestCouponCode: string | null;
  items: CouponWithEstimate[];
};

export const useCouponsQuery = (params?: Record<string, unknown>) =>
  useQuery<CouponsListResponse>({
    queryKey: couponsQueryKey(params),
    queryFn: async () => {
      const { data } = await couponsApi.list(params);
      return data.data;
    },
  });

export const useAvailableCoupons = (cartTotal: number, enabled = true) =>
  useQuery<ApplicableCouponsResponse>({
    queryKey: availableCouponsQueryKey(cartTotal),
    enabled,
    queryFn: async () => {
      const { data } = await couponsApi.available(cartTotal);
      return data.data;
    },
  });

export const useValidateCouponMutation = () =>
  useMutation({
    mutationFn: async (payload: ValidateCouponRequest) => {
      const { data } = await couponsApi.validate(payload);
      return data.data;
    },
  });

export const useCreateCouponMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CouponPayload) => {
      const { data } = await couponsApi.create(payload);
      return data.data.coupon;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: couponsQueryKey() });
    },
  });
};

export const useUpdateCouponMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, payload }: { id: string; payload: CouponPayload }) => {
      const { data } = await couponsApi.update(id, payload);
      return data.data.coupon;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: couponsQueryKey() });
    },
  });
};

export const useDeleteCouponMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await couponsApi.remove(id);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: couponsQueryKey() });
    },
  });
};

export const useToggleCouponMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive?: boolean }) => {
      const { data } = await couponsApi.toggle(id, isActive);
      return data.data.coupon;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: couponsQueryKey() });
    },
  });
};

export const useBestCoupon = (couponData?: ApplicableCouponsResponse) =>
  useMemo(() => {
    if (!couponData || couponData.items.length === 0) {
      return null;
    }
    return couponData.items.find((coupon) => coupon.code === couponData.bestCouponCode) ?? couponData.items[0];
  }, [couponData]);


