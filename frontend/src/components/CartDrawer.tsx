import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Minus, Trash2, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCartStore } from '@/stores/cart-store';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

export function CartDrawer() {
  const { items, isOpen, toggleCart, removeItem, updateQuantity, getTotalPrice } = useCartStore();
  
  const totalPrice = getTotalPrice();
  const shipping = totalPrice > 0 ? (totalPrice > 100 ? 0 : 10) : 0;
  const tax = totalPrice * 0.1;
  const finalTotal = totalPrice + shipping + tax;

  return (
    <>
      {/* Backdrop */}
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

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[400px] bg-background border-l shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-bold">Shopping Cart</h2>
                <p className="text-sm text-muted-foreground">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={toggleCart}>
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Cart Items */}
            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
                  <ShoppingBag className="w-10 h-10 text-muted-foreground" />
                </div>
                <h3 className="font-semibold text-lg mb-2">Your cart is empty</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Add some products to get started!
                </p>
                <Button onClick={toggleCart} asChild className="gradient-primary">
                  <Link to="/products">Continue Shopping</Link>
                </Button>
              </div>
            ) : (
              <>
                <ScrollArea className="flex-1 p-6">
                  <div className="space-y-4">
                    {items.map((item, index) => (
                      <motion.div
                        key={item.product.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex gap-4 p-3 rounded-lg border bg-card"
                      >
                        {/* Image */}
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-20 h-20 object-cover rounded-md"
                        />

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm line-clamp-2 mb-1">
                            {item.product.name}
                          </h4>
                          <p className="text-sm font-bold">
                            ${item.product.discountPrice || item.product.price}
                          </p>

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2 mt-2">
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-7 w-7"
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
                            <span className="text-sm font-medium w-8 text-center">
                              {item.quantity}
                            </span>
                            <Button
                              size="icon"
                              variant="outline"
                              className="h-7 w-7"
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              disabled={item.quantity >= item.product.stock}
                            >
                              <Plus className="w-3 h-3" />
                            </Button>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7 ml-auto text-destructive"
                              onClick={() => removeItem(item.product.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>

                {/* Footer */}
                <div className="border-t p-6 space-y-4">
                  {/* Price Breakdown */}
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-medium">${totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="font-medium">
                        {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tax</span>
                      <span className="font-medium">${tax.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between text-base">
                      <span className="font-bold">Total</span>
                      <span className="font-bold">${finalTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  {totalPrice < 100 && totalPrice > 0 && (
                    <p className="text-xs text-center text-muted-foreground">
                      Add ${(100 - totalPrice).toFixed(2)} more for free shipping
                    </p>
                  )}

                  {/* Actions */}
                  <div className="space-y-2">
                    <Button asChild className="w-full gradient-primary" size="lg">
                      <Link to="/checkout" onClick={toggleCart}>
                        Proceed to Checkout
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={toggleCart}
                      asChild
                    >
                      <Link to="/products">Continue Shopping</Link>
                    </Button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
