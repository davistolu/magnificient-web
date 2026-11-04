const rawApiUrl = ((import.meta.env.VITE_API_URL as string) || '').trim();
const API_BASE = !rawApiUrl || rawApiUrl === '/api'
  ? '/api'
  : (rawApiUrl.endsWith('/api') ? rawApiUrl.replace(/\/+$/, '') : `${rawApiUrl.replace(/\/+$/, '')}/api`);

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string>;

  constructor(message: string, status: number, errors?: Record<string, string>) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('mag_auth_token');
  const headers = new Headers(options.headers || {});

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(
      data?.message || `Request failed with status ${res.status}`,
      res.status,
      data?.errors
    );
  }

  return data;
}

export const api = {
  // Auth
  login: (credentials: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  register: (userData: any) => request<any>('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
  getMe: () => request<any>('/auth/me'),

  // Categories
  getCategories: () => request<any>('/categories'),
  getCategory: (slug: string) => request<any>(`/categories/${slug}`),

  // Products
  getProducts: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        query.set(k, String(v));
      }
    });
    return request<any>(`/products?${query.toString()}`);
  },
  getProduct: (slugOrId: string) => request<any>(`/products/${slugOrId}`),
  getFeaturedProducts: () => request<any>('/products/featured'),
  createProduct: (payload: any) => request<any>('/products', { method: 'POST', body: JSON.stringify(payload) }),
  updateProduct: (id: string, payload: any) => request<any>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  archiveProduct: (id: string) => request<any>(`/products/${id}`, { method: 'DELETE' }),
  uploadProductImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return request<any>('/products/upload-image', {
      method: 'POST',
      body: formData,
    });
  },

  // Cart
  verifyCart: (payload: any) => request<any>('/cart/verify', { method: 'POST', body: JSON.stringify(payload) }),

  // Checkout
  checkout: (payload: any) => request<any>('/checkout', { method: 'POST', body: JSON.stringify(payload) }),

  // Payments & Receipts
  getPaymentInstructions: (orderNumber?: string) =>
    request<any>(`/payments/instructions${orderNumber ? `/${orderNumber}` : ''}`),
  submitReceipt: (formData: FormData) =>
    request<any>('/payments/receipt', { method: 'POST', body: formData }),
  getVerificationQueue: () => request<any>('/payments/verification-queue'),
  verifyPayment: (payload: any) => request<any>('/payments/verify', { method: 'POST', body: JSON.stringify(payload) }),

  // Orders
  getMyOrders: () => request<any>('/orders/my-orders'),
  getMyOrderDetails: (orderNumber: string) => request<any>(`/orders/my-orders/${orderNumber}`),
  trackOrder: (orderNumber: string, emailOrToken: { email?: string; token?: string }) => {
    const query = new URLSearchParams({ orderNumber });
    if (emailOrToken.token) query.set('token', emailOrToken.token);
    if (emailOrToken.email) query.set('email', emailOrToken.email);
    return request<any>(`/orders/track?${query.toString()}`);
  },
  getOrders: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.set(k, String(v));
    });
    return request<any>(`/orders?${query.toString()}`);
  },
  getOrderDetails: (id: string) => request<any>(`/orders/${id}`),
  updateOrderStatus: (id: string, payload: any) =>
    request<any>(`/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify(payload) }),

  // Inventory
  getInventoryOverview: () => request<any>('/inventory'),
  getInventoryMovements: (productId?: string) =>
    request<any>(`/inventory/movements${productId ? `?productId=${productId}` : ''}`),
  adjustStock: (payload: any) =>
    request<any>('/inventory/adjust', { method: 'POST', body: JSON.stringify(payload) }),

  // Analytics
  getDashboardMetrics: () => request<any>('/analytics/metrics'),

  // Customers
  getCustomers: () => request<any>('/customers'),
  getCustomerDetails: (emailOrId: string) => request<any>(`/customers/${emailOrId}`),

  // Settings
  getPublicSettings: () => request<any>('/settings/public'),
  getAdminSettings: () => request<any>('/settings/admin'),
  updateAdminSettings: (payload: any) =>
    request<any>('/settings/admin', { method: 'PUT', body: JSON.stringify(payload) }),

  // Discounts
  validateDiscount: (code: string, subtotal: number) =>
    request<any>('/discounts/validate', { method: 'POST', body: JSON.stringify({ code, subtotal }) }),
  getDiscounts: () => request<any>('/discounts'),
  createDiscount: (payload: any) => request<any>('/discounts', { method: 'POST', body: JSON.stringify(payload) }),
  toggleDiscount: (id: string) => request<any>(`/discounts/${id}/toggle`, { method: 'PATCH' }),

  // Audit & Notifications & Newsletter
  getAuditLogs: () => request<any>('/audit'),
  getNotifications: () => request<any>('/notifications'),
  markNotificationRead: (id: string) => request<any>(`/notifications/${id}/read`, { method: 'PATCH' }),
  subscribeNewsletter: (email: string) =>
    request<any>('/newsletter/subscribe', { method: 'POST', body: JSON.stringify({ email }) }),
};
