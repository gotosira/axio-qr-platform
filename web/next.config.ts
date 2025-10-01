const config = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  turbopack: {
    root: __dirname,
  },
  experimental: {
    // Enable optimizations for Vercel
    optimizePackageImports: ['qr-code-styling', 'framer-motion'],
  },
  // Optimize external dependencies
  transpilePackages: ['qr-code-styling'],
  // Performance optimizations
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Image optimization
  images: {
    domains: ['www.youtube.com', 'youtube.com', 'github.com'],
    formats: ['image/webp', 'image/avif'],
  },
};

export default config;
