import { useAdminDashboard } from '@/hooks/admin/use-admin-dashboard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/utils/number';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const MetricCard = ({ label, value, helper }: { label: string; value: string | number; helper?: string }) => (
  <Card className="shadow-sm">
    <CardHeader>
      <CardTitle className="text-sm text-muted-foreground font-medium">{label}</CardTitle>
    </CardHeader>
    <CardContent>
      <p className="text-2xl font-semibold">{value}</p>
      {helper ? <p className="text-xs text-muted-foreground mt-2">{helper}</p> : null}
    </CardContent>
  </Card>
);

const DashboardLoading = () => (
  <div className="space-y-6">
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: 4 }).map((_, index) => (
        <Card key={index} className="shadow-sm">
          <CardContent className="space-y-3 pt-6">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-7 w-20" />
            <Skeleton className="h-3 w-16" />
          </CardContent>
        </Card>
      ))}
    </div>
    <div className="grid gap-4 lg:grid-cols-2">
      <Card className="shadow-sm">
        <CardHeader>
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
      <Card className="shadow-sm">
        <CardHeader>
          <Skeleton className="h-4 w-28" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-40 w-full" />
        </CardContent>
      </Card>
    </div>
  </div>
);

export const AdminDashboard = () => {
  const { data, isLoading, isError, refetch } = useAdminDashboard();

  if (isLoading) {
    return <DashboardLoading />;
  }

  if (isError || !data) {
    return (
      <Card className="shadow-sm">
        <CardContent className="py-12 text-center space-y-3">
          <p className="text-muted-foreground">We couldn't load admin metrics right now.</p>
          <Button onClick={() => refetch()}>Try again</Button>
        </CardContent>
      </Card>
    );
  }

  const { totals, recentOrders, lowStockProducts, topProducts } = data;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Total Revenue" value={formatCurrency(totals.revenue)} helper="Completed payments" />
        <MetricCard label="Orders" value={totals.orders} helper={`Delivered ${totals.deliveredOrders}`} />
        <MetricCard label="Active Products" value={totals.products} />
        <MetricCard label="Customers" value={totals.users} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Recent Orders</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No recent orders yet
                    </TableCell>
                  </TableRow>
                ) : (
                  recentOrders.map((order) => (
                    <TableRow key={order.orderNumber}>
                      <TableCell>
                        <div className="font-medium">{order.orderNumber}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(order.createdAt ?? '').toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{order.user?.name ?? 'Guest'}</div>
                        <div className="text-xs text-muted-foreground">{order.user?.email}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {order.orderStatus}
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
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Low Stock Products</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>Sold</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStockProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      Inventory looks healthy
                    </TableCell>
                  </TableRow>
                ) : (
                  lowStockProducts.map((product) => (
                    <TableRow key={product._id}>
                      <TableCell>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-xs text-muted-foreground">{product.sku}</div>
                      </TableCell>
                      <TableCell>{product.stock}</TableCell>
                      <TableCell>{product.sold}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/admin/products?sku=${product.sku}`}>Manage</Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Top Performing Products</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Sold</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topProducts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    No data yet
                  </TableCell>
                </TableRow>
              ) : (
                topProducts.map((product) => (
                  <TableRow key={product._id}>
                    <TableCell>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-xs text-muted-foreground">{product.sku}</div>
                    </TableCell>
                    <TableCell>{product.sold}</TableCell>
                    <TableCell className="text-right">{formatCurrency(product.price * product.sold)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
