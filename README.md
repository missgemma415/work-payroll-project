# Scientia Capital Landing Page

A warm, human-centered landing page for Scientia Capital - the HR software that actually cares.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## 🌐 Deployment to Cloudflare Pages

### Option 1: GitHub Integration (Recommended)

1. Push this code to a GitHub repository
2. Go to [Cloudflare Pages](https://pages.cloudflare.com/)
3. Click "Create a project"
4. Connect your GitHub account
5. Select the repository
6. Use these build settings:
   - Framework preset: `Next.js (Static HTML Export)`
   - Build command: `npm run build`
   - Build output directory: `out`

### Option 2: Direct Upload

```bash
# Build the site
npm run build

# The static files will be in the 'out' directory
# Upload this directory to Cloudflare Pages
```

### Option 3: Wrangler CLI

```bash
# Install Wrangler
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Build and deploy
npm run build
wrangler pages deploy out --project-name=scientia-capital
```

## 🎨 Design Philosophy

- **Warm Colors**: Soft creams, sage greens, and trust blues
- **Rounded Everything**: No harsh edges, everything flows
- **Human Language**: No corporate jargon
- **Gentle Animations**: Subtle, delightful interactions

## 📁 Project Structure

```
scientia-capital-landing/
├── app/
│   ├── layout.tsx      # Main layout with fonts
│   ├── page.tsx        # Homepage
│   └── globals.css     # Warm, custom styles
├── components/
│   ├── ui/            # shadcn/ui components
│   ├── Hero.tsx       # Hero section
│   ├── Features.tsx   # Features grid
│   ├── HowItWorks.tsx # Process explanation
│   ├── Pricing.tsx    # Pricing cards
│   └── ...
└── public/            # Static assets
```

## 🔧 Environment Variables

For local development, create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8787
```

For production, set in Cloudflare Pages dashboard:

```env
NEXT_PUBLIC_API_URL=https://api.scientiacapital.com
```

## 🤝 Contributing

This is a startup built with sweat equity. Every contribution matters!

---

Built with ❤️ for HR teams everywhere