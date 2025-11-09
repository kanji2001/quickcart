const RAZORPAY_CDN_URL = 'https://checkout.razorpay.com/v1/checkout.js';

let razorpayScriptPromise: Promise<void> | null = null;

const loadScript = (): Promise<void> =>
  new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = RAZORPAY_CDN_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
    document.body.appendChild(script);
  });

export const ensureRazorpayLoaded = async (): Promise<void> => {
  if (typeof window !== 'undefined' && window.Razorpay) {
    return;
  }

  if (!razorpayScriptPromise) {
    razorpayScriptPromise = loadScript().finally(() => {
      razorpayScriptPromise = null;
    });
  }

  await razorpayScriptPromise;

  if (!window.Razorpay) {
    throw new Error('Razorpay SDK failed to initialize');
  }
};



