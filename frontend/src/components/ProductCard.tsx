import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import type { Product } from '@/types/product';
import { useCartStore } from '@/stores/cart-store';
import { useAddCartItemMutation, useCartQuery } from '@/hooks/cart/use-cart';
import { formatCurrency } from '@/lib/utils';

type ProductCardProps = {
  product: Product;
  index?: number;
};

const getDiscountPercent = (product: Product) => {
  if (!product.discountPrice || product.price <= 0) return 0;
  return Math.round(((product.price - product.discountPrice) / product.price) * 100);
};

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { openCart } = useCartStore();
  const addToCartMutation = useAddCartItemMutation();
  const { data: cart } = useCartQuery();

  const discountPercentage = getDiscountPercent(product);
  const productImage = product.thumbnail?.url ?? product.images?.[0]?.url ?? '/placeholder.svg';
  const productId = product._id;
  const productSlug = product.slug ?? product._id;
  const existingCartItem = cart?.items?.find((item) => item.product._id === productId);
  const isInCart = Boolean(existingCartItem);

  const handleAddToCart = (event: React.MouseEvent) => {
    event.preventDefault();
    if (isInCart) {
      addToCartMutation.mutate(
        { productId, quantity: 1 },
        {
          onSuccess: () => {
            toast.success('Cart updated', {
              description: `${product.name} quantity increased.`,
              action: {
                label: 'View Cart',
                onClick: openCart,
              },
            });
          },
          onError: () => {
            toast.error('Unable to update cart', {
              description: 'Please try again later.',
            });
          },
        },
      );
      return;
    }

    addToCartMutation.mutate(
      { productId, quantity: 1 },
      {
        onSuccess: () => {
          toast.success('Added to cart!', {
            description: `${product.name} has been added to your cart.`,
            action: {
              label: 'View Cart',
              onClick: openCart,
            },
          });
        },
        onError: () => {
          toast.error('Unable to add to cart', {
            description: 'Please try again later.',
          });
        },
      },
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      className="group"
    >
      <Link to={`/products/${productSlug}`}>
        <div className="bg-card rounded-xl shadow-card hover:shadow-lg transition-all duration-300 overflow-hidden border">
          <div className="relative aspect-square overflow-hidden bg-muted">
            <img
              src={productImage}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
            />
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {product.isNew && <Badge className="gradient-primary border-0">New</Badge>}
              {discountPercentage > 0 && <Badge variant="destructive">-{discountPercentage}%</Badge>}
              {isInCart && <Badge variant="secondary">In Cart</Badge>}
            </div>
            <Button
              size="icon"
              variant="secondary"
              className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(event) => {
                event.preventDefault();
                toast.info('Added to wishlist');
              }}
            >
              <Heart className="w-4 h-4" />
            </Button>
            <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              {isInCart ? (
                <div className="space-y-2">
                  <Button
                    onClick={handleAddToCart}
                    className="w-full gradient-primary"
                    size="sm"
                    disabled={addToCartMutation.isPending}
                  >
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    {addToCartMutation.isPending ? 'Updating...' : 'Add One More'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={(event) => {
                      event.preventDefault();
                      openCart();
                    }}
                  >
                    View Cart
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handleAddToCart}
                  className="w-full gradient-primary"
                  size="sm"
                  disabled={addToCartMutation.isPending}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  {addToCartMutation.isPending ? 'Adding...' : 'Add to Cart'}
                </Button>
              )}
            </div>
          </div>

          <div className="p-4 space-y-2">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">{product.brand}</p>
            <h3 className="font-semibold text-sm line-clamp-2 min-h-[2.5rem]">{product.name}</h3>
            <div className="flex items-center gap-1">
              <div className="flex items-center">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium ml-1">{product.rating?.toFixed(1) ?? '0.0'}</span>
              </div>
              <span className="text-xs text-muted-foreground">({product.numReviews ?? 0})</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold">{formatCurrency(product.discountPrice ?? product.price ?? 0)}</span>
              {product.discountPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  {formatCurrency(product.price ?? 0)}
                </span>
              )}
            </div>
            {product.stock < 10 && product.stock > 0 && (
              <p className="text-xs text-orange-500">Only {product.stock} left in stock</p>
            )}
            {product.stock === 0 && <p className="text-xs text-destructive">Out of stock</p>}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
