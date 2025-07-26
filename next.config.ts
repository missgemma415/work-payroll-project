import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export', // Static export for Cloudflare Pages
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
