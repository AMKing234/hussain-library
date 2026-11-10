const API_BASE = '/api';

export function getAuthToken() {
  return localStorage.getItem('hl_auth_token');
}

export function setAuthToken(token) {
  if (token) {
    localStorage.setItem('hl_auth_token', token);
  } else {
    localStorage.removeItem('hl_auth_token');
  }
}

export function getCurrentUser() {
  const user = localStorage.getItem('hl_user');
  return user ? JSON.parse(user) : null;
}

export function setCurrentUser(user) {
  if (user) {
    localStorage.setItem('hl_user', JSON.stringify(user));
  } else {
    localStorage.removeItem('hl_user');
  }
}

async function request(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = { ...options.headers };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // If not FormData, default to application/json
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  const contentType = res.headers.get('content-type');
  let data;
  if (contentType && contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  if (!res.ok) {
    const errorMsg = data?.error || (typeof data === 'string' ? data : 'Request failed');
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  // System
  getSystemStatus: () => request('/system/status'),
  setupAdmin: (payload) => request('/auth/setup', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload) => request('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  getMe: () => request('/auth/me'),
  changePassword: (payload) => request('/auth/change-password', { method: 'POST', body: JSON.stringify(payload) }),

  // Stats
  getStats: () => request('/stats'),

  // Books
  getBooks: (params = {}) => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.type && params.type !== 'all') query.append('type', params.type);
    if (params.category && params.category !== 'all') query.append('category', params.category);
    if (params.available_only) query.append('available_only', 'true');
    const qs = query.toString();
    return request(`/books${qs ? `?${qs}` : ''}`);
  },
  getBook: (id) => request(`/books/${id}`),
  createBook: (formData) => request('/books', { method: 'POST', body: formData }),
  updateBook: (id, formData) => request(`/books/${id}`, { method: 'PUT', body: formData }),
  deleteBook: (id) => request(`/books/${id}`, { method: 'DELETE' }),

  // Members
  getMembers: () => request('/members'),
  createMember: (payload) => request('/members', { method: 'POST', body: JSON.stringify(payload) }),
  updateMember: (id, payload) => request(`/members/${id}`, { method: 'PUT', body: JSON.stringify(payload) }),
  deleteMember: (id) => request(`/members/${id}`, { method: 'DELETE' }),

  // Loans / Circulation
  getLoans: (status = 'all') => request(`/loans?status=${status}`),
  issueLoan: (payload) => request('/loans/issue', { method: 'POST', body: JSON.stringify(payload) }),
  returnLoan: (id) => request(`/loans/${id}/return`, { method: 'POST' }),
  renewLoan: (id, days = 14) => request(`/loans/${id}/renew`, { method: 'POST', body: JSON.stringify({ days }) }),

  // Reviews
  submitReview: (bookId, payload) => request(`/books/${bookId}/reviews`, { method: 'POST', body: JSON.stringify(payload) }),

  // Settings & Exports
  getSettings: () => request('/settings'),
  updateSettings: (payload) => request('/settings', { method: 'PUT', body: JSON.stringify(payload) }),
  getExportUrl: (type) => `/api/export/${type}?token=${getAuthToken() || ''}`,

  // Orders & Bagisto eCommerce Integration
  createOrder: (payload) => request('/orders', { method: 'POST', body: JSON.stringify(payload) }),
  getOrders: () => request('/orders'),
  updateOrderStatus: (id, status) => request(`/orders/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),

  // Inventory Sources (Bagisto multi-source)
  getInventorySources: () => request('/inventory-sources'),
  createInventorySource: (payload) => request('/inventory-sources', { method: 'POST', body: JSON.stringify(payload) }),

  // Reservations
  getReservations: () => request('/reservations'),
  createReservation: (payload) => request('/reservations', { method: 'POST', body: JSON.stringify(payload) }),
  updateReservationStatus: (id, status) => request(`/reservations/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),

  // Categories
  getCategories: () => request('/categories'),
  createCategory: (name) => request('/categories', { method: 'POST', body: JSON.stringify({ name }) }),
  deleteCategory: (name) => request(`/categories/${encodeURIComponent(name)}`, { method: 'DELETE' }),

  // Newsletter
  subscribeNewsletter: (email) => request('/newsletter/subscribe', { method: 'POST', body: JSON.stringify({ email }) }),

  // Book Requests (For readers requesting uncataloged books)
  requestBook: (payload) => request('/book-requests', { method: 'POST', body: JSON.stringify(payload) }),
  getBookRequests: () => request('/admin/book-requests'),
  updateBookRequestStatus: (id, status) => request(`/admin/book-requests/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Activity Logs
  getActivityLogs: () => request('/activity-logs'),

  // Combos & Special Offers
  getCombos: () => request('/combos'),
  createCombo: (payload) => request('/combos', { method: 'POST', body: JSON.stringify(payload) }),
  deleteCombo: (id) => request(`/combos/${id}`, { method: 'DELETE' }),

  // Custom Combo Requests
  requestCustomCombo: (payload) => request('/combo-requests', { method: 'POST', body: JSON.stringify(payload) }),
  getComboRequests: () => request('/combo-requests'),
  updateComboRequestStatus: (id, status) => request(`/combo-requests/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),

  // Admin Users
  getAdminUsers: () => request('/admin/users')
};
