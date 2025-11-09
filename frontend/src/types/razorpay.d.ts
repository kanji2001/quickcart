export type RazorpayPrefill = {
  name?: string;
  email?: string;
  contact?: string;
};

export type RazorpayTheme = {
  color?: string;
};

export type RazorpayOptions = {
  key: string;
  amount: number;
  currency?: string;
  name?: string;
  description?: string;
  image?: string;
  order_id: string;
  prefill?: RazorpayPrefill;
  notes?: Record<string, unknown>;
  theme?: RazorpayTheme;
  handler?: (response: RazorpaySuccessfulPaymentResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
};

export type RazorpaySuccessfulPaymentResponse = {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
};

export type RazorpayInstance = {
  open: () => void;
  close: () => void;
  on: (event: 'payment.failed' | string, handler: (response: unknown) => void) => void;
};

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

export {};


