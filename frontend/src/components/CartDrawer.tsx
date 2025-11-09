import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { LoadingState } from '@/components/shared/LoadingState';
import { useCartStore } from '@/stores/cart-store';
import { useCartQuery, useUpdateCartItemMutation, useRemoveCartItemMutation } from '@/hooks/cart/use-cart';

const CartHeader = ({ count, onClose }: { count: number; onClose: () => void }) => (
  <div className="flex items-center justify-between p-6 border-b">
    <div>
      <h2 className="text-xl font-bold">Shopping Cart</h2>
      <p className="text-sm text-muted-foreground">
        {count} {count === 1 ? 'item' : 'items'}
      </p>
    </div>
    <Button variant="ghost" size="icon" onClick={onClose}>
      <X className="w-5 h-5" />
    </Button>
  </div>
);

type CartSummaryProps = {
  subtotal: number;
  onClose: () => void;
};

const CartSummary = ({ subtotal, onClose }: CartSummaryProps) => {
  const shipping = subtotal > 0 ? (subtotal > 100 ? 0 : 10) : 0;
  const tax = subtotal * 0.1;
  const total = subtotal + shipping + tax;

  return (
    <div className="border-t p-6 space-y-4">
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Shipping</span>
          <span className="font-medium">{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-muted-foreground">Tax</span>
          <span className="font-medium">${tax.toFixed(2)}</span>
        </div>
        <Separator />
        <div className="flex justify-between text-base">
          <span className="font-bold">Total</span>
          <span className="font-bold">${total.toFixed(2)}</span>
        </div>
      </div>

      {subtotal > 0 && subtotal < 100 && (
        <p className="text-xs text-center text-muted-foreground">
          Add ${(100 - subtotal).toFixed(2)} more for free shipping
        </p>
      )}

      <div className="space-y-2">
        <Button asChild className="w-full gradient-primary" size="lg">
          <Link to="/checkout" onClick={onClose}>
            Proceed to Checkout
          </Link>
        </Button>
        <Button variant="outline" className="w-full" onClick={onClose} asChild>
          <Link to="/products">Continue Shopping</Link>
        </Button>
      </div>
    </div>
  );
};

type CartItemProps = {
  itemId: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
  stock?: number;
  onIncrease: () => void;
  onDecrease: () => void;
  onRemove: () => void;
};

const CartItem = ({
  itemId,
  name,
  image,
  price,
  quantity,
  stock,
  onIncrease,
  onDecrease,
  onRemove,
}: CartItemProps) => (
  <motion.div
    key={itemId}
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    className="flex gap-4 p-3 rounded-lg border bg-card"
  >
    <img src={image ?? '/placeholder.svg'} alt={name} className="w-20 h-20 object-cover rounded-md" />
    <div className="flex-1 min-w-0">
      <h4 className="font-medium text-sm line-clamp-2 mb-1">{name}</h4>
      <p className="text-sm font-bold">${price.toFixed(2)}</p>
      <div className="flex items-center gap-2 mt-2">
        <Button size="icon" variant="outline" className="h-7 w-7" onClick={onDecrease} disabled={quantity <= 1}>
          <Minus className="w-3 h-3" />
        </Button>
        <span className="text-sm font-medium w-8 text-center">{quantity}</span>
        <Button
          size="icon"
          variant="outline"
          className="h-7 w-7"
          onClick={onIncrease}
          disabled={stock !== undefined && quantity >= stock}
        >
          <Plus className="w-3 h-3" />
        </Button>
        <Button size="icon" variant="ghost" className="h-7 w-7 ml-auto text-destructive" onClick={onRemove}>
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </div>
  </motion.div>
);

const EmptyCartState = ({ onClose }: { onClose: () => void }) => (
  <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
      <ShoppingBag className="w-10 h-10 text-muted-foreground" />
    </div>
    <h3 className="font-semibold text-lg mb-2">Your cart is empty</h3>
    <p className="text-sm text-muted-foreground mb-6">Add some products to get started!</p>
    <Button onClick={onClose} asChild className="gradient-primary">
      <Link to="/products">Continue Shopping</Link>
    </Button>
  </div>
);

export function CartDrawer() {
  const { isOpen, toggleCart } = useCartStore();
  const { data: cart, isLoading, isError } = useCartQuery();
  const updateItemMutation = useUpdateCartItemMutation();
  const removeItemMutation = useRemoveCartItemMutation();
  const items = isError ? [] : cart?.items ?? [];
  const subtotal = isError ? 0 : cart?.totalAmount ?? 0;

  const handleDecrease = (id: string, quantity: number) => {
    if (quantity <= 1) {
      removeItemMutation.mutate(id);
      return;
    }
    updateItemMutation.mutate({ itemId: id, quantity: quantity - 1 });
  };

  const handleIncrease = (id: string, quantity: number) => {
    updateItemMutation.mutate({ itemId: id, quantity: quantity + 1 });
  };

  const handleRemove = (id: string) => {
    removeItemMutation.mutate(id);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={toggleCart}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[400px] bg-background border-l shadow-2xl z-50 flex flex-col"
          >
            <CartHeader count={items.length} onClose={toggleCart} />

            {isLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <LoadingState message="Loading your cart..." />
              </div>
            ) : isError ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
                <ShoppingBag className="w-10 h-10 text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-semibold">Sign in to view your cart</h3>
                  <p className="text-sm text-muted-foreground">Your cart is saved when you log in.</p>
                </div>
                <Button asChild className="gradient-primary">
                  <Link to="/login" onClick={toggleCart}>
                    Sign In
                  </Link>
                </Button>
              </div>
            ) : items.length === 0 ? (
              <EmptyCartState onClose={toggleCart} />
            ) : (
              <>
                <ScrollArea className="flex-1 p-6">
                  <div className="space-y-4">
                    {items.map((item) => (
                      <CartItem
                        key={item._id}
                        itemId={item._id}
                        name={item.product.name}
                        image={item.product.thumbnail?.url ?? item.product.images?.[0]?.url}
                        price={item.price}
                        quantity={item.quantity}
                        stock={item.product.stock}
                        onIncrease={() => handleIncrease(item._id, item.quantity)}
                        onDecrease={() => handleDecrease(item._id, item.quantity)}
                        onRemove={() => handleRemove(item._id)}
                      />
                    ))}
                  </div>
                </ScrollArea>

                <CartSummary subtotal={subtotal} onClose={toggleCart} />
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
