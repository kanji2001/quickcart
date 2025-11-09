import { useEffect, useMemo, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Pencil } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ManageCategoriesDialog } from '@/components/admin/ManageCategoriesDialog';
import { slugify } from '@/utils/string';
import { useCategories } from '@/hooks/categories/use-categories';
import { useAdminProduct, useAdminUpdateProduct } from '@/hooks/admin/use-admin-products';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const editProductSchema = z
  .object({
    name: z.string().min(2, 'Name is required'),
    slug: z.string().min(1, 'Slug is required'),
    sku: z.string().min(1, 'SKU is required'),
    category: z.string().min(1, 'Category is required'),
    price: z
      .string()
      .refine((value) => !Number.isNaN(Number(value)) && Number(value) > 0, 'Price must be a positive number'),
    discountPrice: z
      .string()
      .optional()
      .refine((value) => value === undefined || value === '' || (!Number.isNaN(Number(value)) && Number(value) >= 0), {
        message: 'Discount price must be a number',
      }),
    stock: z
      .string()
      .refine((value) => !Number.isNaN(Number(value)) && Number(value) >= 0, 'Stock must be a non-negative number'),
    description: z.string().min(10, 'Description should be at least 10 characters'),
    tags: z.string().optional(),
    features: z.string().optional(),
    isActive: z.boolean().default(true),
    isFeatured: z.boolean().default(false),
    image: z
      .any()
      .optional()
      .refine(
        (files) =>
          files === undefined ||
          (files instanceof FileList && files.length === 0) ||
          (files instanceof FileList && (files.item(0)?.size ?? 0) <= MAX_IMAGE_SIZE),
        'Image must be 5MB or less',
      ),
  })
  .superRefine((val, ctx) => {
    if (val.discountPrice && Number(val.discountPrice) >= Number(val.price)) {
      ctx.addIssue({
        path: ['discountPrice'],
        code: z.ZodIssueCode.custom,
        message: 'Discount price must be less than price',
      });
    }
  });

type EditProductValues = z.infer<typeof editProductSchema>;

type EditProductDialogProps = {
  productId: string;
  trigger?: React.ReactNode;
};

export const EditProductDialog = ({ productId, trigger }: EditProductDialogProps) => {
  const [open, setOpen] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const categoriesQuery = useCategories();
  const { data: product, isLoading, isFetching } = useAdminProduct(productId, open);
  const updateMutation = useAdminUpdateProduct();

  const categories = useMemo(() => categoriesQuery.data ?? [], [categoriesQuery.data]);

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EditProductValues>({
    resolver: zodResolver(editProductSchema),
    defaultValues: {
      name: '',
      slug: '',
      sku: '',
      category: '',
      price: '',
      discountPrice: '',
      stock: '0',
      description: '',
      tags: '',
      features: '',
      isActive: true,
      isFeatured: false,
    },
  });

  const watchedName = watch('name');

  useEffect(() => {
    if (!slugManuallyEdited) {
      setValue('slug', slugify(watchedName || ''), { shouldDirty: true });
    }
  }, [watchedName, slugManuallyEdited, setValue]);

  useEffect(() => {
    if (product) {
      const categoryId =
        typeof product.category === 'string' ? product.category : product.category?._id ?? '';
      reset({
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        category: categoryId,
        price: String(product.price ?? ''),
        discountPrice: product.discountPrice ? String(product.discountPrice) : '',
        stock: String(product.stock ?? 0),
        description: product.description ?? '',
        tags: Array.isArray(product.tags) ? product.tags.join(', ') : '',
        features: Array.isArray(product.features) ? product.features.join('\n') : '',
        isActive: product.isActive ?? true,
        isFeatured: product.isFeatured ?? false,
      });
      setSlugManuallyEdited(false);
    }
  }, [product, reset]);

  const onSubmit = async (values: EditProductValues) => {
    const formData = new FormData();

    formData.append('name', values.name);
    formData.append('slug', values.slug);
    formData.append('sku', values.sku);
    formData.append('category', values.category);
    formData.append('price', values.price);
    formData.append('stock', values.stock);
    formData.append('description', values.description);
    formData.append('isActive', String(values.isActive));
    formData.append('isFeatured', String(values.isFeatured));

    if (values.discountPrice !== undefined) {
      formData.append('discountPrice', values.discountPrice ?? '');
    }

    const tags = values.tags
      ? values.tags
          .split(',')
          .map((tag) => tag.trim())
          .filter(Boolean)
      : [];
    if (tags.length > 0) {
      tags.forEach((tag) => formData.append('tags', tag));
    } else {
      formData.append('tags', '');
    }

    const features = values.features
      ? values.features
          .split('\n')
          .map((feature) => feature.trim())
          .filter(Boolean)
      : [];
    if (features.length > 0) {
      features.forEach((feature) => formData.append('features', feature));
    } else {
      formData.append('features', '');
    }

    const file = values.image instanceof FileList ? values.image.item(0) : undefined;
    if (file) {
      formData.append('image', file);
    }

    try {
      await updateMutation.mutateAsync({ id: productId, payload: formData });
      toast.success('Product updated successfully');
      setOpen(false);
    } catch (error) {
      console.error(error);
      toast.error('Failed to update product');
    }
  };

  useEffect(() => {
    if (open && product) {
      const categoryId =
        typeof product.category === 'string' ? product.category : product.category?._id ?? '';
      reset({
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        category: categoryId,
        price: String(product.price ?? ''),
        discountPrice: product.discountPrice ? String(product.discountPrice) : '',
        stock: String(product.stock ?? 0),
        description: product.description ?? '',
        tags: Array.isArray(product.tags) ? product.tags.join(', ') : '',
        features: Array.isArray(product.features) ? product.features.join('\n') : '',
        isActive: product.isActive ?? true,
        isFeatured: product.isFeatured ?? false,
      });
      setSlugManuallyEdited(false);
    }
  }, [open, product, reset]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? (
        <DialogTrigger asChild>{trigger}</DialogTrigger>
      ) : (
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Pencil className="mr-1 h-4 w-4" />
            Edit
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="max-h-[90vh] overflow-y-auto w-[calc(100vw-2rem)] sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Edit Product</DialogTitle>
          <DialogDescription>Update the product details and save your changes.</DialogDescription>
        </DialogHeader>

        {isLoading || isFetching ? (
          <div className="py-8 text-center text-muted-foreground">Loading product details...</div>
        ) : product ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., Wireless Earbuds Pro"
                  {...register('name', {
                    onChange: (event) => {
                      if (!slugManuallyEdited) {
                        setValue('slug', slugify(event.target.value));
                      }
                    },
                  })}
                />
                {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug *</Label>
                <Input
                  id="slug"
                  placeholder="wireless-earbuds-pro"
                  {...register('slug', {
                    onChange: () => setSlugManuallyEdited(true),
                  })}
                />
                <p className="text-xs text-muted-foreground">Suggested: {slugify(watchedName || '')}</p>
                {errors.slug ? <p className="text-sm text-destructive">{errors.slug.message}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="sku">SKU *</Label>
                <Input id="sku" placeholder="SKU-12345" {...register('sku')} />
                {errors.sku ? <p className="text-sm text-destructive">{errors.sku.message}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Controller
                    control={control}
                    name="category"
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger id="category" className="flex-1">
                          <SelectValue placeholder="Choose a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category._id} value={category._id}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <ManageCategoriesDialog />
                </div>
                {errors.category ? <p className="text-sm text-destructive">{errors.category.message}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Price *</Label>
                <Input id="price" type="number" step="0.01" placeholder="e.g., 4999" {...register('price')} />
                {errors.price ? <p className="text-sm text-destructive">{errors.price.message}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="discountPrice">Discount Price</Label>
                <Input
                  id="discountPrice"
                  type="number"
                  step="0.01"
                  placeholder="Optional discount"
                  {...register('discountPrice')}
                />
                {errors.discountPrice ? (
                  <p className="text-sm text-destructive">{errors.discountPrice.message}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock">Stock</Label>
                <Input id="stock" type="number" placeholder="Available quantity" {...register('stock')} />
                {errors.stock ? <p className="text-sm text-destructive">{errors.stock.message}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Replace Image</Label>
                <Input id="image" type="file" accept="image/*" {...register('image')} />
                <p className="text-xs text-muted-foreground">JPEG/PNG up to 5MB. Leave empty to keep current image.</p>
                {errors.image ? <p className="text-sm text-destructive">{errors.image.message as string}</p> : null}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                rows={4}
                placeholder="Highlight the main selling points, materials, dimensions, warranty, etc."
                {...register('description')}
              />
              {errors.description ? <p className="text-sm text-destructive">{errors.description.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="features">Features (one per line)</Label>
              <Textarea
                id="features"
                rows={3}
                placeholder={'✓ Lightweight design\n✓ 24-hour battery\n✓ Bluetooth 5.3 support'}
                {...register('features')}
              />
              {errors.features ? <p className="text-sm text-destructive">{errors.features.message}</p> : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags (comma separated)</Label>
              <Input id="tags" placeholder="e.g., electronics, bestseller, new-arrival" {...register('tags')} />
              {errors.tags ? <p className="text-sm text-destructive">{errors.tags.message}</p> : null}
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
              <Controller
                control={control}
                name="isActive"
                render={({ field }) => (
                  <div className="flex items-center justify-between rounded-md border p-4 sm:w-1/2">
                    <div>
                      <p className="text-sm font-medium">Active</p>
                      <p className="text-xs text-muted-foreground">Product visible in catalogue</p>
                    </div>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </div>
                )}
              />
              <Controller
                control={control}
                name="isFeatured"
                render={({ field }) => (
                  <div className="flex items-center justify-between rounded-md border p-4 sm:w-1/2">
                    <div>
                      <p className="text-sm font-medium">Featured</p>
                      <p className="text-xs text-muted-foreground">Highlight on home page</p>
                    </div>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </div>
                )}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => product && reset()} disabled={isSubmitting}>
                Reset
              </Button>
              <Button
                type="submit"
                className="gradient-primary text-white"
                disabled={isSubmitting || updateMutation.isPending}
              >
                {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        ) : (
          <div className="py-8 text-center text-destructive">Unable to load product details.</div>
        )}
      </DialogContent>
    </Dialog>
  );
};