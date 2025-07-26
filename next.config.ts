import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  // Enable static export for Cloudflare Pages
  trailingSlash: true,
}

export default nextConfig