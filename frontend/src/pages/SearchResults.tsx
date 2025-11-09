import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, Package, FolderOpen } from 'lucide-react';
import { productsApi } from '@/api/products';
import { useCategories } from '@/hooks/categories/use-categories';
import { ProductCard } from '@/components/ProductCard';
import { ProductCardSkeleton } from '@/components/ProductCardSkeleton';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import type { Product } from '@/types/product';

const ProductSkeletonGrid = () => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {Array.from({ length: 8 }).map((_, index) => (
      <ProductCardSkeleton key={index} />
    ))}
  </div>
);

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = (searchParams.get('q') ?? '').trim();
  const categoriesQuery = useCategories();

  const productsQuery = useQuery({
    queryKey: ['search', 'products', query],
    queryFn: async () => {
      const { data } = await productsApi.list({ search: query, limit: 24 });
      return data.data.items as Product[];
    },
    enabled: query.length > 0,
  });

  const matchedCategories = useMemo(() => {
    if (!query) return [];
    const categories = categoriesQuery.data ?? [];
    return categories.filter((category) => {
      const haystack = `${category.name} ${category.description ?? ''}`.toLowerCase();
      return haystack.includes(query.toLowerCase());
    });
  }, [categoriesQuery.data, query]);

  const showEmptyState = !query;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20 py-12">
      <div className="container mx-auto px-4 space-y-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full border bg-muted/40 px-4 py-1 text-sm text-muted-foreground">
            <Search className="h-4 w-4" />
            <span>Search</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">
            {query ? (
              <>
                Results for <span className="gradient-primary bg-clip-text text-transparent">“{query}”</span>
              </>
            ) : (
              'Find exactly what you need'
            )}
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            {query
              ? 'We searched across products and categories. Refine your query to discover more specific items.'
              : 'Start typing in the search bar above to explore products, categories, and more.'}
          </p>
        </motion.div>

        {showEmptyState ? (
          <div className="max-w-3xl mx-auto">
            <EmptyState
              title="Nothing searched yet"
              description="Enter a keyword in the search bar to see matching products, categories, and deals."
              action={
                <Button asChild>
                  <Link to="/products">Browse Popular Products</Link>
                </Button>
              }
            />
          </div>
        ) : (
          <>
            <section className="space-y-6">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <Package className="h-5 w-5 text-primary" />
                  Products
                </h2>
                <Button variant="outline" asChild size="sm">
                  <Link to={`/products?search=${encodeURIComponent(query)}`}>View all</Link>
                </Button>
              </div>

              {productsQuery.isLoading ? (
                <ProductSkeletonGrid />
              ) : productsQuery.isError ? (
                <ErrorState description="We couldn't load products right now." onRetry={() => productsQuery.refetch()} />
              ) : productsQuery.data && productsQuery.data.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {productsQuery.data.map((product, index) => (
                    <ProductCard key={product._id} product={product} index={index} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No products matched"
                  description="Try searching with different keywords or check out our latest arrivals."
                  action={
                    <Button variant="outline" asChild>
                      <Link to="/products">Browse Products</Link>
                    </Button>
                  }
                />
              )}
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-2">
                <FolderOpen className="h-5 w-5 text-primary" />
                <h2 className="text-2xl font-semibold">Categories</h2>
              </div>

              {categoriesQuery.isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Card key={index} className="animate-pulse">
                      <div className="h-32 bg-muted/60" />
                    </Card>
                  ))}
                </div>
              ) : categoriesQuery.isError ? (
                <ErrorState description="Unable to load categories." onRetry={() => categoriesQuery.refetch()} />
              ) : matchedCategories.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {matchedCategories.map((category) => (
                    <Card key={category._id} className="flex flex-col h-full overflow-hidden">
                      <CardHeader className="space-y-1">
                        <CardTitle className="text-lg">{category.name}</CardTitle>
                        {category.description ? (
                          <p className="text-sm text-muted-foreground line-clamp-2">{category.description}</p>
                        ) : null}
                      </CardHeader>
                      <CardContent className="flex-1">
                        <div className="aspect-video rounded-lg overflow-hidden bg-muted">
                          <img
                            src={
                              category.image?.url ??
                              'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80'
                            }
                            alt={category.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button variant="secondary" asChild className="w-full">
                          <Link to={`/products?category=${category.slug}`}>Browse category</Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <EmptyState
                  title="No categories matched"
                  description="We couldn't find any categories for this search."
                  action={
                    <Button variant="outline" asChild>
                      <Link to="/categories">View all categories</Link>
                    </Button>
                  }
                />
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}

