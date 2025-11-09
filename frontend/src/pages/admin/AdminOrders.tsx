import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { adminApi } from '@/api/admin';
import { useQuery } from '@tanstack/react-query';
import { formatCurrency } from '@/utils/number';
import { Badge } from '@/components/ui/badge';

const orderStatuses = ['', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export const AdminOrders = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const statusParam = searchParams.get('status') ?? '';
  const pageParam = Number(searchParams.get('page') ?? '1');
  const [status, setStatus] = useState(statusParam);
  const [page, setPage] = useState(pageParam);

  useEffect(() => {
    setStatus(statusParam);
    setPage(pageParam);
  }, [statusParam, pageParam]);

  const params = useMemo(() => ({ status: status || undefined, page }), [status, page]);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['admin', 'orders', params],
    queryFn: async () => {
      const { data: response } = await adminApi.adminOrders(params);
      return response.data;
    },
    keepPreviousData: true,
  });

  const updateParams = (updates: Record<string, string | number | undefined>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === undefined || value === '' || value === null) {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
    });
    setSearchParams(next, { replace: true });
  };

  const handleStatusChange = (value: string) => {
    setStatus(value);
    setPage(1);
    updateParams({ status: value || undefined, page: 1 });
  };

  const handlePageChange = (nextPage: number) => {
    setPage(nextPage);
    updateParams({ page: nextPage });
  };

  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Orders</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (isError || !data) {
    return (
      <Card className="shadow-sm">
        <CardContent className="py-12 text-center space-y-3">
          <p className="text-muted-foreground">Unable to load orders.</p>
          <Button onClick={() => refetch()}>Retry</Button>
        </CardContent>
      </Card>
    );
  }

  const { items, pagination } = data;

  return (
    <Card className="shadow-sm">
      <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <CardTitle className="text-base">Orders</CardTitle>
        <div className="flex gap-2 flex-wrap">
          {orderStatuses.map((value) => (
            <Button
              key={value || 'all'}
              variant={status === value ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleStatusChange(value)}
            >
              {value ? value.charAt(0).toUpperCase() + value.slice(1) : 'All'}
            </Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Payment</TableHead>
              <TableHead className="text-right">Total</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground">
                  No orders yet
                </TableCell>
              </TableRow>
            ) : (
              items.map((order) => (
                <TableRow key={order._id}>
                  <TableCell>
                    <div className="font-medium">{order.orderNumber}</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(order.createdAt ?? '').toLocaleString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {order.orderStatus}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {order.paymentStatus}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {formatCurrency(order.totalAmount ?? 0)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
      <div className="flex items-center justify-between gap-3 border-t px-6 py-4 text-sm text-muted-foreground">
        <div>
          Page {pagination.page} of {pagination.pages}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={pagination.page <= 1} onClick={() => handlePageChange(pagination.page - 1)}>
            Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.page >= pagination.pages}
            onClick={() => handlePageChange(pagination.page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default AdminOrders;
