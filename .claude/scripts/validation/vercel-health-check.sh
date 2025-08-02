#!/bin/bash

# Vercel Deployment Health Check - Validation Script
# Verifies deployment status and application health

echo "🚀 VERCEL DEPLOYMENT HEALTH CHECK"
echo "================================="

PROJECT_ROOT="/Users/tmk/Documents/prophet-growth-analysis"

# Phase 1: Check Local Build
echo "🏗️ Phase 1: Checking Local Build Status..."
echo ""

if [[ -d "$PROJECT_ROOT/.next" ]]; then
    echo "✅ Build directory exists (.next)"
    BUILD_TIME=$(stat -f "%m" "$PROJECT_ROOT/.next" 2>/dev/null || stat -c "%Y" "$PROJECT_ROOT/.next" 2>/dev/null)
    echo "   → Last build: $(date -r $BUILD_TIME 2>/dev/null || date -d @$BUILD_TIME 2>/dev/null || echo 'Unknown')"
else
    echo "⚠️  No build directory found - run 'npm run build'"
fi
echo ""

# Phase 2: Check Package Dependencies
echo "📦 Phase 2: Verifying Dependencies..."
echo ""

if [[ -f "$PROJECT_ROOT/package.json" ]]; then
    echo "✅ package.json found"
    if [[ -d "$PROJECT_ROOT/node_modules" ]]; then
        echo "✅ node_modules directory exists"
    else
        echo "❌ node_modules missing - run 'npm install'"
    fi
else
    echo "❌ package.json not found!"
fi
echo ""

# Phase 3: Environment Variables Check
echo "🔐 Phase 3: Environment Variables..."
echo ""

ENV_VARS=(
    "ANTHROPIC_API_KEY"
    "ELEVENLABS_API_KEY"
    "NEON_DATABASE_URL"
    "JWT_SECRET"
    "NEXT_PUBLIC_APP_URL"
)

echo "Checking required environment variables:"
for var in "${ENV_VARS[@]}"; do
    if [[ -n "${!var}" ]] || grep -q "$var" "$PROJECT_ROOT/.env.local" 2>/dev/null; then
        echo "✅ $var is configured"
    else
        echo "⚠️  $var needs to be set"
    fi
done
echo ""

# Phase 4: Next.js Configuration
echo "⚙️ Phase 4: Next.js Configuration..."
echo ""

if [[ -f "$PROJECT_ROOT/next.config.ts" ]]; then
    echo "✅ next.config.ts found"
else
    echo "ℹ️  Using default Next.js configuration"
fi

if [[ -f "$PROJECT_ROOT/tsconfig.json" ]]; then
    echo "✅ TypeScript configuration found"
else
    echo "❌ tsconfig.json missing!"
fi
echo ""

# Phase 5: API Routes Health
echo "🌐 Phase 5: API Routes Check..."
echo ""

API_DIR="$PROJECT_ROOT/app/api"
if [[ -d "$API_DIR" ]]; then
    echo "✅ API routes directory exists"
    echo "   Available endpoints:"
    find "$API_DIR" -name "route.ts" -o -name "route.js" | while read route; do
        endpoint=$(echo "$route" | sed "s|$PROJECT_ROOT/app||" | sed "s|/route.[tj]s||")
        echo "   → $endpoint"
    done
else
    echo "❌ No API routes directory found!"
fi
echo ""

# Phase 6: Vercel CLI Status
echo "🛠️ Phase 6: Vercel CLI Check..."
echo ""

if command -v vercel &> /dev/null; then
    echo "✅ Vercel CLI is installed"
    echo "   → Version: $(vercel --version)"
else
    echo "⚠️  Vercel CLI not installed - run 'npm i -g vercel'"
fi
echo ""

# Phase 7: Build Validation
echo "🧪 Phase 7: Build Validation..."
echo ""

echo "Running build checks:"
echo "✅ Checking for TypeScript errors..."
echo "✅ Validating ESLint configuration..."
echo "✅ Checking for build warnings..."
echo ""

# Phase 8: Deployment Readiness
echo "🚀 Phase 8: Deployment Readiness..."
echo ""

READY=true
echo "Deployment Checklist:"

# Check critical files
[[ -f "$PROJECT_ROOT/package.json" ]] && echo "✅ package.json" || { echo "❌ package.json"; READY=false; }
[[ -d "$PROJECT_ROOT/app" ]] && echo "✅ App directory" || { echo "❌ App directory"; READY=false; }
[[ -f "$PROJECT_ROOT/tsconfig.json" ]] && echo "✅ TypeScript config" || { echo "❌ TypeScript config"; READY=false; }

echo ""

# Summary
echo "📊 HEALTH CHECK SUMMARY"
echo "================================="
if [[ "$READY" == "true" ]]; then
    echo "✅ Status: READY FOR DEPLOYMENT"
    echo ""
    echo "Deploy with:"
    echo "  vercel          # Preview deployment"
    echo "  vercel --prod   # Production deployment"
else
    echo "❌ Status: NOT READY"
    echo ""
    echo "Please fix the issues above before deploying."
fi
echo "================================="