import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { useCategories } from '@/hooks/categories/use-categories';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
} as const;

const CategorySkeletonGrid = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {Array.from({ length: 8 }).map((_, index) => (
      <Skeleton key={index} className="h-72 rounded-xl" />
    ))}
  </div>
);

export default function Categories() {
  const categoriesQuery = useCategories();
  const categories = categoriesQuery.data ?? [];

  const renderCategoryGrid = () => {
    if (categoriesQuery.isLoading) {
      return <CategorySkeletonGrid />;
    }

    if (categoriesQuery.isError) {
      return (
        <ErrorState
          description="Unable to load categories."
          onRetry={() => {
            void categoriesQuery.refetch();
          }}
        />
      );
    }

    if (categories.length === 0) {
      return (
        <EmptyState
          title="No categories yet"
          description="Once products are added you'll see categories here."
          action={
            <Button size="sm" variant="outline" asChild>
              <Link to="/products">Browse Products</Link>
            </Button>
          }
        />
      );
    }

    return (
      <motion.div variants={containerVariants} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {categories.map((category) => (
          <motion.div key={category._id} variants={itemVariants}>
            <Link to={`/products?category=${category.slug}`}>
              <Card className="group overflow-hidden hover:shadow-glow transition-all duration-300 h-full">
                <CardContent className="p-0">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={category.image?.url ?? 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80'}
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-xl font-bold text-white mb-1">{category.name}</h3>
                      <Badge variant="secondary" className="bg-white/20 text-white backdrop-blur-sm">
                        {category.description ? category.description : 'Shop Now'}
                      </Badge>
                    </div>
                  </div>
                  <div className="p-6">
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {category.description ?? 'Browse products in this category.'}
                    </p>
                    <div className="flex items-center text-primary font-medium group-hover:gap-2 transition-all">
                      Shop Now
                      <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 gradient-primary opacity-5" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              Explore Our <span className="gradient-primary bg-clip-text text-transparent">Categories</span>
            </h1>
            <p className="text-lg text-muted-foreground">Discover thousands of products across all your favorite categories</p>
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">{renderCategoryGrid()}</div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative rounded-2xl overflow-hidden glass-effect p-8 md:p-12"
          >
            <div className="absolute inset-0 gradient-primary opacity-10" />
            <div className="relative z-10 text-center max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Can't Find What You're Looking For?</h2>
              <p className="text-muted-foreground mb-6">Use our advanced search to find exactly what you need</p>
              <Link
                to="/products"
                className="inline-flex items-center gap-2 px-6 py-3 gradient-primary text-white rounded-lg font-medium hover:shadow-glow transition-all"
              >
                Browse All Products
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
