import axios from 'axios';

// ================================================
// API Service - Base HTTP Client
// ================================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

// Lấy tenant từ subdomain hoặc env
function getTenantId(): string {
  if (typeof window === 'undefined') return '';
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  if (parts.length >= 3 && !['www', 'app', 'admin'].includes(parts[0])) {
    return parts[0];
  }
  return process.env.NEXT_PUBLIC_TENANT_ID || 'demo';
}

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor: thêm tenant header và auth token
apiClient.interceptors.request.use((config) => {
  // Tenant ID
  const tenantId = getTenantId();
  if (tenantId) {
    config.headers['X-Tenant-ID'] = tenantId;
  }

  // Auth token
  const token = typeof window !== 'undefined'
    ? localStorage.getItem('access_token')
    : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Response interceptor: handle errors
apiClient.interceptors.response.use(
  (response) => response.data?.data ?? response.data,
  (error) => {
    const message = error.response?.data?.error?.message || error.message;
    return Promise.reject(new Error(message));
  },
);

export default apiClient;
