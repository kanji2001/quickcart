import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight, Heart, Minus, Plus, ShoppingCart, Shield, Star, Truck } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProductCard } from '@/components/ProductCard';
import { ProductCardSkeleton } from '@/components/ProductCardSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { LoadingState } from '@/components/shared/LoadingState';
import { useProductDetail } from '@/hooks/products/use-product-detail';
import { useCartStore } from '@/stores/cart-store';
import { useAuthStore, selectIsAuthenticated } from '@/stores/auth-store';
import { useAddCartItemMutation, useCartQuery, useUpdateCartItemMutation } from '@/hooks/cart/use-cart';
import { toast } from 'sonner';
import { productsApi } from '@/api/products';
import { formatCurrency } from '@/lib/utils';

const ProductNotFound = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="text-center space-y-4">
      <h2 className="text-2xl font-bold">Product not found</h2>
      <Button asChild>
        <Link to="/products">Back to Products</Link>
      </Button>
    </div>
  </div>
);

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { openCart } = useCartStore();
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const addToCartMutation = useAddCartItemMutation();
  const updateCartItemMutation = useUpdateCartItemMutation();
  const { data: cart } = useCartQuery();

  const productQuery = useProductDetail(id ?? '');

  const relatedQuery = useQuery({
    queryKey: ['products', 'related', id],
    queryFn: async () => {
      if (!id) return [];
      const { data } = await productsApi.related(id);
      return data.data.items;
    },
    enabled: Boolean(id),
  });

  const product = productQuery.data;
  const cartItem = useMemo(() => {
    if (!cart || !product) return undefined;
    return cart.items.find((item) => item.product._id === product._id);
  }, [cart, product]);

  const discountPercentage = useMemo(() => {
    if (!product?.discountPrice || product.price <= 0) return 0;
    return Math.round(((product.price - product.discountPrice) / product.price) * 100);
  }, [product]);

  const productImages = useMemo(() => {
    if (!product) return [];
    const images = product.images?.map((item) => item.url) ?? [];
    if (product.thumbnail?.url) {
      return [product.thumbnail.url, ...images.filter((img) => img !== product.thumbnail?.url)];
    }
    return images.length > 0 ? images : ['https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80'];
  }, [product]);

  const handleAddToCart = () => {
    if (!product) return;

    if (!isAuthenticated) {
      toast.info('Please sign in to add items to your cart');
      return;
    }

    const productId = product._id;
    if (cartItem) {
      const nextQuantity = cartItem.quantity + quantity;
      updateCartItemMutation.mutate(
        { itemId: cartItem._id, quantity: nextQuantity },
        {
          onSuccess: () => {
            toast.success('Cart updated', {
              description: `${product.name} quantity increased to ${nextQuantity}.`,
              action: {
                label: 'View Cart',
                onClick: openCart,
              },
            });
          },
          onError: (error) => {
            const description = error instanceof Error ? error.message : 'Please try again.';
            toast.error('Unable to update cart', { description });
          },
        },
      );
      return;
    }

    addToCartMutation.mutate(
      { productId, quantity },
      {
        onSuccess: () => {
          toast.success('Added to cart!', {
            description: `${product.name} (×${quantity}) added to your cart.`,
              action: {
                label: 'View Cart',
                onClick: openCart,
              },
          });
        },
        onError: (error) => {
          const description = error instanceof Error ? error.message : 'Please try again.';
          toast.error('Unable to add to cart', { description });
        },
      },
    );
  };

  if (productQuery.isLoading) {
    return <LoadingState message="Loading product..." />;
  }

  if (productQuery.isError) {
    return (
      <ErrorState
        description="We couldn't load product details."
        onRetry={() => {
          void productQuery.refetch();
        }}
      />
    );
  }

  if (!product) {
    return <ProductNotFound />;
  }

  const specificationsEntries = Object.entries(product.specifications ?? {});
  const features = product.features ?? [];
  const relatedProducts = relatedQuery.data ?? [];
  const stock = product.stock ?? 0;
  const remainingStock = stock > 0 ? Math.max(0, stock - (cartItem?.quantity ?? 0)) : stock;
  const addMutationPending = addToCartMutation.isPending || updateCartItemMutation.isPending;
  const canAddMore = stock === 0 ? false : cartItem ? remainingStock > 0 : true;
  const canIncreaseQuantity =
    stock > 0
      ? cartItem
        ? remainingStock > 0 && quantity < remainingStock
        : quantity < stock
      : false;

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <motion.nav initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
          <Link to="/" className="hover:text-foreground transition-colors">
            Home
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link to="/products" className="hover:text-foreground transition-colors">
            Products
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground">{product.name}</span>
        </motion.nav>

        <div className="grid lg:grid-cols-2 gap-12 mb-16">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="aspect-square rounded-xl overflow-hidden border bg-muted">
              <img src={productImages[selectedImage]} alt={product.name} className="w-full h-full object-cover" />
            </div>
            {productImages.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {productImages.map((image, index) => (
                  <button
                    key={image}
                    type="button"
                    onClick={() => setSelectedImage(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <img src={image} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="flex gap-2">
              {product.isNew && <Badge className="gradient-primary border-0">New</Badge>}
              {discountPercentage > 0 && <Badge variant="destructive">-{discountPercentage}% OFF</Badge>}
            </div>

            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">{product.brand}</p>
              <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < Math.round(product.rating ?? 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
                <span className="ml-2 font-semibold">{product.rating?.toFixed(1) ?? '0.0'}</span>
              </div>
              <span className="text-muted-foreground">({product.numReviews ?? 0} reviews)</span>
            </div>

            <div className="flex items-baseline gap-4">
              <span className="text-4xl font-bold">{formatCurrency(product.discountPrice ?? product.price)}</span>
              {product.discountPrice && <span className="text-2xl text-muted-foreground line-through">{formatCurrency(product.price)}</span>}
            </div>

            <Separator />

            <p className="text-muted-foreground leading-relaxed">{product.description}</p>

            <div className="flex items-center gap-2">
              {stock > 0 ? (
                <>
                  <div className="w-2 h-2 rounded-full bg-success" />
                  <span className="text-sm">{stock} items in stock</span>
                </>
              ) : (
                <>
                  <div className="w-2 h-2 rounded-full bg-destructive" />
                  <span className="text-sm text-destructive">Out of stock</span>
                </>
              )}
            </div>

            <div className="space-y-4">
              {cartItem ? (
                <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                  <div className="font-medium text-foreground">
                    Already in your cart: <span className="font-semibold">{cartItem.quantity}</span>
                  </div>
                  {stock > 0 ? (
                    remainingStock > 0 ? (
                      <p>You can add up to {remainingStock} more item{remainingStock === 1 ? '' : 's'}.</p>
                    ) : (
                      <p>You&apos;ve reached the maximum available quantity.</p>
                    )
                  ) : (
                    <p>This product is currently unavailable.</p>
                  )}
                </div>
              ) : null}
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-lg">
                  <Button variant="ghost" size="icon" onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}>
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="px-4 font-semibold">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      setQuantity((prev) => {
                        if (stock <= 0) return prev;
                        const max = cartItem ? Math.max(1, remainingStock) : stock;
                        return Math.min(max, prev + 1);
                      })
                    }
                    disabled={!canIncreaseQuantity}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="flex gap-3 flex-wrap">
                <Button
                  onClick={handleAddToCart}
                  disabled={stock === 0 || addMutationPending || (cartItem ? !canAddMore : false)}
                  className="flex-1 min-w-[12rem] gradient-primary"
                  size="lg"
                >
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {addMutationPending
                    ? 'Updating...'
                    : cartItem
                      ? canAddMore
                        ? 'Add More'
                        : 'Max Added'
                      : 'Add to Cart'}
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => openCart()}
                  className="flex-1 min-w-[12rem]"
                >
                  View Cart
                </Button>
                <Button variant="outline" size="lg" onClick={() => toast.info('Added to wishlist')}>
                  <Heart className="w-5 h-5" />
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Truck className="w-5 h-5 text-primary" />
                <div className="text-sm">
                  <div className="font-medium">Free Shipping</div>
                  <div className="text-muted-foreground">On orders over ₹7,500</div>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                <Shield className="w-5 h-5 text-primary" />
                <div className="text-sm">
                  <div className="font-medium">Secure Payment</div>
                  <div className="text-muted-foreground">100% protected</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-16">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="specifications">Specifications</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-6">
              <div className="prose max-w-none">
                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              </div>
            </TabsContent>
            <TabsContent value="specifications" className="mt-6">
              {specificationsEntries.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {specificationsEntries.map(([key, value]) => (
                    <div key={key} className="flex justify-between p-4 rounded-lg bg-muted/50">
                      <span className="font-medium capitalize">{key}</span>
                      <span className="text-muted-foreground">{String(value)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="Specifications coming soon" description="We're working on adding more details for this item." />
              )}
            </TabsContent>
            <TabsContent value="features" className="mt-6">
              {features.length > 0 ? (
                <ul className="space-y-3">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <EmptyState title="Features coming soon" description="We're curating highlights for this product." />
              )}
            </TabsContent>
          </Tabs>
        </motion.div>

        <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          {relatedQuery.isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))}
            </div>
          ) : relatedProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct, index) => (
                <ProductCard key={relatedProduct._id} product={relatedProduct} index={index} />
              ))}
            </div>
          ) : (
            <EmptyState title="No related products" description="Explore other categories to find similar items." />
          )}
        </motion.section>
      </div>
    </div>
  );
}
