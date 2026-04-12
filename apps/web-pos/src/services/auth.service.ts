import apiClient from './api.service';
import type { LoginResponse } from '@retail-saas/types';

// ================================================
// Auth Service - Authentication API Calls
// ================================================

export const authService = {
  /**
   * Đăng nhập
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/auth/login', {
      email,
      password,
    });

    // Lưu tokens vào localStorage
    const data = response as unknown as LoginResponse;
    if (data.tokens?.accessToken) {
      localStorage.setItem('access_token', data.tokens.accessToken);
      localStorage.setItem('refresh_token', data.tokens.refreshToken);
    }

    return data;
  },

  /**
   * Đăng ký tài khoản
   */
  async register(name: string, email: string, password: string) {
    return apiClient.post('/auth/register', { name, email, password });
  },

  /**
   * Lấy thông tin user hiện tại
   */
  async getMe() {
    return apiClient.get('/auth/me');
  },

  /**
   * Đăng xuất
   */
  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/auth/login';
  },

  /**
   * Kiểm tra đã đăng nhập chưa
   */
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('access_token');
  },
};

export default authService;
