import Link from 'next/link';

export default function HomePage() {
  return (
    <main
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontFamily: 'Inter, sans-serif',
      }}
    >
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        {/* Logo */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #e94560, #0f3460)',
            margin: '0 auto 1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
          }}
        >
          🛒
        </div>

        <h1
          style={{
            fontSize: '2.5rem',
            fontWeight: 700,
            marginBottom: '1rem',
            background: 'linear-gradient(90deg, #e94560, #a8edea)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Retail SaaS POS
        </h1>

        <p
          style={{
            fontSize: '1.1rem',
            color: '#a0aec0',
            maxWidth: 400,
            margin: '0 auto 2rem',
            lineHeight: 1.6,
          }}
        >
          Hệ thống quản lý bán lẻ đa người dùng thế hệ mới.
          Nhanh chóng, bảo mật, và hoạt động offline.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link
            href="/auth/login"
            style={{
              padding: '0.75rem 2rem',
              background: 'linear-gradient(135deg, #e94560, #c33652)',
              color: 'white',
              borderRadius: 8,
              textDecoration: 'none',
              fontWeight: 600,
              transition: 'transform 0.2s',
            }}
          >
            Đăng nhập
          </Link>

          <a
            href="http://localhost:3000/docs"
            target="_blank"
            rel="noreferrer"
            style={{
              padding: '0.75rem 2rem',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'white',
              borderRadius: 8,
              textDecoration: 'none',
              fontWeight: 600,
              backdropFilter: 'blur(10px)',
            }}
          >
            API Docs
          </a>
        </div>

        <p style={{ marginTop: '3rem', color: '#4a5568', fontSize: '0.85rem' }}>
          Phase 0 — Foundation Built ✅
        </p>
      </div>
    </main>
  );
}
