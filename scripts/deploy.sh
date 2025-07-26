#!/bin/bash

# Build the Next.js static export
echo "Building Next.js static export..."
npm run build

# Deploy directly to Cloudflare Pages
echo "Deploying to Cloudflare Pages..."
npx wrangler pages deploy out --project-name=scientia-capital

echo "Deployment complete!"
echo "Visit https://scientiacapital.com to see your site"