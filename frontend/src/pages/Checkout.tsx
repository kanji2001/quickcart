import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { Loader2, ShoppingBag, TicketPercent, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/EmptyState';
import { LoadingState } from '@/components/shared/LoadingState';
import { useCartQuery, cartQueryKey } from '@/hooks/cart/use-cart';
import { useAuthStore, selectAuthUser, selectIsAuthenticated } from '@/stores/auth-store';
import { ensureRazorpayLoaded } from '@/lib/razorpay';
import { paymentApi } from '@/api/payment';
import { useCreateOrderMutation } from '@/hooks/orders/use-create-order';
import { ordersQueryKey } from '@/hooks/orders/use-orders';
import { useQueryClient } from '@tanstack/react-query';
import { useAddressesQuery } from '@/hooks/user/use-addresses';
import type { Address, AddressInput, Coupon } from '@/types/api';
import { cn, formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useAvailableCoupons, useValidateCouponMutation } from '@/hooks/coupons/use-coupons';
import type { Coupon } from '@/types/api';

const addressSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  phone: z.string().min(10, 'Phone number is required'),
  addressLine1: z.string().min(1, 'Address line 1 is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  pincode: z.string().min(4, 'Pincode is required'),
  country: z.string().min(1, 'Country is required').default('India'),
});

const checkoutSchema = z
  .object({
    shippingAddress: addressSchema,
    billingSameAsShipping: z.boolean().default(true),
    billingAddress: addressSchema.optional(),
    paymentMethod: z.enum(['razorpay', 'cod']),
    couponCode: z.string().optional(),
    saveAddress: z.boolean().optional(),
  })
  .refine(
    (data) => data.billingSameAsShipping || Boolean(data.billingAddress),
    {
      message: 'Billing address is required when not same as shipping',
      path: ['billingAddress'],
    },
  );

type CheckoutFormValues = z.infer<typeof checkoutSchema>;

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }
  return 'Something went wrong. Please try again.';
};

const normalizeAddress = (address: CheckoutFormValues['shippingAddress']): AddressInput => ({
  fullName: String(address.fullName ?? '').trim(),
  phone: String(address.phone ?? '').trim(),
  addressLine1: String(address.addressLine1 ?? '').trim(),
  addressLine2: address.addressLine2 ? String(address.addressLine2).trim() : undefined,
  city: String(address.city ?? '').trim(),
  state: String(address.state ?? '').trim(),
  pincode: String(address.pincode ?? '').trim(),
  country: String(address.country ?? '').trim(),
});

const COUPON_STORAGE_KEY = 'quickcart-applied-coupon';

const Checkout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const user = useAuthStore(selectAuthUser);
  const { data: cart, isLoading: isCartLoading, isError: isCartError } = useCartQuery();
  const createOrderMutation = useCreateOrderMutation();
  const [isProcessing, setIsProcessing] = useState(false);
  const addressesQuery = useAddressesQuery({ enabled: isAuthenticated });
  const [selectedAddressId, setSelectedAddressId] = useState<string>('custom');
  const addressInitializedRef = useRef(false);
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    payableAmount: number;
    coupon: Coupon;
  } | null>(null);
  const validateCouponMutation = useValidateCouponMutation();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shippingAddress: {
        fullName: user?.name ?? '',
        phone: '',
        addressLine1: '',
        addressLine2: '',
        city: '',
        state: '',
        pincode: '',
        country: 'India',
      },
      billingSameAsShipping: true,
      billingAddress: undefined,
      paymentMethod: 'razorpay',
      couponCode: '',
      saveAddress: true,
    },
  });

  const billingSameAsShipping = form.watch('billingSameAsShipping');
  const saveAddress = form.watch('saveAddress');
  const savedAddresses = addressesQuery.data ?? [];

  const applyAddressToForm = (address: Address) => {
    form.setValue('shippingAddress.fullName', address.fullName);
    form.setValue('shippingAddress.phone', address.phone);
    form.setValue('shippingAddress.addressLine1', address.addressLine1);
    form.setValue('shippingAddress.addressLine2', address.addressLine2 ?? '');
    form.setValue('shippingAddress.city', address.city);
    form.setValue('shippingAddress.state', address.state);
    form.setValue('shippingAddress.pincode', address.pincode);
    form.setValue('shippingAddress.country', address.country ?? 'India');

    if (form.getValues('billingSameAsShipping')) {
      form.setValue('billingAddress', undefined);
    }
  };

  useEffect(() => {
    if (!addressInitializedRef.current && savedAddresses.length > 0) {
      const defaultAddress = savedAddresses.find((address) => address.isDefault) ?? savedAddresses[0];
      setSelectedAddressId(defaultAddress._id);
      applyAddressToForm(defaultAddress);
      addressInitializedRef.current = true;
    }
  }, [savedAddresses]);

  const cartSummary = useMemo(() => {
    if (!cart || cart.items.length === 0) {
      return {
        subtotal: 0,
        taxAmount: 0,
        shippingCharges: 0,
        totalAmount: 0,
      };
    }

    const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const taxAmount = subtotal * 0.18;
    const shippingCharges = subtotal > 999 ? 0 : subtotal === 0 ? 0 : 59;
    const totalAmount = subtotal + taxAmount + shippingCharges;

    return {
      subtotal,
      taxAmount,
      shippingCharges,
      totalAmount,
    };
  }, [cart]);

  const cartSubtotal = cartSummary.subtotal;
  const availableCouponsQuery = useAvailableCoupons(
    cartSubtotal,
    cartSubtotal >= 500 && !isCartLoading && !isCartError,
  );

  useEffect(() => {
    if (validateCouponMutation.isPending) {
      return;
    }

    if (cartSubtotal <= 0) {
      setAppliedCoupon(null);
      setCouponInput('');
      form.setValue('couponCode', '');
      localStorage.removeItem(COUPON_STORAGE_KEY);
      return;
    }

    const storedRaw = localStorage.getItem(COUPON_STORAGE_KEY);
    if (!storedRaw) {
      return;
    }

    try {
      const stored = JSON.parse(storedRaw) as { code?: string; cartSubtotal?: number };
      if (!stored.code) {
        localStorage.removeItem(COUPON_STORAGE_KEY);
        return;
      }

      const normalized = stored.code.trim().toUpperCase();
      if (appliedCoupon && appliedCoupon.coupon.code === normalized && stored.cartSubtotal === cartSubtotal) {
        setCouponInput(normalized);
        form.setValue('couponCode', normalized);
        return;
      }

      void (async () => {
        try {
          const result = await validateCouponMutation.mutateAsync({ code: normalized, cartTotal: cartSubtotal });
          const payload = {
            code: result.coupon.code,
            discountAmount: result.discountAmount,
            payableAmount: result.payableAmount,
            coupon: result.coupon,
          };
          setAppliedCoupon(payload);
          setCouponInput(result.coupon.code);
          form.setValue('couponCode', result.coupon.code);
          localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify({ ...payload, cartSubtotal }));
        } catch {
          setAppliedCoupon(null);
          setCouponInput('');
          form.setValue('couponCode', '');
          localStorage.removeItem(COUPON_STORAGE_KEY);
        }
      })();
    } catch {
      localStorage.removeItem(COUPON_STORAGE_KEY);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartSubtotal]);

  const handleCouponApply = async (rawCode: string) => {
    const normalized = rawCode.trim().toUpperCase();
    if (!normalized) {
      toast.error('Enter a coupon code', { description: 'Add a code before applying.' });
      return;
    }

    try {
      const result = await validateCouponMutation.mutateAsync({ code: normalized, cartTotal: cartSubtotal });
      const payload = {
        code: result.coupon.code,
        discountAmount: result.discountAmount,
        payableAmount: result.payableAmount,
        coupon: result.coupon,
      };
      setAppliedCoupon(payload);
      setCouponInput(result.coupon.code);
      form.setValue('couponCode', result.coupon.code, { shouldDirty: true });
      localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify({ ...payload, cartSubtotal }));
      toast.success('Coupon applied successfully', {
        description: `You saved ${formatCurrency(result.discountAmount)} on this order.`,
      });
    } catch (error) {
      toast.error('Unable to apply coupon', { description: getErrorMessage(error) });
      setAppliedCoupon(null);
      setCouponInput('');
      form.setValue('couponCode', '');
      localStorage.removeItem(COUPON_STORAGE_KEY);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    form.setValue('couponCode', '');
    localStorage.removeItem(COUPON_STORAGE_KEY);
    toast.info('Coupon removed');
  };

  const isAppliedCode = appliedCoupon && couponInput.trim().toUpperCase() === appliedCoupon.coupon.code;
  const bestCouponCode = availableCouponsQuery.data?.bestCouponCode ?? null;

  const discountAmount = appliedCoupon?.discountAmount ?? 0;
  const discountedSubtotal = Math.max(0, cartSubtotal - discountAmount);
  const discountedTaxAmount = discountedSubtotal * 0.18;
  const payableAmount = discountedSubtotal + discountedTaxAmount + cartSummary.shippingCharges;

const handlePaymentSuccess = async (
    orderId: string,
    response: {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
    },
  ) => {
    setIsProcessing(true);
    try {
      await paymentApi.verify({
        razorpayOrderId: response.razorpay_order_id,
        razorpayPaymentId: response.razorpay_payment_id,
        razorpaySignature: response.razorpay_signature,
        orderId,
      });

      localStorage.removeItem(COUPON_STORAGE_KEY);
      setAppliedCoupon(null);
      setCouponInput('');
      form.setValue('couponCode', '');

      queryClient.invalidateQueries({ queryKey: ordersQueryKey() });
      queryClient.invalidateQueries({ queryKey: cartQueryKey });
      toast.success('Payment successful', {
        description: 'Your order has been confirmed.',
      });
      navigate('/orders');
    } catch (error) {
      toast.error('Payment verification failed', {
        description: getErrorMessage(error),
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const onSubmit = async (values: CheckoutFormValues) => {
    if (!cart || cart.items.length === 0) {
      toast.error('Your cart is empty', {
        description: 'Add items to your cart before checking out.',
      });
      return;
    }

    const shippingAddress = normalizeAddress(values.shippingAddress);
    const billingAddress = values.billingSameAsShipping
      ? normalizeAddress(values.shippingAddress)
      : values.billingAddress
        ? normalizeAddress(values.billingAddress)
        : undefined;

    if (!billingAddress) {
      toast.error('Billing address required', {
        description: 'Please provide billing details or keep them same as shipping.',
      });
      return;
    }

    try {
      setIsProcessing(true);

      const order = await createOrderMutation.mutateAsync({
        items: cart.items.map((item) => ({
          productId: item.product._id,
          quantity: item.quantity,
        })),
        shippingAddress,
        billingAddress,
        paymentMethod: values.paymentMethod,
        couponCode: values.couponCode?.trim() ? values.couponCode.trim() : undefined,
        saveAddress: values.saveAddress ?? false,
      });

      if (values.paymentMethod === 'cod') {
        toast.success('Order placed successfully', {
          description: `Order ${order.orderNumber} has been created.`,
        });
        localStorage.removeItem(COUPON_STORAGE_KEY);
        setAppliedCoupon(null);
        setCouponInput('');
        form.setValue('couponCode', '');
        queryClient.invalidateQueries({ queryKey: cartQueryKey });
        queryClient.invalidateQueries({ queryKey: ordersQueryKey() });
        setIsProcessing(false);
        navigate('/orders');
        return;
      }

      await ensureRazorpayLoaded();

      const { data: paymentResponse } = await paymentApi.createOrder({
        amount: Number(order.totalAmount.toFixed(2)),
        currency: 'INR',
        receipt: order.orderNumber,
      });

      const paymentData = paymentResponse.data;

      if (!window.Razorpay) {
        throw new Error('Razorpay SDK not available');
      }

      const razorpayInstance = new window.Razorpay({
        key: paymentData.key,
        amount: paymentData.amount,
        currency: paymentData.currency,
        name: 'QuickCart',
        description: `Order ${order.orderNumber}`,
        order_id: paymentData.orderId,
        prefill: {
          name: shippingAddress.fullName,
          email: user?.email,
          contact: shippingAddress.phone,
        },
        notes: {
          orderId: order._id,
        },
        theme: {
          color: '#0ea5e9',
        },
        handler: (response) => {
          void handlePaymentSuccess(order._id, response);
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            toast.info('Payment cancelled', {
              description: 'You can try completing the payment again.',
            });
          },
        },
      });

      razorpayInstance.on('payment.failed', (response) => {
        setIsProcessing(false);
        const failureDescription =
          (response as { error?: { description?: string } })?.error?.description ??
          'The payment could not be completed. Please try again.';
        toast.error('Payment failed', {
          description: failureDescription,
        });
      });

      setIsProcessing(false);
      razorpayInstance.open();
    } catch (error) {
      setIsProcessing(false);
      toast.error('Checkout failed', {
        description: getErrorMessage(error),
      });
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (isCartLoading) {
    return <LoadingState message="Loading your cart..." />;
  }

  if (isCartError || !cart || cart.items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12">
        <EmptyState
          title="Your cart is empty"
          description="Add items to your cart to proceed with checkout."
          action={
            <Button className="gradient-primary" onClick={() => navigate('/products')}>
              Browse Products
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-8 lg:grid-cols-[2fr,1fr]">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Details</CardTitle>
            </CardHeader>
            <CardContent>
              {addressesQuery.isSuccess && savedAddresses.length > 0 ? (
                <div className="space-y-3 mb-6">
                  <div className="flex items-center justify-between">
                    <Label>Saved Addresses</Label>
                    <Button variant="link" className="px-0 h-auto" asChild>
                      <Link to="/profile">Manage addresses</Link>
                    </Button>
                  </div>
                  <div className="grid gap-3 md:grid-cols-2">
                    {savedAddresses.map((address) => {
                      const isSelected = selectedAddressId === address._id;
                      return (
                        <button
                          type="button"
                          key={address._id}
                          className={cn(
                            'text-left rounded-lg border p-3 transition-all focus:outline-none focus:ring-2 focus:ring-ring',
                            isSelected ? 'border-primary shadow-sm ring-1 ring-primary' : 'hover:border-primary/60',
                          )}
                          onClick={() => {
                            setSelectedAddressId(address._id);
                            applyAddressToForm(address);
                          }}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-semibold">{address.fullName}</p>
                              <p className="text-xs text-muted-foreground capitalize">
                                {address.addressType ?? 'home'} • +91 {address.phone}
                              </p>
                            </div>
                            {address.isDefault ? <Badge>Default</Badge> : null}
                          </div>
                          <p className="text-sm mt-2">
                            {address.addressLine1}
                            {address.addressLine2 ? `, ${address.addressLine2}` : ''}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {address.city}, {address.state} {address.pincode}
                          </p>
                        </button>
                      );
                    })}
                    <button
                      type="button"
                      className={cn(
                        'flex items-center justify-center rounded-lg border border-dashed p-3 text-sm text-muted-foreground transition hover:border-primary/60',
                        selectedAddressId === 'custom' ? 'border-primary' : '',
                      )}
                      onClick={() => {
                        setSelectedAddressId('custom');
                      }}
                    >
                      Use a different address
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shipping-fullName">Full Name</Label>
                  <Input id="shipping-fullName" {...form.register('shippingAddress.fullName')} />
                  {form.formState.errors.shippingAddress?.fullName ? (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.shippingAddress.fullName.message}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shipping-phone">Phone</Label>
                  <Input id="shipping-phone" {...form.register('shippingAddress.phone')} />
                  {form.formState.errors.shippingAddress?.phone ? (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.shippingAddress.phone.message}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="shipping-addressLine1">Address Line 1</Label>
                  <Input id="shipping-addressLine1" {...form.register('shippingAddress.addressLine1')} />
                  {form.formState.errors.shippingAddress?.addressLine1 ? (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.shippingAddress.addressLine1.message}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="shipping-addressLine2">Address Line 2</Label>
                  <Input id="shipping-addressLine2" {...form.register('shippingAddress.addressLine2')} />
                  {form.formState.errors.shippingAddress?.addressLine2 ? (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.shippingAddress.addressLine2.message}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shipping-city">City</Label>
                  <Input id="shipping-city" {...form.register('shippingAddress.city')} />
                  {form.formState.errors.shippingAddress?.city ? (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.shippingAddress.city.message}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shipping-state">State</Label>
                  <Input id="shipping-state" {...form.register('shippingAddress.state')} />
                  {form.formState.errors.shippingAddress?.state ? (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.shippingAddress.state.message}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shipping-pincode">Pincode</Label>
                  <Input id="shipping-pincode" {...form.register('shippingAddress.pincode')} />
                  {form.formState.errors.shippingAddress?.pincode ? (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.shippingAddress.pincode.message}
                    </p>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="shipping-country">Country</Label>
                  <Input id="shipping-country" {...form.register('shippingAddress.country')} />
                  {form.formState.errors.shippingAddress?.country ? (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.shippingAddress.country.message}
                    </p>
                  ) : null}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Billing Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-medium">Same as shipping</p>
                  <p className="text-sm text-muted-foreground">Use shipping details for billing</p>
                </div>
                <Controller
                  control={form.control}
                  name="billingSameAsShipping"
                  render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
                />
              </div>

              {!billingSameAsShipping ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="billing-fullName">Full Name</Label>
                    <Input id="billing-fullName" {...form.register('billingAddress.fullName')} />
                    {form.formState.errors.billingAddress?.fullName ? (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.billingAddress.fullName.message}
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="billing-phone">Phone</Label>
                    <Input id="billing-phone" {...form.register('billingAddress.phone')} />
                    {form.formState.errors.billingAddress?.phone ? (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.billingAddress.phone.message}
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="billing-addressLine1">Address Line 1</Label>
                    <Input id="billing-addressLine1" {...form.register('billingAddress.addressLine1')} />
                    {form.formState.errors.billingAddress?.addressLine1 ? (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.billingAddress.addressLine1.message}
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="billing-addressLine2">Address Line 2</Label>
                    <Input id="billing-addressLine2" {...form.register('billingAddress.addressLine2')} />
                    {form.formState.errors.billingAddress?.addressLine2 ? (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.billingAddress.addressLine2.message}
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="billing-city">City</Label>
                    <Input id="billing-city" {...form.register('billingAddress.city')} />
                    {form.formState.errors.billingAddress?.city ? (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.billingAddress.city.message}
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="billing-state">State</Label>
                    <Input id="billing-state" {...form.register('billingAddress.state')} />
                    {form.formState.errors.billingAddress?.state ? (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.billingAddress.state.message}
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="billing-pincode">Pincode</Label>
                    <Input id="billing-pincode" {...form.register('billingAddress.pincode')} />
                    {form.formState.errors.billingAddress?.pincode ? (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.billingAddress.pincode.message}
                      </p>
                    ) : null}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="billing-country">Country</Label>
                    <Input id="billing-country" {...form.register('billingAddress.country')} />
                    {form.formState.errors.billingAddress?.country ? (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.billingAddress.country.message}
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <Controller
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <RadioGroup value={field.value} onValueChange={field.onChange}>
                    <label
                      htmlFor="payment-razorpay"
                      className="flex items-center gap-4 rounded-lg border p-4 cursor-pointer hover:border-primary transition"
                    >
                      <RadioGroupItem id="payment-razorpay" value="razorpay" />
                      <div>
                        <p className="font-medium">Razorpay</p>
                        <p className="text-sm text-muted-foreground">
                          Pay securely using UPI, cards, netbanking, and more.
                        </p>
                      </div>
                    </label>

                    <label
                      htmlFor="payment-cod"
                      className="flex items-center gap-4 rounded-lg border p-4 cursor-pointer hover:border-primary transition"
                    >
                      <RadioGroupItem id="payment-cod" value="cod" />
                      <div>
                        <p className="font-medium">Cash on Delivery</p>
                        <p className="text-sm text-muted-foreground">Pay with cash when your order arrives.</p>
                      </div>
                    </label>
                  </RadioGroup>
                )}
              />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                {cart.items.map((item) => (
                  <div key={item._id} className="flex items-start justify-between gap-4 border-b pb-3 last:border-b-0">
                    <div className="flex items-start gap-3">
                      <div className="h-12 w-12 rounded-md border bg-muted flex items-center justify-center">
                        <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                      <TicketPercent className="h-4 w-4 text-primary" />
                      Apply Coupon
                    </h3>
                    {validateCouponMutation.isPending ? (
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Validating...
                      </span>
                    ) : null}
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <Input
                      value={couponInput}
                      onChange={(event) => setCouponInput(event.target.value.toUpperCase())}
                      placeholder="Enter coupon code"
                      className="uppercase sm:flex-1"
                      disabled={validateCouponMutation.isPending}
                    />
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        className="sm:w-auto w-full"
                        onClick={() => handleCouponApply(couponInput)}
                        disabled={
                          validateCouponMutation.isPending ||
                          cartSubtotal <= 0 ||
                          isAppliedCode ||
                          !couponInput.trim()
                        }
                      >
                        {validateCouponMutation.isPending ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Applying...
                          </>
                        ) : isAppliedCode ? (
                          'Applied ✅'
                        ) : (
                          'Apply Coupon'
                        )}
                      </Button>
                      {appliedCoupon ? (
                        <Button type="button" variant="outline" onClick={handleRemoveCoupon}>
                          Remove
                        </Button>
                      ) : null}
                    </div>
                  </div>
                  {appliedCoupon ? (
                    <p className="text-xs text-emerald-600">
                      Coupon {appliedCoupon.coupon.code} applied! You saved {formatCurrency(discountAmount)}.
                    </p>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      Tip: Coupons apply on the cart subtotal before taxes and shipping.
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">Available coupons</p>
                  {cartSubtotal < 500 ? (
                    <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                      No coupons available yet. Add more items to unlock exciting offers!
                    </div>
                  ) : availableCouponsQuery.isLoading || availableCouponsQuery.isFetching ? (
                    <div className="space-y-2">
                      <Skeleton className="h-16 w-full" />
                      <Skeleton className="h-16 w-full" />
                    </div>
                  ) : availableCouponsQuery.isError ? (
                    <div className="rounded-md border border-dashed p-3 text-sm text-destructive">
                      Unable to load coupons at the moment. Please try again later.
                    </div>
                  ) : availableCouponsQuery.data && availableCouponsQuery.data.items.length > 0 ? (
                    <div className="space-y-2">
                      {availableCouponsQuery.data.items.map((couponItem) => {
                        const isApplied = appliedCoupon?.coupon.code === couponItem.code;
                        const isBest = bestCouponCode === couponItem.code;
                        return (
                          <button
                            key={couponItem._id}
                            type="button"
                            className={cn(
                              'w-full rounded-lg border p-3 text-left transition',
                              isApplied ? 'border-primary bg-primary/5' : 'hover:border-primary/70',
                            )}
                            onClick={() => {
                              if (isApplied) {
                                return;
                              }
                              setCouponInput(couponItem.code);
                              void handleCouponApply(couponItem.code);
                            }}
                            disabled={validateCouponMutation.isPending || isApplied}
                          >
                            <div className="flex items-center justify-between gap-2 flex-wrap">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge>{couponItem.code}</Badge>
                                {isBest ? (
                                  <Badge variant="default" className="flex items-center gap-1">
                                    <Sparkles className="h-3 w-3" />
                                    Best Offer
                                  </Badge>
                                ) : null}
                                {isApplied ? <Badge variant="secondary">Applied</Badge> : null}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                Save {formatCurrency(couponItem.estimatedDiscount ?? 0)}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {couponItem.description || 'Apply now to slash your total.'}
                            </p>
                            <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                              <span>Min cart {formatCurrency(couponItem.minCartValue)}</span>
                              <span>
                                {couponItem.discountType === 'flat'
                                  ? `Flat ${formatCurrency(couponItem.discountValue)}`
                                  : `${couponItem.discountValue}% off${
                                      couponItem.maxDiscount
                                        ? ` · up to ${formatCurrency(couponItem.maxDiscount)}`
                                        : ''
                                    }`}
                              </span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                      No coupons available for this order.
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">{formatCurrency(cartSummary.subtotal)}</span>
                </div>
                {discountAmount > 0 ? (
                  <div className="flex justify-between text-emerald-600">
                    <span>
                      Discount {appliedCoupon ? `(${appliedCoupon.coupon.code})` : ''}
                    </span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                ) : null}
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimated Tax (18%)</span>
                  <span className="font-medium">{formatCurrency(discountedTaxAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">
                    {cartSummary.shippingCharges === 0 ? 'Free' : formatCurrency(cartSummary.shippingCharges)}
                  </span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <div className="flex items-center justify-between w-full text-lg font-semibold">
                <span>Total</span>
                <span>{formatCurrency(payableAmount)}</span>
              </div>

              <div className="w-full rounded-lg border p-4 space-y-1">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-medium">Save this address for future orders</p>
                    <p className="text-xs text-muted-foreground">
                      We will remember these shipping details as your default address.
                    </p>
                  </div>
                  <Switch
                    checked={saveAddress ?? false}
                    onCheckedChange={(checked) => form.setValue('saveAddress', checked)}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full gradient-primary"
                size="lg"
                disabled={isProcessing || createOrderMutation.isPending}
              >
                {(isProcessing || createOrderMutation.isPending) ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Processing...
                  </>
                ) : (
                  'Place Order'
                )}
              </Button>
              <p className="text-xs text-muted-foreground text-center">
                By placing your order, you agree to our Terms and Conditions and Privacy Policy.
              </p>
            </CardFooter>
          </Card>
        </div>
      </form>
    </div>
  );
};

export default Checkout;


