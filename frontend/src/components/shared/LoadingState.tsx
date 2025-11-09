import { Skeleton } from '@/components/ui/skeleton';

type LoadingStateProps = {
  message?: string;
};

export const LoadingState = ({ message }: LoadingStateProps) => (
  <div className="py-16 flex flex-col items-center space-y-4">
    <Skeleton className="h-6 w-48" />
    {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
  </div>
);

