import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Order } from '@/types/order';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { formatCurrency } from '@/lib/utils';

type OrderCardProps = {
  order: Order;
  onCancel?: (orderId: string) => void;
  isCancelling?: boolean;
};

export const OrderCard = ({ order, onCancel, isCancelling }: OrderCardProps) => {
  const createdAt = order.createdAt ? format(new Date(order.createdAt), 'dd MMM yyyy, HH:mm') : '';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <div>
          <CardTitle className="text-lg">Order {order.orderNumber}</CardTitle>
          <p className="text-sm text-muted-foreground">{createdAt}</p>
        </div>
        <Badge variant={order.orderStatus === 'delivered' ? 'default' : 'secondary'} className="uppercase">
          {order.orderStatus}
        </Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {order.items.map((item) => (
            <div key={item.product.toString()} className="flex items-center justify-between text-sm">
              <div>
                <p className="font-medium">{item.productName}</p>
                <p className="text-xs text-muted-foreground">
                  Qty {item.quantity} · {formatCurrency(item.price)}
                </p>
              </div>
              <p className="font-semibold">{formatCurrency(item.subtotal)}</p>
            </div>
          ))}
        </div>

        <div className="border-t pt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Shipping</span>
            <span>{formatCurrency(order.shippingCharges)}</span>
          </div>
            <div className="flex justify-between">
            <span className="text-muted-foreground">Tax</span>
            <span>{formatCurrency(order.taxAmount)}</span>
          </div>
          {order.discountAmount > 0 ? (
            <div className="flex justify-between text-success">
              <span>Discount</span>
              <span>-{formatCurrency(order.discountAmount)}</span>
            </div>
          ) : null}
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>

        {order.orderStatus === 'pending' || order.orderStatus === 'processing' ? (
          <Button
            variant="outline"
            onClick={() => onCancel?.(order._id)}
            disabled={isCancelling}
            className="w-fit"
          >
            {isCancelling ? 'Cancelling...' : 'Cancel Order'}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
};

