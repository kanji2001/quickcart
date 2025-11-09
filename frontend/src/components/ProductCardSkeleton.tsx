import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export const ProductCardSkeleton = () => (
  <Card className="overflow-hidden">
    <Skeleton className="aspect-square w-full" />
    <CardContent className="space-y-3 pt-4">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-4 w-full" />
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-10" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="h-5 w-24" />
    </CardContent>
  </Card>
);

