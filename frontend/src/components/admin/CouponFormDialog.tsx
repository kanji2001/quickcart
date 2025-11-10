import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Coupon } from '@/types/api';
import { type CouponPayload } from '@/api/coupons';
import { useCreateCouponMutation, useUpdateCouponMutation } from '@/hooks/coupons/use-coupons';

const couponFormSchema = z
  .object({
    code: z.string().trim().min(3, 'Code must be at least 3 characters'),
    description: z.string().trim().max(200, 'Keep the description concise').optional(),
    discountType: z.enum(['percent', 'flat']),
    discountValue: z.coerce.number().min(1, 'Discount value must be greater than zero'),
    minCartValue: z.coerce.number().min(0, 'Minimum cart value cannot be negative').default(0),
    maxDiscount: z
      .union([z.coerce.number().min(0, 'Max discount must be positive'), z.literal('')])
      .optional()
      .transform((value) => (value === '' ? undefined : value)),
    startDate: z.string().min(1, 'Start date is required'),
    expiryDate: z.string().min(1, 'Expiry date is required'),
    usageLimit: z
      .union([z.coerce.number().int().min(1, 'Usage limit must be positive'), z.literal('')])
      .optional()
      .transform((value) => (value === '' ? undefined : value)),
    perUserLimit: z
      .union([z.coerce.number().int().min(1, 'Per-user limit must be positive'), z.literal('')])
      .optional()
      .transform((value) => (value === '' ? undefined : value)),
    isActive: z.boolean().default(true),
  })
  .superRefine((value, ctx) => {
    const start = new Date(value.startDate);
    const end = new Date(value.expiryDate);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      ctx.addIssue({
        path: ['startDate'],
        code: z.ZodIssueCode.custom,
        message: 'Provide valid start and end dates',
      });
      return;
    }
    if (start >= end) {
      ctx.addIssue({
        path: ['expiryDate'],
        code: z.ZodIssueCode.custom,
        message: 'Expiry date must be after start date',
      });
    }
  });

type CouponFormValues = z.infer<typeof couponFormSchema>;

const toDateTimeLocalValue = (input: string | Date) => {
  const date = input instanceof Date ? input : new Date(input);
  if (Number.isNaN(date.getTime())) {
    return '';
  }
  const pad = (value: number) => String(value).padStart(2, '0');
  const year = date.getFullYear();
  const month = pad(date.getMonth() + 1);
  const day = pad(date.getDate());
  const hours = pad(date.getHours());
  const minutes = pad(date.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const buildPayload = (values: CouponFormValues): CouponPayload => ({
  code: values.code.toUpperCase(),
  description: values.description?.trim() || undefined,
  discountType: values.discountType,
  discountValue: Number(values.discountValue),
  minCartValue: Number(values.minCartValue),
  maxDiscount: values.maxDiscount !== undefined ? Number(values.maxDiscount) : undefined,
  startDate: new Date(values.startDate),
  expiryDate: new Date(values.expiryDate),
  isActive: values.isActive,
  usageLimit: values.usageLimit !== undefined ? Number(values.usageLimit) : undefined,
  perUserLimit: values.perUserLimit !== undefined ? Number(values.perUserLimit) : undefined,
});

type CouponFormDialogProps = {
  mode: 'create' | 'edit';
  coupon?: Coupon;
  trigger?: React.ReactNode;
  onSuccess?: (coupon: Coupon) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export const CouponFormDialog = ({ mode, coupon, trigger, onSuccess, open, onOpenChange }: CouponFormDialogProps) => {
  const [internalOpen, setInternalOpen] = useState(false);
  const createMutation = useCreateCouponMutation();
  const updateMutation = useUpdateCouponMutation();

  const dialogOpen = open ?? internalOpen;

  const setDialogOpen = (next: boolean) => {
    if (open === undefined) {
      setInternalOpen(next);
    }
    onOpenChange?.(next);
  };

  const defaultValues: CouponFormValues = useMemo(
    () => ({
      code: coupon?.code ?? '',
      description: coupon?.description ?? '',
      discountType: coupon?.discountType ?? 'percent',
      discountValue: coupon?.discountValue ?? 0,
      minCartValue: coupon?.minCartValue ?? 0,
      maxDiscount: coupon?.maxDiscount ?? undefined,
      startDate: coupon ? toDateTimeLocalValue(coupon.startDate) : '',
      expiryDate: coupon ? toDateTimeLocalValue(coupon.expiryDate) : '',
      usageLimit: coupon?.usageLimit ?? undefined,
      perUserLimit: coupon?.perUserLimit ?? undefined,
      isActive: coupon?.isActive ?? true,
    }),
    [coupon],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm<CouponFormValues>({
    resolver: zodResolver(couponFormSchema),
    defaultValues,
  });

  useEffect(() => {
    if (dialogOpen) {
      reset(defaultValues);
    }
  }, [dialogOpen, defaultValues, reset]);

  const submitting = isSubmitting || createMutation.isPending || updateMutation.isPending;

  const onSubmit = async (values: CouponFormValues) => {
    try {
      const payload = buildPayload(values);
      let updatedCoupon: Coupon | undefined;
      if (mode === 'create') {
        const couponCreated = await createMutation.mutateAsync(payload);
        updatedCoupon = couponCreated;
        toast.success('Coupon created successfully');
      } else if (coupon) {
        const couponUpdated = await updateMutation.mutateAsync({ id: coupon._id, payload });
        updatedCoupon = couponUpdated;
        toast.success('Coupon updated successfully');
      } else {
        throw new Error('Coupon not found');
      }

      if (updatedCoupon) {
        onSuccess?.(updatedCoupon);
      }

      setDialogOpen(false);
    } catch (error) {
      const description = error instanceof Error ? error.message : 'Please try again.';
      toast.error('Failed to save coupon', { description });
    }
  };

  const discountType = watch('discountType');

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent className="max-w-lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <DialogHeader>
            <DialogTitle>{mode === 'create' ? 'Add Coupon' : 'Edit Coupon'}</DialogTitle>
            <DialogDescription>Configure coupon details and availability rules.</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="coupon-code">Code</Label>
              <Input id="coupon-code" placeholder="SAVE100" {...register('code')} className="uppercase" />
              {errors.code ? <p className="text-xs text-destructive">{errors.code.message}</p> : null}
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="coupon-description">Description</Label>
              <Input
                id="coupon-description"
                placeholder="Get flat ₹100 off above ₹1000"
                {...register('description')}
              />
              {errors.description ? <p className="text-xs text-destructive">{errors.description.message}</p> : null}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label>Discount Type</Label>
                <Select value={discountType} onValueChange={(value) => setValue('discountType', value as 'percent' | 'flat')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flat">Flat</SelectItem>
                    <SelectItem value="percent">Percent</SelectItem>
                  </SelectContent>
                </Select>
                {errors.discountType ? <p className="text-xs text-destructive">{errors.discountType.message}</p> : null}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="discount-value">
                  {discountType === 'percent' ? 'Discount (%)' : 'Discount Amount (₹)'}
                </Label>
                <Input id="discount-value" type="number" step="0.5" min={1} {...register('discountValue')} />
                {errors.discountValue ? <p className="text-xs text-destructive">{errors.discountValue.message}</p> : null}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="min-cart-value">Minimum Cart (₹)</Label>
                <Input id="min-cart-value" type="number" min={0} {...register('minCartValue')} />
                {errors.minCartValue ? <p className="text-xs text-destructive">{errors.minCartValue.message}</p> : null}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="max-discount">
                  Maximum Discount (₹){' '}
                  <span className="text-xs text-muted-foreground">{discountType === 'flat' ? '(optional)' : ''}</span>
                </Label>
                <Input id="max-discount" type="number" min={0} placeholder="Unlimited" {...register('maxDiscount')} />
                {errors.maxDiscount ? <p className="text-xs text-destructive">{errors.maxDiscount as any}</p> : null}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input id="start-date" type="datetime-local" {...register('startDate')} />
                {errors.startDate ? <p className="text-xs text-destructive">{errors.startDate.message}</p> : null}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="expiry-date">Expiry Date</Label>
                <Input id="expiry-date" type="datetime-local" {...register('expiryDate')} />
                {errors.expiryDate ? <p className="text-xs text-destructive">{errors.expiryDate.message}</p> : null}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="usage-limit">Total Usage Limit</Label>
                <Input id="usage-limit" type="number" min={1} placeholder="Unlimited" {...register('usageLimit')} />
                {errors.usageLimit ? <p className="text-xs text-destructive">{errors.usageLimit as any}</p> : null}
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="per-user-limit">Per User Limit</Label>
                <Input id="per-user-limit" type="number" min={1} placeholder="Unlimited" {...register('perUserLimit')} />
                {errors.perUserLimit ? <p className="text-xs text-destructive">{errors.perUserLimit as any}</p> : null}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="font-medium">Active</p>
                <p className="text-xs text-muted-foreground">Inactive coupons will not be suggested to shoppers.</p>
              </div>
              <Switch checked={watch('isActive')} onCheckedChange={(checked) => setValue('isActive', checked)} />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="gradient-primary" disabled={submitting}>
              {submitting ? 'Saving...' : mode === 'create' ? 'Create Coupon' : 'Update Coupon'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};


