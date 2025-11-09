import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { Product } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/stores/cart-store';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
  index?: number;
}

export function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addItem, toggleCart } = useCartStore();
  
  const discountPercentage = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
    toast.success('Added to cart!', {
      description: `${product.name} has been added to your cart.`,
      action: {
        label: 'View Cart',
        onClick: toggleCart,
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      className="group"
    >
      <Link to={`/products/${product.id}`}>
        <div className="bg-card rounded-xl shadow-card hover:shadow-lg transition-all duration-300 overflow-hidden border">
          {/* Image Container */}
          <div className="relative aspect-square overflow-hidden bg-muted">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
            />
            
            {/* Badges */}
            <div className="absolute top-3 left-3 flex flex-col gap-2">
              {product.isNew && (
                <Badge className="gradient-primary border-0">New</Badge>
              )}
              {discountPercentage > 0 && (
                <Badge variant="destructive">-{discountPercentage}%</Badge>
              )}
            </div>

            {/* Wishlist Button */}
            <Button
              size="icon"
              variant="secondary"
              className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.preventDefault();
                toast.info('Added to wishlist');
              }}
            >
              <Heart className="w-4 h-4" />
            </Button>

            {/* Quick Add to Cart - Shows on hover */}
            <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <Button
                onClick={handleAddToCart}
                className="w-full gradient-primary"
                size="sm"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
            </div>
          </div>

          {/* Product Info */}
          <div className="p-4 space-y-2">
            {/* Brand */}
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              {product.brand}
            </p>

            {/* Name */}
            <h3 className="font-semibold text-sm line-clamp-2 min-h-[2.5rem]">
              {product.name}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-1">
              <div className="flex items-center">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium ml-1">{product.rating}</span>
              </div>
              <span className="text-xs text-muted-foreground">
                ({product.reviewCount})
              </span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold">
                ${product.discountPrice || product.price}
              </span>
              {product.discountPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  ${product.price}
                </span>
              )}
            </div>

            {/* Stock Status */}
            {product.stock < 10 && product.stock > 0 && (
              <p className="text-xs text-orange-500">
                Only {product.stock} left in stock
              </p>
            )}
            {product.stock === 0 && (
              <p className="text-xs text-destructive">Out of stock</p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
