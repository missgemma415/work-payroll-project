/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true
  },
  // Skip static optimization for pages that require runtime environment
  skipTrailingSlashRedirect: true,
  // Ensure API routes are not pre-rendered during build
  trailingSlash: false,
  // Skip build-time data fetching that requires environment variables
  env: {
    SKIP_ENV_VALIDATION: process.env.NODE_ENV === 'production' ? 'false' : 'true'
  }
}

module.exports = nextConfig