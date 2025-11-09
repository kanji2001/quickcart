export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5000/api/v1';

export const API_ROUTES = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    logout: '/auth/logout',
    refreshToken: '/auth/refresh-token',
    me: '/auth/me',
    forgotPassword: '/auth/forgot-password',
    resetPassword: (token: string) => `/auth/reset-password/${token}`,
    verifyEmail: (token: string) => `/auth/verify-email/${token}`,
  },
  products: {
    root: '/products',
    featured: '/products/featured',
    trending: '/products/trending',
    newArrivals: '/products/new-arrivals',
    byId: (idOrSlug: string) => `/products/${idOrSlug}`,
    reviews: (id: string) => `/products/${id}/reviews`,
    related: (id: string) => `/products/${id}/related`,
  },
  categories: {
    root: '/categories',
    byId: (idOrSlug: string) => `/categories/${idOrSlug}`,
  },
  cart: {
    root: '/cart',
    items: '/cart/items',
    item: (itemId: string) => `/cart/items/${itemId}`,
    clear: '/cart/clear',
  },
  orders: {
    root: '/orders',
    byId: (id: string) => `/orders/${id}`,
    cancel: (id: string) => `/orders/${id}/cancel`,
    adminAll: '/orders/admin/all',
    status: (id: string) => `/orders/${id}/status`,
  },
  coupons: {
    root: '/coupons',
    validate: '/coupons/validate',
    byId: (id: string) => `/coupons/${id}`,
  },
  user: {
    profile: '/user/profile',
    changePassword: '/user/change-password',
    address: '/user/address',
    addressById: (id: string) => `/user/address/${id}`,
    setDefaultAddress: (id: string) => `/user/address/${id}/default`,
  },
  wishlist: {
    root: '/wishlist',
    byProductId: (productId: string) => `/wishlist/${productId}`,
  },
  payment: {
    createOrder: '/payment/create-order',
    verify: '/payment/verify',
    refund: (orderId: string) => `/payment/refund/${orderId}`,
  },
};

