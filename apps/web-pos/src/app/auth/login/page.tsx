'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/auth.service';
import { LogIn, ShoppingCart, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.login(form.email, form.password);
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-md-sys-color-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-md-sys-color-surface-variant/30 backdrop-blur-xl p-8 rounded-md3-extra-large border border-md-sys-color-outline-variant shadow-md3-3">
        
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-4 drop-shadow-md transition-transform hover:scale-105 duration-300">
            <img src="/icons/logo.svg" alt="Retail POS Logo" className="w-full h-full" />
          </div>
          <h1 className="text-3xl font-black text-md-sys-color-primary tracking-tighter leading-tight uppercase">RETAIL POS</h1>
          <p className="text-md-sys-color-on-surface-variant mt-2 text-sm font-medium">
            Hệ thống quản lý bán hàng đa chi nhánh
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-md-sys-color-error-container text-md-sys-color-on-error-container rounded-md3-medium flex items-start gap-3 animate-in fade-in slide-in-from-top-1 duration-300">
            <AlertCircle size={20} className="shrink-0 mt-0.5" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-md-sys-color-on-surface-variant mb-1.5 ml-1">
              Email đăng nhập
            </label>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              placeholder="admin@demo.com"
              className="w-full h-14 px-4 bg-md-sys-color-surface rounded-md3-medium border border-md-sys-color-outline-variant focus:border-md-sys-color-primary focus:ring-2 focus:ring-md-sys-color-primary/20 outline-none transition-all text-md-sys-color-on-surface placeholder:text-md-sys-color-outline"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-md-sys-color-on-surface-variant mb-1.5 ml-1">
              Mật khẩu
            </label>
            <input
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              placeholder="••••••••"
              className="w-full h-14 px-4 bg-md-sys-color-surface rounded-md3-medium border border-md-sys-color-outline-variant focus:border-md-sys-color-primary focus:ring-2 focus:ring-md-sys-color-primary/20 outline-none transition-all text-md-sys-color-on-surface placeholder:text-md-sys-color-outline"
            />
          </div>

          <div className="flex items-center justify-between py-2">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" className="w-4 h-4 rounded border-md-sys-color-outline text-md-sys-color-primary focus:ring-md-sys-color-primary" />
              <span className="text-xs text-md-sys-color-on-surface-variant group-hover:text-md-sys-color-on-surface transition-colors">Ghi nhớ đăng nhập</span>
            </label>
            <button type="button" className="text-xs text-md-sys-color-primary font-bold hover:underline">Quên mật khẩu?</button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full h-14 mt-4 bg-md-sys-color-primary text-md-sys-color-on-primary rounded-full font-bold shadow-md3-2 hover:shadow-md3-3 active:scale-95 disabled:opacity-50 disabled:grayscale transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <LogIn size={20} />
                <span>ĐĂNG NHẬP</span>
              </>
            )}
          </button>
        </form>

        {/* Footer Info */}
        <div className="mt-8 text-center">
          <p className="text-xs text-md-sys-color-on-surface-variant mb-4">
            Tài khoản dùng thử: <br/>
            <code className="bg-md-sys-color-surface px-2 py-0.5 rounded border border-md-sys-color-outline-variant">admin@demo.com</code> / <code className="bg-md-sys-color-surface px-2 py-0.5 rounded border border-md-sys-color-outline-variant">Demo@123456</code>
          </p>
          <div className="h-px bg-md-sys-color-outline-variant w-full mb-4"></div>
          <p className="text-xs text-md-sys-color-on-surface-variant">
            © 2026 Antigravity Retail SaaS. All rights reserved.
          </p>
        </div>
      </div>
    </main>
  );
}
