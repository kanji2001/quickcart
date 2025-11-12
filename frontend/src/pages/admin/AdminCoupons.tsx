import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Calendar, Percent, Tag, ToggleLeft, ToggleRight, Trash2, Pencil, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { format } from 'date-fns';
import type { Coupon } from '@/types/api';
import {
  useCouponsQuery,
  useDeleteCouponMutation,
  useToggleCouponMutation,
} from '@/hooks/coupons/use-coupons';
import { CouponFormDialog } from '@/components/admin/CouponFormDialog';
import { formatCurrency } from '@/lib/utils';
import { useConfirmDialog } from '@/hooks/use-confirm-dialog';

const statusFilters = [
  { label: 'All', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Expired', value: 'expired' },
] as const;

const discountTypeFilters = [
  { label: 'All Types', value: '' },
  { label: 'Flat', value: 'flat' },
  { label: 'Percent', value: 'percent' },
] as const;

type StatusFilter = (typeof statusFilters)[number]['value'];
type DiscountTypeFilter = (typeof discountTypeFilters)[number]['value'];

const CouponsLoading = () => (
  <Card className="shadow-sm">
    <CardHeader>
      <CardTitle className="text-base">Coupons</CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} className="h-12 w-full" />
      ))}
    </CardContent>
  </Card>
);

const getStatusLabel = (coupon: Coupon) => {
  const now = new Date();
  const starts = new Date(coupon.startDate);
  const ends = new Date(coupon.expiryDate);

  if (!coupon.isActive) {
    return { label: 'Inactive', variant: 'secondary' as const };
  }

  if (starts > now) {
    return { label: 'Upcoming', variant: 'outline' as const };
  }

  if (ends < now) {
    return { label: 'Expired', variant: 'destructive' as const };
  }

  return { label: 'Active', variant: 'default' as const };
};

const buildParamsObject = (searchParams: URLSearchParams) => {
  const obj: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    obj[key] = value;
  });
  return obj;
};

const updateSearchParams = (
  searchParams: URLSearchParams,
  setSearchParams: ReturnType<typeof useSearchParams>[1],
  updates: Record<string, string | undefined>,
) => {
  const next = new URLSearchParams(searchParams);
  Object.entries(updates).forEach(([key, value]) => {
    if (!value) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
  });
  setSearchParams(next, { replace: true });
};

const formatDateRange = (start: string, end: string) => {
  try {
    const startDate = new Date(start);
    const endDate = new Date(end);
    return `${format(startDate, 'dd MMM yyyy')} → ${format(endDate, 'dd MMM yyyy')}`;
  } catch {
    return `${start} → ${end}`;
  }
};

export const AdminCoupons = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const paramsObject = buildParamsObject(searchParams);

  const [searchInput, setSearchInput] = useState(paramsObject.search ?? '');

  const status = (paramsObject.status ?? '') as StatusFilter;
  const discountType = (paramsObject.discountType ?? '') as DiscountTypeFilter;

  useEffect(() => {
    setSearchInput(paramsObject.search ?? '');
  }, [paramsObject.search]);

  const queryParams = useMemo(
    () => ({
      search: paramsObject.search || undefined,
      status: status || undefined,
      discountType: discountType || undefined,
    }),
    [paramsObject.search, status, discountType],
  );

  const { data, isLoading, isError, refetch, isFetching } = useCouponsQuery(queryParams);
  const deleteMutation = useDeleteCouponMutation();
  const toggleMutation = useToggleCouponMutation();
  const { confirm, ConfirmDialog } = useConfirmDialog();

  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    updateSearchParams(searchParams, setSearchParams, { search: value || undefined });
  };

  const handleStatusChange = (value: StatusFilter) => {
    updateSearchParams(searchParams, setSearchParams, { status: value || undefined });
  };

  const handleDiscountTypeChange = (value: DiscountTypeFilter) => {
    updateSearchParams(searchParams, setSearchParams, { discountType: value || undefined });
  };

  const handleDelete = async (coupon: Coupon) => {
    const confirmed = await confirm({
      title: `Delete coupon ${coupon.code}?`,
      description: 'This will permanently remove the coupon and its usage history.',
      confirmText: 'Delete coupon',
      variant: 'destructive',
    });
    if (!confirmed) return;

    deleteMutation.mutate(coupon._id, {
      onSuccess: () => toast.success('Coupon deleted'),
      onError: () => toast.error('Failed to delete coupon'),
    });
  };

  const handleToggle = async (coupon: Coupon) => {
    const confirmed = await confirm({
      title: `${coupon.isActive ? 'Disable' : 'Activate'} ${coupon.code}?`,
      description: coupon.isActive
        ? 'Customers will no longer be able to apply this coupon at checkout.'
        : 'The coupon will become available to eligible customers immediately.',
      confirmText: coupon.isActive ? 'Disable coupon' : 'Activate coupon',
      variant: coupon.isActive ? 'destructive' : 'default',
    });
    if (!confirmed) return;

    toggleMutation.mutate(
      { id: coupon._id, isActive: !coupon.isActive },
      {
        onSuccess: () =>
          toast.success(`Coupon ${coupon.code} ${coupon.isActive ? 'disabled' : 'activated'} successfully`),
        onError: () => toast.error('Failed to update coupon status'),
      },
    );
  };

  if (isLoading) {
    return <CouponsLoading />;
  }

  if (isError || !data) {
    return (
      <Card className="shadow-sm">
        <CardContent className="py-12 text-center space-y-3">
          <p className="text-muted-foreground">Unable to load coupons right now.</p>
          <Button onClick={() => refetch()}>Retry</Button>
        </CardContent>
      </Card>
    );
  }

  const onFormSuccess = () => {
    setEditingCoupon(null);
  };

  return (
    <>
      {ConfirmDialog}
      <div className="space-y-4">
        <Card className="shadow-sm overflow-hidden">
          <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle className="text-base">Coupons</CardTitle>
            <div className="flex flex-col gap-3 w-full sm:flex-row sm:items-center sm:justify-end">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchInput}
                  onChange={(event) => handleSearchChange(event.target.value)}
                  placeholder="Search code or description"
                  className="pl-9"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                {statusFilters.map((filter) => (
                  <Button
                    key={filter.value || 'all-status'}
                    size="sm"
                    variant={status === filter.value ? 'default' : 'outline'}
                    onClick={() => handleStatusChange(filter.value)}
                  >
                    {filter.label}
                  </Button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {discountTypeFilters.map((filter) => (
                  <Button
                    key={filter.value || 'all-discount'}
                    size="sm"
                    variant={discountType === filter.value ? 'default' : 'outline'}
                    onClick={() => handleDiscountTypeChange(filter.value)}
                  >
                    {filter.label}
                  </Button>
                ))}
              </div>
              <CouponFormDialog
                mode="create"
                trigger={
                  <Button className="gradient-primary" size="sm">
                    Create Coupon
                  </Button>
                }
                onSuccess={onFormSuccess}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table className="w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead>Coupon</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Min. Cart</TableHead>
                    <TableHead>Validity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-10">
                        No coupons match your filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    data.items.map((coupon) => {
                      const statusMeta = getStatusLabel(coupon);
                      return (
                        <TableRow key={coupon._id}>
                          <TableCell className="whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Badge className="font-semibold">{coupon.code}</Badge>
                              <div className="flex flex-col">
                                <span className="text-sm font-medium">{coupon.description || '—'}</span>
                                <span className="text-xs text-muted-foreground">
                                  Created {coupon.createdAt ? format(new Date(coupon.createdAt), 'dd MMM yyyy') : '—'}
                                </span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col text-sm">
                              <span className="font-medium flex items-center gap-1">
                                {coupon.discountType === 'flat' ? (
                                  <>
                                    <Tag className="h-4 w-4 text-primary" />
                                    {formatCurrency(coupon.discountValue)}
                                  </>
                                ) : (
                                  <>
                                    <Percent className="h-4 w-4 text-primary" />
                                    {coupon.discountValue}%
                                  </>
                                )}
                              </span>
                              {coupon.discountType === 'percent' && coupon.maxDiscount ? (
                                <span className="text-xs text-muted-foreground">
                                  Max discount {formatCurrency(coupon.maxDiscount)}
                                </span>
                              ) : null}
                            </div>
                          </TableCell>
                          <TableCell>{formatCurrency(coupon.minCartValue)}</TableCell>
                          <TableCell>
                            <div className="flex flex-col text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3.5 w-3.5" />
                                {formatDateRange(coupon.startDate, coupon.expiryDate)}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusMeta.variant}>{statusMeta.label}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col text-xs">
                              <span className="font-medium">{coupon.usageCount ?? 0}</span>
                              {coupon.usageLimit ? (
                                <span className="text-muted-foreground">of {coupon.usageLimit}</span>
                              ) : (
                                <span className="text-muted-foreground">No limit</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Switch checked={coupon.isActive} onCheckedChange={() => handleToggle(coupon)} />
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => setEditingCoupon(coupon)}
                                title="Edit coupon"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => handleDelete(coupon)}
                                disabled={deleteMutation.isPending}
                                title="Delete coupon"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <CouponFormDialog
          mode="edit"
          coupon={editingCoupon ?? undefined}
          open={Boolean(editingCoupon)}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) {
              setEditingCoupon(null);
            }
          }}
          onSuccess={onFormSuccess}
        />
      </div>
    </>
  );
};

export default AdminCoupons;


