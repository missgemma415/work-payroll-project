#!/bin/bash

# Setup Vercel environment variables
echo "Setting up Vercel environment variables..."

# Database URLs
echo "postgresql://neondb_owner:npg_R0Js4pbAUxCk@ep-spring-hat-ae8vepg8.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require" | vercel env add DATABASE_URL production preview development
echo "postgresql://neondb_owner:npg_R0Js4pbAUxCk@ep-spring-hat-ae8vepg8.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require" | vercel env add NEON_DATABASE_URL production preview development

# JWT Secret (using a secure default for now)
echo "prod-secret-key-CHANGE-IN-PRODUCTION-5f3b9c8d7e2a1f6h9k3m5n8p2q4r6t8" | vercel env add JWT_SECRET production preview development

# Other security settings
echo "10" | vercel env add BCRYPT_ROUNDS production preview development
echo "prod-session-secret-CHANGE-IN-PRODUCTION-9f8b7c6d5e4a3b2c1d2e3f4g5" | vercel env add SESSION_SECRET production preview development

# Feature flags
echo "true" | vercel env add ENABLE_REGISTRATION production preview development
echo "false" | vercel env add ENABLE_MOCK_DATA production
echo "true" | vercel env add ENABLE_MOCK_DATA preview development

# API Keys (placeholders - need real keys)
echo "your-anthropic-api-key" | vercel env add ANTHROPIC_API_KEY production preview development
echo "your-elevenlabs-api-key" | vercel env add ELEVENLABS_API_KEY production preview development

echo "Environment variables added successfully!"
echo "NOTE: Remember to update ANTHROPIC_API_KEY and ELEVENLABS_API_KEY with real values"