import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow cross-origin requests from local network during development
  allowedDevOrigins: [
    'localhost:3000',
    '10.40.15.19:3000',
    '10.40.15.19',
  ],
  // Disable Next.js dev indicator button
  devIndicators: false,
  // Pre-compile pages on startup for faster navigation
  experimental: {
    // Enable optimized package imports
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  // Force static generation where possible (compiles at build/startup)
  // This makes pages load faster after initial compile
  onDemandEntries: {
    // Keep pages in memory longer
    maxInactiveAge: 60 * 60 * 1000, // 1 hour
    // More pages can be kept
    pagesBufferLength: 10,
  },
  // Webpack configuration for pdf-parse compatibility
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
};

export default nextConfig;
