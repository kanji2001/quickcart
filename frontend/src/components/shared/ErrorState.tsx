type ErrorStateProps = {
  title?: string;
  description?: string;
  onRetry?: () => void;
};

export const ErrorState = ({ title = 'Something went wrong', description, onRetry }: ErrorStateProps) => (
  <div className="py-16 text-center space-y-4">
    <h3 className="text-xl font-semibold text-destructive">{title}</h3>
    {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
    {onRetry ? (
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground"
      >
        Try Again
      </button>
    ) : null}
  </div>
);

