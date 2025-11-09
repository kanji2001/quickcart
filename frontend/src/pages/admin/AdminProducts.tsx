import { useMemo, useState } from 'react';
import { Search, Star, ToggleLeft, ToggleRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminProducts, useAdminUpdateProduct } from '@/hooks/admin/use-admin-products';
import { formatCurrency } from '@/utils/number';
import { toast } from 'sonner';

const ProductsLoading = () => (
  <Card className="shadow-sm">
    <CardHeader>
      <CardTitle className="text-base">Catalogue</CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <Skeleton key={index} className="h-12 w-full" />
      ))}
    </CardContent>
  </Card>
);

const statusFilters = [
  { label: 'All', value: '' },
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Featured', value: 'featured' },
];

export const AdminProducts = () => {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);

  const queryParams = useMemo(
    () => ({ search: search || undefined, status: status || undefined, page }),
    [search, status, page],
  );

  const { data, isLoading, isError, refetch, isFetching } = useAdminProducts(queryParams);
  const updateMutation = useAdminUpdateProduct();

  const handleToggle = (id: string, field: 'isActive' | 'isFeatured', currentValue: boolean) => {
    updateMutation.mutate(
      { id, payload: { [field]: !currentValue } },
      {
        onSuccess: () => {
          toast.success('Product updated');
        },
        onError: () => {
          toast.error('Failed to update product');
        },
      },
    );
  };

  if (isLoading) {
    return <ProductsLoading />;
  }

  if (isError || !data) {
    return (
      <Card className="shadow-sm">
        <CardContent className="py-12 text-center space-y-3">
          <p className="text-muted-foreground">Unable to load products.</p>
          <Button onClick={() => refetch()}>Retry</Button>
        </CardContent>
      </Card>
    );
  }

  const { items, pagination } = data;

  const totalPages = pagination.pages;

  const handlePageChange = (nextPage: number) => {
    if (nextPage < 1 || nextPage > totalPages) return;
    setPage(nextPage);
  };

  return (
    <div className="space-y-4">
      <Card className="shadow-sm">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <CardTitle className="text-base">Catalogue</CardTitle>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search name or SKU"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              {statusFilters.map((filter) => (
                <Button
                  key={filter.label}
                  variant={status === filter.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {
                    setStatus(filter.value);
                    setPage(1);
                  }}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
          </div>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Inventory</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No products found
                  </TableCell>
                </TableRow>
              ) : (
                items.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-xs text-muted-foreground flex gap-2">
                        <span>{product.sku}</span>
                        {product.category ? <span>• {product.category.name}</span> : null}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">Stock: {product.stock}</div>
                      <div className="text-xs text-muted-foreground">Sold: {product.sold}</div>
                    </TableCell>
                    <TableCell className="space-x-2">
                      {product.isActive ? <Badge>Active</Badge> : <Badge variant="secondary">Inactive</Badge>}
                      {product.isFeatured ? (
                        <Badge variant="outline" className="gap-1">
                          <Star className="h-3 w-3" /> Featured
                        </Badge>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="font-semibold">{formatCurrency(product.discountPrice ?? product.price)}</div>
                      {product.discountPrice ? (
                        <div className="text-xs text-muted-foreground line-through">
                          {formatCurrency(product.price)}
                        </div>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggle(product._id, 'isActive', product.isActive)}
                        disabled={updateMutation.isPending}
                      >
                        {product.isActive ? (
                          <>
                            <ToggleLeft className="mr-1 h-4 w-4" /> Disable
                          </>
                        ) : (
                          <>
                            <ToggleRight className="mr-1 h-4 w-4" /> Enable
                          </>
                        )}
                      </Button>
                      <Button
                        variant={product.isFeatured ? 'secondary' : 'outline'}
                        size="sm"
                        onClick={() => handleToggle(product._id, 'isFeatured', product.isFeatured)}
                        disabled={updateMutation.isPending}
                      >
                        <Star className="mr-1 h-4 w-4" />
                        {product.isFeatured ? 'Unmark' : 'Feature'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
        <div className="border-t px-6 py-4 text-sm text-muted-foreground flex items-center justify-between gap-3 flex-wrap">
          <div>
            Page {pagination.page} of {pagination.pages} · {pagination.total} products
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page - 1)}
              disabled={pagination.page <= 1 || isFetching}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(page + 1)}
              disabled={pagination.page >= totalPages || isFetching}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching}>
              Refresh
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminProducts;
