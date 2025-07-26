import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Removed 'output: export' to enable API routes
  // This was preventing the app from working as a dynamic SaaS
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
    ],
  },
};

export default nextConfig;
