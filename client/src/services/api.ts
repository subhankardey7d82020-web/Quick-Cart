// Vercel routes same-origin /api requests to the backend; set VITE_API_URL
// only when the frontend and backend are deployed separately.
const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const getHeaders = (isFormData = false) => {
  const token = localStorage.getItem('qc_token');
  const headers: Record<string, string> = {};

  if (!isFormData) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
};

const handleResponse = async (res: Response) => {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || 'An error occurred during request.');
  }
  return data;
};

export const api = {
  // Auth
  register: (body: any) =>
    fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse),

  login: (body: any) =>
    fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse),

  adminLogin: (body: any) =>
    fetch(`${API_BASE}/auth/admin/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse),

  getProfile: () =>
    fetch(`${API_BASE}/auth/profile`, {
      headers: getHeaders(),
    }).then(handleResponse),

  updateProfile: (body: any) =>
    fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse),

  updatePassword: (body: any) =>
    fetch(`${API_BASE}/auth/password`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse),

  getAddresses: () =>
    fetch(`${API_BASE}/auth/addresses`, {
      headers: getHeaders(),
    }).then(handleResponse),

  addAddress: (body: any) =>
    fetch(`${API_BASE}/auth/addresses`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse),

  deleteAddress: (id: number) =>
    fetch(`${API_BASE}/auth/addresses/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    }).then(handleResponse),

  // Products
  getProducts: (params: Record<string, string | number | boolean | undefined>) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== '' && val !== null) {
        query.append(key, String(val));
      }
    });
    return fetch(`${API_BASE}/products?${query.toString()}`).then(handleResponse);
  },

  getProductBySlug: (slug: string) =>
    fetch(`${API_BASE}/products/${slug}`).then(handleResponse),

  // Categories
  getCategories: () =>
    fetch(`${API_BASE}/categories`).then(handleResponse),

  getCategoryBySlug: (slug: string) =>
    fetch(`${API_BASE}/categories/${slug}`).then(handleResponse),

  // Orders
  createOrder: (body: any) =>
    fetch(`${API_BASE}/orders`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse),

  trackOrder: (orderNumber: string, phone?: string) => {
    const query = new URLSearchParams({ orderNumber });
    if (phone) query.append('phone', phone);
    return fetch(`${API_BASE}/orders/track?${query.toString()}`).then(handleResponse);
  },

  getMyOrders: () =>
    fetch(`${API_BASE}/orders/my-orders`, {
      headers: getHeaders(),
    }).then(handleResponse),

  cancelOrder: (id: number) =>
    fetch(`${API_BASE}/orders/${id}/cancel`, {
      method: 'PATCH',
      headers: getHeaders(),
    }).then(handleResponse),

  // Coupons
  validateCoupon: (code: string, subtotal: number) =>
    fetch(`${API_BASE}/coupons/validate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ code, subtotal }),
    }).then(handleResponse),

  // Reviews
  addReview: (body: any) =>
    fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse),

  getProductReviews: (productId: number) =>
    fetch(`${API_BASE}/reviews/product/${productId}`).then(handleResponse),

  // Store Settings
  getSettings: () =>
    fetch(`${API_BASE}/settings`).then(handleResponse),

  // Admin APIs
  adminGetDashboard: () =>
    fetch(`${API_BASE}/analytics/dashboard`, {
      headers: getHeaders(),
    }).then(handleResponse),

  adminGetProducts: (params?: any) => {
    const query = new URLSearchParams(params || {}).toString();
    return fetch(`${API_BASE}/products/admin/all?${query}`, {
      headers: getHeaders(),
    }).then(handleResponse);
  },

  adminCreateProduct: (body: any) =>
    fetch(`${API_BASE}/products/admin`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse),

  adminUpdateProduct: (id: number, body: any) =>
    fetch(`${API_BASE}/products/admin/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse),

  adminToggleProduct: (id: number) =>
    fetch(`${API_BASE}/products/admin/${id}/toggle`, {
      method: 'PATCH',
      headers: getHeaders(),
    }).then(handleResponse),

  adminDeleteProduct: (id: number) =>
    fetch(`${API_BASE}/products/admin/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    }).then(handleResponse),

  adminGetCategories: () =>
    fetch(`${API_BASE}/categories/admin/all`, {
      headers: getHeaders(),
    }).then(handleResponse),

  adminCreateCategory: (body: any) =>
    fetch(`${API_BASE}/categories/admin`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse),

  adminUpdateCategory: (id: number, body: any) =>
    fetch(`${API_BASE}/categories/admin/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse),

  adminDeleteCategory: (id: number) =>
    fetch(`${API_BASE}/categories/admin/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    }).then(handleResponse),

  adminGetOrders: (params?: any) => {
    const query = new URLSearchParams(params || {}).toString();
    return fetch(`${API_BASE}/orders/admin/all?${query}`, {
      headers: getHeaders(),
    }).then(handleResponse);
  },

  adminUpdateOrderStatus: (id: number, body: any) =>
    fetch(`${API_BASE}/orders/admin/${id}/status`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse),

  adminGetCustomers: (params?: any) => {
    const query = new URLSearchParams(params || {}).toString();
    return fetch(`${API_BASE}/customers/admin/all?${query}`, {
      headers: getHeaders(),
    }).then(handleResponse);
  },

  adminGetCustomerDetails: (id: number) =>
    fetch(`${API_BASE}/customers/admin/${id}`, {
      headers: getHeaders(),
    }).then(handleResponse),

  adminToggleCustomer: (id: number) =>
    fetch(`${API_BASE}/customers/admin/${id}/toggle`, {
      method: 'PATCH',
      headers: getHeaders(),
    }).then(handleResponse),

  adminGetCoupons: () =>
    fetch(`${API_BASE}/coupons/admin/all`, {
      headers: getHeaders(),
    }).then(handleResponse),

  adminCreateCoupon: (body: any) =>
    fetch(`${API_BASE}/coupons/admin`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse),

  adminUpdateCoupon: (id: number, body: any) =>
    fetch(`${API_BASE}/coupons/admin/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse),

  adminDeleteCoupon: (id: number) =>
    fetch(`${API_BASE}/coupons/admin/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    }).then(handleResponse),

  adminUpdateSettings: (body: any) =>
    fetch(`${API_BASE}/settings/admin`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(body),
    }).then(handleResponse),

  adminUploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return fetch(`${API_BASE}/uploads/single`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData,
    }).then(handleResponse);
  },
};
