import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { SlidersHorizontal, X } from 'lucide-react';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { useProducts } from '@/hooks/products/use-products';
import { useCategories } from '@/hooks/categories/use-categories';
import type { ProductQueryParams } from '@/api/products';

type SortOption = 'featured' | 'newest' | 'price-low' | 'price-high' | 'rating';

const sortValueMap: Record<SortOption, string> = {
  featured: 'featured',
  newest: 'newest',
  'price-low': 'price',
  'price-high': '-price',
  rating: 'rating',
};

const DEFAULT_PRICE_RANGE: [number, number] = [0, 100000];

type FilterState = {
  categories: string[];
  priceRange: [number, number];
  sortBy: SortOption;
};

const useProductFilters = () => {
  const [filters, setFilters] = useState<FilterState>({
    categories: [],
    priceRange: DEFAULT_PRICE_RANGE,
    sortBy: 'featured',
  });

  const updateCategory = (categoryId: string) => {
    setFilters((prev) => {
      const exists = prev.categories.includes(categoryId);
      return {
        ...prev,
        categories: exists ? prev.categories.filter((id) => id !== categoryId) : [...prev.categories, categoryId],
      };
    });
  };

  const updatePriceRange = (value: [number, number]) => {
    setFilters((prev) => ({ ...prev, priceRange: value }));
  };

  const updateSort = (value: SortOption) => {
    setFilters((prev) => ({ ...prev, sortBy: value }));
  };

  const resetFilters = () =>
    setFilters({
      categories: [],
      priceRange: DEFAULT_PRICE_RANGE,
      sortBy: 'featured',
    });

  return { filters, updateCategory, updatePriceRange, updateSort, resetFilters };
};

type FilterContentProps = {
  categories: { _id: string; name: string }[];
  selectedCategories: string[];
  priceRange: [number, number];
  onCategoryToggle: (id: string) => void;
  onPriceRangeChange: (value: [number, number]) => void;
  onClear: () => void;
};

const FilterContent = ({
  categories,
  selectedCategories,
  priceRange,
  onCategoryToggle,
  onPriceRangeChange,
  onClear,
}: FilterContentProps) => (
  <div className="space-y-6">
    <div>
      <h3 className="font-semibold mb-3">Categories</h3>
      <div className="space-y-2">
        {categories.map((category) => (
          <div key={category._id} className="flex items-center space-x-2">
            <Checkbox
              id={category._id}
              checked={selectedCategories.includes(category._id)}
              onCheckedChange={() => onCategoryToggle(category._id)}
            />
            <Label htmlFor={category._id} className="cursor-pointer text-sm">
              {category.name}
            </Label>
          </div>
        ))}
      </div>
    </div>

    <div>
      <h3 className="font-semibold mb-3">Price Range</h3>
      <div className="px-2">
        <Slider min={0} max={100000} step={100} value={priceRange} onValueChange={onPriceRangeChange} className="mb-4" />
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>${priceRange[0]}</span>
          <span>${priceRange[1]}</span>
        </div>
      </div>
    </div>

    {(selectedCategories.length > 0 ||
      priceRange[0] > DEFAULT_PRICE_RANGE[0] ||
      priceRange[1] < DEFAULT_PRICE_RANGE[1]) && (
      <Button variant="outline" onClick={onClear} className="w-full">
        <X className="w-4 h-4 mr-2" />
        Clear Filters
      </Button>
    )}
  </div>
);

const buildProductQuery = (filters: FilterState): ProductQueryParams => {
  const [minPrice, maxPrice] = filters.priceRange;
  return {
    category: filters.categories[0],
    minPrice,
    maxPrice,
    sort: sortValueMap[filters.sortBy],
    isActive: true,
  };
};

export default function Products() {
  const { filters, updateCategory, updatePriceRange, updateSort, resetFilters } = useProductFilters();
  const [showFilters, setShowFilters] = useState(false);

  const categoriesQuery = useCategories();
  const queryParams = useMemo(() => buildProductQuery(filters), [filters]);
  const productsQuery = useProducts(queryParams);

  const products = productsQuery.data?.items ?? [];
  const pagination = productsQuery.data?.pagination;

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold mb-2">All Products</h1>
          <p className="text-muted-foreground">
            Showing {products.length} {products.length === 1 ? 'product' : 'products'}
            {pagination ? ` of ${pagination.total}` : ''}
          </p>
        </motion.div>

        <div className="flex gap-8">
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="hidden lg:block w-64 flex-shrink-0"
          >
            <div className="sticky top-24 bg-card border rounded-xl p-6 shadow-card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-bold text-lg">Filters</h2>
              </div>
              <FilterContent
                categories={categoriesQuery.data ?? []}
                selectedCategories={filters.categories}
                priceRange={filters.priceRange}
                onCategoryToggle={updateCategory}
                onPriceRangeChange={(value) => updatePriceRange(value as [number, number])}
                onClear={resetFilters}
              />
            </div>
          </motion.aside>

          <div className="flex-1">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-6">
              <Sheet open={showFilters} onOpenChange={setShowFilters}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="lg:hidden">
                    <SlidersHorizontal className="w-4 h-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left">
                  <SheetHeader>
                    <SheetTitle>Filters</SheetTitle>
                    <SheetDescription>Refine your product search</SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 space-y-6">
                    <FilterContent
                      categories={categoriesQuery.data ?? []}
                      selectedCategories={filters.categories}
                      priceRange={filters.priceRange}
                      onCategoryToggle={updateCategory}
                      onPriceRangeChange={(value) => updatePriceRange(value as [number, number])}
                      onClear={resetFilters}
                    />
                  </div>
                </SheetContent>
              </Sheet>

              <Select value={filters.sortBy} onValueChange={(value: SortOption) => updateSort(value)}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Featured</SelectItem>
                  <SelectItem value="newest">Newest</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="rating">Highest Rated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {productsQuery.isLoading ? (
              <div className="py-16 text-center text-muted-foreground">Loading products...</div>
            ) : products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product, index) => (
                  <ProductCard key={product._id} product={product} index={index} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <h3 className="text-xl font-semibold mb-2">No products found</h3>
                <p className="text-muted-foreground mb-6">Try adjusting your filters</p>
                <Button onClick={resetFilters} variant="outline">
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
