import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOrders, useCancelOrder } from '@/hooks/orders/use-orders';
import { useAuthStore, selectIsAuthenticated } from '@/stores/auth-store';
import { OrderCard } from '@/components/orders/OrderCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { Button } from '@/components/ui/button';

const Orders = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore(selectIsAuthenticated);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  const { data, isLoading, isError, refetch } = useOrders();
  const cancelOrder = useCancelOrder();

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return <LoadingState message="Loading your orders..." />;
  }

  if (isError) {
    return (
      <ErrorState
        description="We couldn't load your orders. Please try again."
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  const orders = data?.items ?? [];

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <EmptyState
          title="No orders yet"
          description="Start shopping to see your orders here."
          action={
            <Button onClick={() => navigate('/products')} className="gradient-primary">
              Browse Products
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">My Orders</h1>
        <p className="text-muted-foreground">Track and manage your recent purchases.</p>
      </div>

      <div className="space-y-6">
        {orders.map((order) => (
          <OrderCard
            key={order._id}
            order={order as any}
            onCancel={(orderId) => cancelOrder.mutate({ id: orderId })}
            isCancelling={cancelOrder.isPending}
          />
        ))}
      </div>
    </div>
  );
};

export default Orders;

