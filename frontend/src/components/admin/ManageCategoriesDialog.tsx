import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCategories } from '@/hooks/categories/use-categories';
import { useAdminCreateCategory, useAdminDeleteCategory } from '@/hooks/admin/use-admin-categories';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';
import { slugify } from '@/utils/string';
import { Loader2, Trash2 } from 'lucide-react';

const categorySchema = z.object({
  name: z.string().min(2, 'Name is required'),
  slug: z.string().min(1, 'Slug is required'),
  description: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

export const ManageCategoriesDialog = () => {
  const [open, setOpen] = useState(false);
  const categoriesQuery = useCategories();
  const createMutation = useAdminCreateCategory();
  const deleteMutation = useAdminDeleteCategory();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      slug: '',
      description: '',
    },
  });

  const watchedName = watch('name');

  const autoSlug = slugify(watchedName || '');

  const onSubmit = async (values: CategoryFormValues) => {
    try {
      await createMutation.mutateAsync(values);
      toast.success('Category added');
      reset({ name: '', slug: '', description: '' });
    } catch (error: any) {
      const message = error?.response?.data?.message ?? 'Failed to create category';
      toast.error(message);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const confirmed = window.confirm(`Delete category "${name}"?`);
    if (!confirmed) return;
    try {
      await deleteMutation.mutateAsync(id);
      toast.success('Category removed');
    } catch (error: any) {
      const message = error?.response?.data?.message ?? 'Unable to delete category';
      toast.error(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Manage Categories
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Manage Categories</DialogTitle>
          <DialogDescription>Add or remove catalogue categories.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-6 md:grid-cols-[1.2fr_1fr]">
          <div className="space-y-4">
            <form className="space-y-3" onSubmit={handleSubmit(onSubmit)}>
              <div className="space-y-2">
                <Label htmlFor="category-name">Name *</Label>
                <Input
                  id="category-name"
                  placeholder="e.g., Smart Home Gadgets"
                  {...register('name', {
                    onChange: (event) => {
                      setValue('slug', slugify(event.target.value));
                    },
                  })}
                />
                {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="category-slug">Slug *</Label>
                <Input id="category-slug" placeholder="smart-home-gadgets" {...register('slug')} />
                <p className="text-xs text-muted-foreground">Auto-generated from the name: {autoSlug}</p>
                {errors.slug ? <p className="text-sm text-destructive">{errors.slug.message}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="category-description">Description</Label>
                <Input id="category-description" placeholder="Optional short description" {...register('description')} />
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={isSubmitting || createMutation.isPending}
                  className="flex items-center gap-2"
                >
                  {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Add Category
                </Button>
              </DialogFooter>
            </form>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-medium">Existing Categories</p>
            <ScrollArea className="h-64 rounded-md border p-3">
              <div className="space-y-2">
                {categoriesQuery.data?.map((category) => (
                  <div key={category._id} className="flex items-center justify-between rounded-md border p-2">
                    <div>
                      <p className="font-medium text-sm">{category.name}</p>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {category.slug}
                      </Badge>
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(category._id, category.name)}
                      disabled={deleteMutation.isPending}
                      className="h-8 w-8"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {categoriesQuery.data && categoriesQuery.data.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No categories yet.</p>
                ) : null}
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

