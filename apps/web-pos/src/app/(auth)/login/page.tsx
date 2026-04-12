'use client';

import { useState } from 'react';
import { authService } from '@/services/auth.service';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await authService.login(form.email, form.password);
      // TODO: Lưu token vào store và redirect
      console.log('Logged in:', result);
      alert('Đăng nhập thành công!');
    } catch (err: unknown) {
      const error = err as { message?: string };
      setError(error.message || 'Đăng nhập thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div
        style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 16,
          padding: '2.5rem',
          width: '100%',
          maxWidth: 400,
          color: 'white',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🛒</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>
            Retail SaaS POS
          </h1>
          <p style={{ color: '#a0aec0', marginTop: '0.5rem', fontSize: '0.9rem' }}>
            Đăng nhập vào tài khoản của bạn
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            style={{
              background: 'rgba(233, 69, 96, 0.15)',
              border: '1px solid rgba(233, 69, 96, 0.3)',
              borderRadius: 8,
              padding: '0.75rem 1rem',
              marginBottom: '1rem',
              color: '#fc8181',
              fontSize: '0.9rem',
            }}
          >
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={(e) => { void handleSubmit(e); }}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e0', fontSize: '0.9rem' }}>
              Email
            </label>
            <input
              type="email"
              id="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              placeholder="admin@demo.com"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 8,
                color: 'white',
                fontSize: '1rem',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#cbd5e0', fontSize: '0.9rem' }}>
              Mật khẩu
            </label>
            <input
              type="password"
              id="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                borderRadius: 8,
                color: 'white',
                fontSize: '1rem',
                boxSizing: 'border-box',
                outline: 'none',
              }}
            />
          </div>

          <button
            type="submit"
            id="login-btn"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.875rem',
              background: loading
                ? 'rgba(233, 69, 96, 0.5)'
                : 'linear-gradient(135deg, #e94560, #c33652)',
              color: 'white',
              border: 'none',
              borderRadius: 8,
              fontSize: '1rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: '#718096', fontSize: '0.85rem' }}>
          Demo: admin@demo.com / Demo@123456
        </p>
      </div>
    </main>
  );
}
