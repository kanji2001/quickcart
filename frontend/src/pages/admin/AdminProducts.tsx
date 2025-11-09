import { useMemo, useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, Star, ToggleLeft, ToggleRight, ChevronLeft, ChevronRight, Trash2, Pencil } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useAdminProducts, useAdminUpdateProduct, useAdminDeleteProduct } from '@/hooks/admin/use-admin-products';
import { formatCurrency } from '@/utils/number';
import { toast } from 'sonner';
import { AddProductDialog } from '@/components/admin/AddProductDialog';
import { EditProductDialog } from '@/components/admin/EditProductDialog';

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
] as const;

type StatusFilter = (typeof statusFilters)[number]['value'];

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
  updates: Record<string, string | number | undefined>,
) => {
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

export const AdminProducts = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const paramsObject = buildParamsObject(searchParams);
  const [searchInput, setSearchInput] = useState(paramsObject.search ?? '');

  const status = (paramsObject.status ?? '') as StatusFilter;
  const page = Number(paramsObject.page ?? '1');

  useEffect(() => {
    setSearchInput(paramsObject.search ?? '');
  }, [paramsObject.search]);

  const queryParams = useMemo(
    () => ({
      search: paramsObject.search || undefined,
      status: status ? (status as Exclude<StatusFilter, ''>) : undefined,
      page,
    }),
    [paramsObject.search, status, page],
  );

  const { data, isLoading, isError, refetch, isFetching } = useAdminProducts(queryParams);
  const updateMutation = useAdminUpdateProduct();
  const deleteMutation = useAdminDeleteProduct();

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

  const handleDelete = (id: string, name: string) => {
    const confirmed = window.confirm(`Remove ${name}? This action will permanently delete the product.`);
    if (!confirmed) return;
    deleteMutation.mutate(id, {
      onSuccess: () => toast.success('Product removed'),
      onError: () => toast.error('Failed to remove product'),
    });
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
    updateSearchParams(searchParams, setSearchParams, { page: nextPage });
  };

  const handleStatusChange = (nextStatus: StatusFilter) => {
    updateSearchParams(searchParams, setSearchParams, { status: nextStatus || undefined, page: 1 });
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    updateSearchParams(searchParams, setSearchParams, { search: value || undefined, page: 1 });
  };

  return (
    <div className="space-y-4">
      <Card className="shadow-sm overflow-hidden">
        <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between w-full">
          <CardTitle className="text-base">Catalogue</CardTitle>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:flex-1 sm:justify-end w-full">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search name or SKU"
                value={searchInput}
                onChange={(event) => handleSearchChange(event.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {statusFilters.map((filter) => (
                <Button
                  key={filter.label}
                  variant={status === filter.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handleStatusChange(filter.value)}
                >
                  {filter.label}
                </Button>
              ))}
            </div>
            <AddProductDialog />
          </div>
        </CardHeader>
        <CardContent className="p-0 overflow-hidden">
          <div className="hidden lg:block overflow-x-auto">
            <Table className="w-full">
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
                        <div className="text-xs text-muted-foreground flex flex-wrap gap-1">
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
                    <TableCell className="text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        <EditProductDialog productId={product._id} />
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
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(product._id, product.name)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="mr-1 h-4 w-4" /> Remove
                        </Button>
                      </div>
                    </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="lg:hidden space-y-4 p-4">
            {items.length === 0 ? (
              <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                No products found
              </div>
            ) : (
              items.map((product) => (
                <div key={product._id} className="rounded-xl border bg-card p-4 shadow-sm space-y-3">
                  <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-start">
                    <div>
                      <p className="font-medium leading-tight">{product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {product.sku}
                        {product.category ? ` • ${product.category.name}` : ''}
                      </p>
                    </div>
                    <div className="text-sm sm:text-right">
                      <p className="font-semibold">{formatCurrency(product.discountPrice ?? product.price)}</p>
                      {product.discountPrice ? (
                        <p className="text-xs text-muted-foreground line-through">{formatCurrency(product.price)}</p>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 text-sm">
                    <Badge variant={product.isActive ? 'default' : 'secondary'}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    {product.isFeatured ? (
                      <Badge variant="outline" className="gap-1">
                        <Star className="h-3 w-3" /> Featured
                      </Badge>
                    ) : null}
                    <span className="text-xs text-muted-foreground">Stock: {product.stock}</span>
                    <span className="text-xs text-muted-foreground">Sold: {product.sold}</span>
                  </div>

                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                    <EditProductDialog
                      productId={product._id}
                      trigger={
                        <Button variant="outline" size="sm" className="w-full sm:w-auto">
                          <Pencil className="mr-1 h-4 w-4" />
                          Edit
                        </Button>
                      }
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto"
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
                      className="w-full sm:w-auto"
                      onClick={() => handleToggle(product._id, 'isFeatured', product.isFeatured)}
                      disabled={updateMutation.isPending}
                    >
                      <Star className="mr-1 h-4 w-4" />
                      {product.isFeatured ? 'Unmark' : 'Feature'}
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="w-full sm:w-auto"
                      onClick={() => handleDelete(product._id, product.name)}
                      disabled={deleteMutation.isPending}
                    >
                      <Trash2 className="mr-1 h-4 w-4" /> Remove
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
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
