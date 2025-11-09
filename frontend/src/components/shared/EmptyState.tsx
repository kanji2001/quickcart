type EmptyStateProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export const EmptyState = ({ title, description, action }: EmptyStateProps) => (
  <div className="text-center py-16 space-y-4">
    <h3 className="text-xl font-semibold">{title}</h3>
    {description ? <p className="text-muted-foreground">{description}</p> : null}
    {action}
  </div>
);

