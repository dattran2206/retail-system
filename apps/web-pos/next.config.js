/** @type {import('next').NextConfig} */

// PWA config (next-pwa)
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // PWA chỉ bật trong production
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'retail-saas-cache',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
      },
    },
  ],
});

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@retail-saas/types', '@retail-saas/utils'],
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1',
    NEXT_PUBLIC_APP_NAME: 'Retail SaaS POS',
  },
};

module.exports = withPWA(nextConfig);
