import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow cross-origin requests from local network during development
  allowedDevOrigins: [
    'localhost:3000',
    '10.40.15.19:3000',
    '10.40.15.19',
  ],
  // Webpack configuration for pdf-parse compatibility
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
};

export default nextConfig;
