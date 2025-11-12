import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useAuthStore, selectAuthUser, selectIsAuthenticated } from '@/stores/auth-store';
import { useProfileQuery, useUpdateProfileMutation } from '@/hooks/user/use-profile';
import {
  useAddressesQuery,
  useCreateAddressMutation,
  useDeleteAddressMutation,
  useSetDefaultAddressMutation,
  useUpdateAddressMutation,
} from '@/hooks/user/use-addresses';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LoadingState } from '@/components/shared/LoadingState';
import { ErrorState } from '@/components/shared/ErrorState';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Address } from '@/types/api';
import { useConfirmDialog } from '@/hooks/use-confirm-dialog';

const profileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  email: z.string().email(),
  phone: z
    .string()
    .trim()
    .regex(/^\d{10}$/, 'Phone number must be 10 digits'),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

const addressFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, 'Full name is required')
    .max(100, 'Full name must be less than 100 characters'),
  phone: z
    .string()
    .trim()
    .regex(/^\d{10}$/, 'Phone number must be 10 digits'),
  addressLine1: z
    .string()
    .trim()
    .min(1, 'Address line 1 is required')
    .max(120, 'Address line 1 must be less than 120 characters'),
  addressLine2: z
    .string()
    .trim()
    .max(120, 'Address line 2 must be less than 120 characters')
    .optional()
    .or(z.literal('')),
  city: z
    .string()
    .trim()
    .min(1, 'City is required')
    .max(60, 'City must be less than 60 characters'),
  state: z
    .string()
    .trim()
    .min(1, 'State is required')
    .max(60, 'State must be less than 60 characters'),
  pincode: z
    .string()
    .trim()
    .min(4, 'Pincode must be at least 4 characters')
    .max(10, 'Pincode must be less than 10 characters'),
  country: z
    .string()
    .trim()
    .min(1, 'Country is required')
    .max(60, 'Country must be less than 60 characters'),
  addressType: z.enum(['home', 'office', 'other']).default('home'),
  isDefault: z.boolean().optional(),
});

type AddressFormValues = z.infer<typeof addressFormSchema>;

const initialsFromName = (name: string) => {
  return name
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
};

const Profile = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const authUser = useAuthStore(selectAuthUser);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const profileQuery = useProfileQuery({ enabled: isAuthenticated });
  const updateProfileMutation = useUpdateProfileMutation();
  const addressesQuery = useAddressesQuery({ enabled: isAuthenticated });
  const createAddressMutation = useCreateAddressMutation();
  const updateAddressMutation = useUpdateAddressMutation();
  const deleteAddressMutation = useDeleteAddressMutation();
  const { confirm, ConfirmDialog } = useConfirmDialog();
  const setDefaultAddressMutation = useSetDefaultAddressMutation();

  const [addressDialogOpen, setAddressDialogOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: authUser?.name ?? '',
      email: authUser?.email ?? '',
      phone: authUser?.phone ?? '',
    },
  });

  useEffect(() => {
    if (profileQuery.data) {
      form.reset({
        name: profileQuery.data.name ?? '',
        email: profileQuery.data.email ?? '',
        phone: profileQuery.data.phone ?? '',
      });
    }
  }, [form, profileQuery.data]);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);

  const addressForm = useForm<AddressFormValues>({
    resolver: zodResolver(addressFormSchema),
    defaultValues: {
      fullName: authUser?.name ?? '',
      phone: authUser?.phone ?? '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India',
      addressType: 'home',
      isDefault: false,
    },
  });

  useEffect(() => {
    if (profileQuery.data) {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      setSelectedFile(null);
      setPreviewUrl(profileQuery.data.avatar?.url ?? null);
      setRemoveAvatar(false);
    }
  }, [profileQuery.data]);

  useEffect(() => {
    if (addressDialogOpen) {
      if (editingAddress) {
        addressForm.reset({
          fullName: editingAddress.fullName,
          phone: editingAddress.phone,
          addressLine1: editingAddress.addressLine1,
          addressLine2: editingAddress.addressLine2 ?? '',
          city: editingAddress.city,
          state: editingAddress.state,
          pincode: editingAddress.pincode,
          country: editingAddress.country,
          addressType: editingAddress.addressType ?? 'home',
          isDefault: editingAddress.isDefault ?? false,
        });
      } else {
        addressForm.reset({
          fullName: authUser?.name ?? '',
          phone: authUser?.phone ?? '',
          addressLine1: '',
          addressLine2: '',
          city: '',
          state: '',
          pincode: '',
          country: 'India',
          addressType: 'home',
          isDefault: addressesQuery.data?.length ? false : true,
        });
      }
    }
  }, [addressDialogOpen, addressForm, addressesQuery.data, authUser, editingAddress]);

  useEffect(() => {
    return () => {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, []);

  const roleBadge = useMemo(() => {
    if (!profileQuery.data?.role) {
      return null;
    }
    const isAdmin = profileQuery.data.role === 'admin';
    return (
      <Badge variant={isAdmin ? 'default' : 'secondary'} className={cn('uppercase tracking-wide')}>
        {isAdmin ? 'Admin' : 'Customer'}
      </Badge>
    );
  }, [profileQuery.data]);

  const handleAvatarInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
      setSelectedFile(null);
      setPreviewUrl(profileQuery.data?.avatar?.url ?? null);
      return;
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Invalid file', {
        description: 'Please choose an image file.',
      });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File too large', {
        description: 'Please choose an image under 5MB.',
      });
      return;
    }
    setRemoveAvatar(false);
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    const objectUrl = URL.createObjectURL(file);
    objectUrlRef.current = objectUrl;
    setSelectedFile(file);
    setPreviewUrl(objectUrl);
  };

  const handleRemoveAvatar = () => {
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setRemoveAvatar(true);
  };

  const onSubmit = (values: ProfileFormValues) => {
    const formData = new FormData();
    formData.append('name', values.name.trim());
    formData.append('phone', values.phone.trim());

    if (selectedFile) {
      formData.append('avatar', selectedFile);
    } else if (removeAvatar) {
      formData.append('removeAvatar', 'true');
    }

    updateProfileMutation.mutate(formData, {
      onSuccess: () => {
        toast.success('Profile updated', {
          description: 'Your profile details have been saved.',
        });
        setRemoveAvatar(false);
      },
      onError: (error) => {
        const description = error instanceof Error ? error.message : 'Unable to update profile. Please try again.';
        toast.error('Update failed', { description });
      },
    });
  };

  const handleAddressSubmit = addressForm.handleSubmit((values) => {
    const payload = {
      ...values,
      addressLine2: values.addressLine2 ? values.addressLine2.trim() : undefined,
    };

    if (editingAddress) {
      updateAddressMutation.mutate(
        { id: editingAddress._id, payload },
        {
          onSuccess: () => {
            toast.success('Address updated', { description: 'Your address has been saved.' });
            setAddressDialogOpen(false);
            setEditingAddress(null);
          },
          onError: (error) => {
            const description = error instanceof Error ? error.message : 'Unable to update address.';
            toast.error('Update failed', { description });
          },
        },
      );
    } else {
      createAddressMutation.mutate(payload, {
        onSuccess: () => {
          toast.success('Address added', { description: 'Your address has been saved.' });
          setAddressDialogOpen(false);
        },
        onError: (error) => {
          const description = error instanceof Error ? error.message : 'Unable to add address.';
          toast.error('Add failed', { description });
        },
      });
    }
  });

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setAddressDialogOpen(true);
  };

  const handleDeleteAddress = async (address: Address) => {
    const confirmed = await confirm({
      title: 'Delete this address?',
      description: 'You will need to add it again if you want to use it for future orders.',
      confirmText: 'Delete address',
      variant: 'destructive',
    });
    if (!confirmed) {
      return;
    }
    deleteAddressMutation.mutate(address._id, {
      onSuccess: () => {
        toast.success('Address removed', { description: 'The address has been deleted.' });
      },
      onError: (error) => {
        const description = error instanceof Error ? error.message : 'Unable to delete address.';
        toast.error('Delete failed', { description });
      },
    });
  };

  const handleSetDefaultAddress = (address: Address) => {
    setDefaultAddressMutation.mutate(address._id, {
      onSuccess: () => {
        toast.success('Default address updated');
      },
      onError: (error) => {
        const description = error instanceof Error ? error.message : 'Unable to set default address.';
        toast.error('Update failed', { description });
      },
    });
  };

  const isAddressMutationPending =
    createAddressMutation.isPending ||
    updateAddressMutation.isPending ||
    deleteAddressMutation.isPending ||
    setDefaultAddressMutation.isPending;

  if (!isAuthenticated) {
    return null;
  }

  if (profileQuery.isLoading || addressesQuery.isLoading) {
    return <LoadingState message="Loading your profile..." />;
  }

  if (profileQuery.isError || addressesQuery.isError) {
    return (
      <div className="container mx-auto px-4 py-12">
        <ErrorState
          description="We couldn’t load your profile details. Please try again."
          onRetry={() => {
            void profileQuery.refetch();
            void addressesQuery.refetch();
          }}
        />
      </div>
    );
  }

  const currentUser = profileQuery.data;
  const avatarInitials = initialsFromName(currentUser?.name ?? 'User');
  const phoneValue = form.watch('phone');

  return (
    <>
      {ConfirmDialog}
      <div className="container mx-auto px-4 py-12 space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Profile</h1>
            <p className="text-muted-foreground">Manage your personal information, addresses, and account details.</p>
          </div>
          {roleBadge}
        </div>

        <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
          <Card className="h-fit">
            <CardHeader>
              <CardTitle>Profile Photo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="h-20 w-20">
                  {previewUrl ? (
                    <AvatarImage src={previewUrl} alt={currentUser?.name} />
                  ) : currentUser?.avatar?.url ? (
                    <AvatarImage src={currentUser.avatar.url} alt={currentUser.name} />
                  ) : (
                    <AvatarFallback>{avatarInitials}</AvatarFallback>
                  )}
                </Avatar>
                <div className="space-y-2 text-sm">
                  <p className="font-medium">{currentUser?.name}</p>
                  <p className="text-muted-foreground">{currentUser?.email}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatar">Upload New Photo</Label>
                <Input id="avatar" type="file" accept="image/*" onChange={handleAvatarInput} />
                <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB.</p>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handleRemoveAvatar}
                disabled={!currentUser?.avatar?.url && !selectedFile && !previewUrl}
              >
                Remove Photo
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Account Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" {...form.register('name')} />
                  {form.formState.errors.name ? (
                    <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" disabled {...form.register('email')} className="bg-muted/60" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" {...form.register('phone')} />
                  {form.formState.errors.phone ? (
                    <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>
                  ) : null}
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="text-sm font-medium">Receive order updates</p>
                    <p className="text-xs text-muted-foreground">
                      Notifications will be sent to your phone number {phoneValue ? `(+91 ${phoneValue})` : ''}.
                    </p>
                  </div>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset({
                    name: currentUser?.name ?? '',
                    email: currentUser?.email ?? '',
                    phone: currentUser?.phone ?? '',
                  });
                  if (objectUrlRef.current) {
                    URL.revokeObjectURL(objectUrlRef.current);
                    objectUrlRef.current = null;
                  }
                  setSelectedFile(null);
                  setPreviewUrl(currentUser?.avatar?.url ?? null);
                  setRemoveAvatar(false);
                }}
                disabled={updateProfileMutation.isPending}
              >
                Reset
              </Button>
              <Button
                type="button"
                className="gradient-primary"
                onClick={form.handleSubmit(onSubmit)}
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle>Saved Addresses</CardTitle>
              <p className="text-sm text-muted-foreground">
                Store your preferred shipping details to speed up checkout.
              </p>
            </div>
            <Dialog open={addressDialogOpen} onOpenChange={(open) => {
              if (!open) {
                setEditingAddress(null);
              }
              setAddressDialogOpen(open);
            }}>
              <DialogTrigger asChild>
                <Button onClick={() => {
                  setEditingAddress(null);
                  setAddressDialogOpen(true);
                }}>
                  Add Address
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg">
                <DialogHeader>
                  <DialogTitle>{editingAddress ? 'Edit Address' : 'Add Address'}</DialogTitle>
                  <DialogDescription>
                    {editingAddress
                      ? 'Update your saved address details.'
                      : 'Fill out the form to save a new shipping address.'}
                  </DialogDescription>
                </DialogHeader>
                <form className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="address-fullName">Full Name</Label>
                      <Input id="address-fullName" {...addressForm.register('fullName')} />
                      {addressForm.formState.errors.fullName ? (
                        <p className="text-sm text-destructive">{addressForm.formState.errors.fullName.message}</p>
                      ) : null}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address-phone">Phone</Label>
                      <Input id="address-phone" {...addressForm.register('phone')} />
                      {addressForm.formState.errors.phone ? (
                        <p className="text-sm text-destructive">{addressForm.formState.errors.phone.message}</p>
                      ) : null}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address-line1">Address Line 1</Label>
                    <Input id="address-line1" {...addressForm.register('addressLine1')} />
                    {addressForm.formState.errors.addressLine1 ? (
                      <p className="text-sm text-destructive">{addressForm.formState.errors.addressLine1.message}</p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address-line2">Address Line 2</Label>
                    <Input id="address-line2" {...addressForm.register('addressLine2')} />
                    {addressForm.formState.errors.addressLine2 ? (
                      <p className="text-sm text-destructive">{addressForm.formState.errors.addressLine2.message}</p>
                    ) : null}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="address-city">City</Label>
                      <Input id="address-city" {...addressForm.register('city')} />
                      {addressForm.formState.errors.city ? (
                        <p className="text-sm text-destructive">{addressForm.formState.errors.city.message}</p>
                      ) : null}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address-state">State</Label>
                      <Input id="address-state" {...addressForm.register('state')} />
                      {addressForm.formState.errors.state ? (
                        <p className="text-sm text-destructive">{addressForm.formState.errors.state.message}</p>
                      ) : null}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address-pincode">Pincode</Label>
                      <Input id="address-pincode" {...addressForm.register('pincode')} />
                      {addressForm.formState.errors.pincode ? (
                        <p className="text-sm text-destructive">{addressForm.formState.errors.pincode.message}</p>
                      ) : null}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address-country">Country</Label>
                      <Input id="address-country" {...addressForm.register('country')} />
                      {addressForm.formState.errors.country ? (
                        <p className="text-sm text-destructive">{addressForm.formState.errors.country.message}</p>
                      ) : null}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="address-type">Address Type</Label>
                      <Select
                        value={addressForm.watch('addressType')}
                        onValueChange={(value) => addressForm.setValue('addressType', value as AddressFormValues['addressType'])}
                      >
                        <SelectTrigger id="address-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="home">Home</SelectItem>
                          <SelectItem value="office">Office</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Set as default</Label>
                      <div className="border rounded-lg p-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">Default shipping address</p>
                          <p className="text-xs text-muted-foreground">Use this address for future checkouts.</p>
                        </div>
                        <Switch
                          checked={addressForm.watch('isDefault') ?? false}
                          onCheckedChange={(checked) => addressForm.setValue('isDefault', checked)}
                        />
                      </div>
                    </div>
                  </div>
                </form>
                <DialogFooter className="pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      if (!editingAddress) {
                        addressForm.reset();
                      }
                      setAddressDialogOpen(false);
                      setEditingAddress(null);
                    }}
                    disabled={isAddressMutationPending}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    className="gradient-primary"
                    onClick={handleAddressSubmit}
                    disabled={isAddressMutationPending}
                  >
                    {isAddressMutationPending ? 'Saving...' : 'Save Address'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {addressesQuery.data && addressesQuery.data.length > 0 ? (
              addressesQuery.data.map((address) => (
                <div
                  key={address._id}
                  className={cn(
                    'rounded-lg border p-4 space-y-3 transition-shadow',
                    address.isDefault ? 'border-primary shadow-sm' : 'border-border',
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold capitalize">{(address.addressType ?? 'home').toLowerCase()} address</p>
                      <p className="text-sm text-muted-foreground">
                        Updated{' '}
                        {(() => {
                          const updatedAt = address.updatedAt ?? address.createdAt;
                          return updatedAt ? new Date(updatedAt).toLocaleDateString() : 'recently';
                        })()}
                      </p>
                    </div>
                    {address.isDefault ? <Badge>Default</Badge> : null}
                  </div>
                  <div className="text-sm space-y-1">
                    <p className="font-medium">{address.fullName}</p>
                    <p>{address.addressLine1}</p>
                    {address.addressLine2 ? <p>{address.addressLine2}</p> : null}
                    <p>
                      {address.city}, {address.state} {address.pincode}
                    </p>
                    <p>{address.country}</p>
                    <p className="text-muted-foreground">Phone: +91 {address.phone}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditAddress(address)}>
                      Edit
                    </Button>
                    {!address.isDefault ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleSetDefaultAddress(address)}
                        disabled={setDefaultAddressMutation.isPending}
                      >
                        Set Default
                      </Button>
                    ) : null}
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteAddress(address)}>
                      Delete
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                No addresses saved yet. Add one to speed up future orders.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default Profile;


