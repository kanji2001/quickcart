import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Flame, Clock, Percent } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { ProductCardSkeleton } from '@/components/ProductCardSkeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useProducts } from '@/hooks/products/use-products';
import { formatCurrency } from '@/lib/utils';

export default function Deals() {
  const [sortBy, setSortBy] = useState('discount-high');
  const productsQuery = useProducts({ limit: 48, sort: '-price', isActive: true });

  const dealsProducts = useMemo(() => {
    const items = productsQuery.data?.items ?? [];
    return items.filter((product) => product.discountPrice && product.discountPrice < product.price);
  }, [productsQuery.data]);

  const getDiscountPercentage = (price: number, discountPrice: number) => {
    return Math.round(((price - discountPrice) / price) * 100);
  };

  const sortedProducts = useMemo(() => {
    const products = [...dealsProducts];
    return products.sort((a, b) => {
      const discountA = getDiscountPercentage(a.price, a.discountPrice || a.price);
      const discountB = getDiscountPercentage(b.price, b.discountPrice || b.price);

      switch (sortBy) {
        case 'discount-high':
          return discountB - discountA;
        case 'discount-low':
          return discountA - discountB;
        case 'price-low':
          return (a.discountPrice || a.price) - (b.discountPrice || b.price);
        case 'price-high':
          return (b.discountPrice || b.price) - (a.discountPrice || a.price);
        default:
          return 0;
      }
    });
  }, [dealsProducts, sortBy]);

  const totalSavings = dealsProducts.reduce((acc, product) => {
    return acc + (product.price - (product.discountPrice || product.price));
  }, 0);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  } as const;

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  } as const;

  const renderDealsGrid = () => {
    if (productsQuery.isLoading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 12 }).map((_, index) => (
            <ProductCardSkeleton key={index} />
          ))}
        </div>
      );
    }

    if (productsQuery.isError) {
      return (
        <ErrorState
          description="We couldn't load deals right now."
          onRetry={() => {
            void productsQuery.refetch();
          }}
        />
      );
    }

    if (sortedProducts.length === 0) {
      return (
        <EmptyState
          title="No Active Deals"
          description="Check back soon for amazing offers!"
        />
      );
    }

    return (
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {sortedProducts.map((product, index) => (
          <motion.div key={product._id} variants={item}>
            <ProductCard product={product} index={index} />
          </motion.div>
        ))}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-5" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Flame className="w-8 h-8 text-destructive animate-pulse" />
              <Badge className="gradient-primary border-0 text-white px-4 py-1">Limited Time Offers</Badge>
              <Flame className="w-8 h-8 text-destructive animate-pulse" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Amazing{' '}
              <span className="gradient-primary bg-clip-text text-transparent">Deals & Offers</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-6">Save big on your favorite products with exclusive discounts</p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <Percent className="w-5 h-5 text-primary" />
                <span>
                  <strong className="text-2xl gradient-primary bg-clip-text text-transparent">
                    {productsQuery.isLoading ? '—' : dealsProducts.length}
                  </strong>{' '}
                  Products on Sale
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <span>
                  Total savings up to{' '}
                  <strong className="text-2xl gradient-primary bg-clip-text text-transparent">
                    {productsQuery.isLoading ? '—' : formatCurrency(totalSavings)}
                  </strong>
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters & Sort */}
      <section className="border-b bg-background/50 backdrop-blur-sm sticky top-16 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {productsQuery.isLoading
                  ? 'Loading deals...'
                  : productsQuery.isError
                  ? 'Unable to load deals'
                  : `Showing ${sortedProducts.length} deals`}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <Select value={sortBy} onValueChange={setSortBy} disabled={productsQuery.isLoading || productsQuery.isError}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Sort deals" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="discount-high">Highest Discount</SelectItem>
                  <SelectItem value="discount-low">Lowest Discount</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </section>

      {/* Deals Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">{renderDealsGrid()}</div>
      </section>

      {/* CTA Banner */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-2xl overflow-hidden glass-effect p-8 md:p-12 text-center"
          >
            <div className="absolute inset-0 gradient-primary opacity-10" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Don't Miss Out on Future Deals!</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Subscribe to our newsletter and be the first to know about exclusive offers, flash sales, and special discounts.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <button className="px-6 py-3 gradient-primary text-white rounded-lg font-medium hover:shadow-glow transition-all whitespace-nowrap">
                  Subscribe
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
