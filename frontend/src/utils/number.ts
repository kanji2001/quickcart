export const formatCurrency = (value: number, locale = 'en-IN', currency = 'INR') =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
  }).format(value);
