# Deploying Scientia Capital to Cloudflare Pages

## Step-by-Step Deployment Guide

### 1. Prepare Your Repository

First, initialize git and push to GitHub:

```bash
git init
git add .
git commit -m "Initial commit: Scientia Capital landing page"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/scientia-capital-landing.git
git push -u origin main
```

### 2. Deploy to Cloudflare Pages

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Navigate to "Workers & Pages" in the sidebar
3. Click "Create" → "Pages" → "Connect to Git"
4. Authorize GitHub and select your repository
5. Configure build settings:
   - **Project name**: `scientia-capital`
   - **Production branch**: `main`
   - **Framework preset**: `Next.js (Static HTML Export)`
   - **Build command**: `npm run build`
   - **Build output directory**: `out`

### 3. Custom Domain Setup

After deployment:

1. Go to your Pages project settings
2. Click "Custom domains"
3. Add `scientiacapital.com`
4. Update your domain's DNS records:
   - Add a CNAME record pointing to `scientia-capital.pages.dev`
   - Or use Cloudflare's nameservers for automatic setup

### 4. Environment Variables (if needed)

In Cloudflare Pages settings:
- Go to Settings → Environment variables
- Add any production variables like `NEXT_PUBLIC_API_URL`

### 5. Deploy Updates

Any push to the `main` branch will automatically trigger a new deployment!

## Local Testing Before Deploy

```bash
# Build locally
npm run build

# The static site is in the 'out' directory
# You can preview it with:
npx serve out
```

## Quick Deploy with Wrangler

If you prefer command line:

```bash
# Install wrangler globally
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Deploy directly
npm run build && wrangler pages deploy out --project-name=scientia-capital
```

Your site will be live at:
- `https://scientia-capital.pages.dev` (automatic)
- `https://scientiacapital.com` (after domain setup)

🎉 That's it! Your warm, human-centered HR platform is live!