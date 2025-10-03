const config = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  turbopack: {
    root: __dirname,
  },
  experimental: {
    // Enable optimizations for Vercel
    optimizePackageImports: ['framer-motion'],
    // Enable static optimization
    scrollRestoration: true,
  },
  // External packages for server-side rendering
  serverExternalPackages: ['qr-code-styling'],
  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Image optimization
  images: {
    domains: ['www.youtube.com', 'youtube.com', 'github.com', 'img.youtube.com'],
    formats: ['image/webp', 'image/avif'],
  },
  // Headers for caching
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=60, stale-while-revalidate=300' },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default config;
