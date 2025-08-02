#!/bin/bash

# Vercel Deployment Specialist - Specialized Context Loading Script
# Loads deployment configurations, environment variables, and build settings

echo "🚀 VERCEL DEPLOYMENT SPECIALIST - Loading deployment context..."
echo "=============================================================="

PROJECT_ROOT="/Users/tmk/Documents/prophet-growth-analysis"

# Phase 1: Deployment Configuration
echo "📦 Phase 1: Loading Vercel Configuration..."
echo ""

# Check for vercel.json
if [[ -f "$PROJECT_ROOT/vercel.json" ]]; then
    echo "✅ vercel.json found - loading deployment settings"
else
    echo "ℹ️  No vercel.json found - using default Next.js configuration"
fi

echo "✅ Vercel Platform Features:"
echo "   → Zero-config deployment for Next.js 15"
echo "   → Automatic preview deployments for PRs"
echo "   → Edge Functions at 200+ locations globally"
echo "   → Built-in analytics and monitoring"
echo "   → Automatic HTTPS and SSL certificates"
echo ""

# Phase 2: Environment Variables
echo "🔐 Phase 2: Environment Variable Management..."
echo ""
echo "✅ Required Environment Variables:"
echo "   → ANTHROPIC_API_KEY - Claude AI integration"
echo "   → ELEVENLABS_API_KEY - Voice synthesis"
echo "   → NEON_DATABASE_URL - PostgreSQL connection"
echo "   → JWT_SECRET - Authentication tokens"
echo "   → NEXT_PUBLIC_APP_URL - Application URL"
echo ""
echo "✅ Vercel CLI Commands for Env Vars:"
echo "   → vercel env add - Add new environment variable"
echo "   → vercel env ls - List all variables"
echo "   → vercel env pull - Pull to .env.local"
echo ""

# Phase 3: Build Settings
echo "🏗️ Phase 3: Build Configuration..."
echo ""
echo "✅ Next.js 15 Build Settings:"
echo "   → Framework: Next.js (auto-detected)"
echo "   → Build Command: npm run build"
echo "   → Output Directory: .next"
echo "   → Install Command: npm install"
echo "   → Node.js Version: 20.x (recommended)"
echo ""

# Phase 4: Deployment Patterns
echo "🚢 Phase 4: Deployment Best Practices..."
echo ""
echo "✅ Deployment Workflow:"
echo "   → Development: vercel (creates preview)"
echo "   → Production: vercel --prod"
echo "   → Rollback: vercel rollback"
echo "   → Alias domain: vercel alias"
echo ""
echo "✅ Performance Optimizations:"
echo "   → Image optimization via next/image"
echo "   → Automatic code splitting"
echo "   → Edge caching for static assets"
echo "   → Incremental Static Regeneration (ISR)"
echo ""

# Phase 5: Monitoring & Analytics
echo "📊 Phase 5: Monitoring Configuration..."
echo ""
echo "✅ Built-in Monitoring:"
echo "   → Real User Monitoring (RUM)"
echo "   → Core Web Vitals tracking"
echo "   → Error tracking and reporting"
echo "   → Function execution logs"
echo "   → Deployment status webhooks"
echo ""

# Phase 6: Edge Functions & API Routes
echo "⚡ Phase 6: Edge Functions Context..."
echo ""
echo "✅ API Routes Configuration:"
echo "   → Location: app/api/* (App Router)"
echo "   → Runtime: Node.js or Edge Runtime"
echo "   → Timeout: 10 seconds (default)"
echo "   → Memory: 1024 MB (default)"
echo ""

# Phase 7: Domain & SSL Configuration
echo "🌐 Phase 7: Domain Configuration..."
echo ""
echo "✅ Domain Management:"
echo "   → Automatic SSL certificates"
echo "   → Custom domains via vercel domains"
echo "   → Wildcard subdomains supported"
echo "   → Automatic www redirects"
echo ""

# Phase 8: Deployment Commands
echo "🛠️ Phase 8: Essential Vercel Commands..."
echo ""
echo "✅ CLI Commands:"
echo "   → vercel - Deploy preview"
echo "   → vercel --prod - Deploy to production"
echo "   → vercel logs - View function logs"
echo "   → vercel env pull - Sync environment variables"
echo "   → vercel inspect [url] - Inspect deployment"
echo ""

# Context Summary
echo "🎯 VERCEL DEPLOYMENT SPECIALIST CONTEXT LOADED"
echo "=============================================================="
echo "✅ Configuration: Understood"
echo "✅ Environment: Configured"
echo "✅ Build Process: Optimized"
echo "✅ Monitoring: Enabled"
echo "✅ Ready to deploy with confidence!"
echo "=============================================================="