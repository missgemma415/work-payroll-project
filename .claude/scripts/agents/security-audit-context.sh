#!/bin/bash

# Security Auditor Expert - Specialized Context Loading Script
# Loads security patterns, vulnerability history, and compliance requirements

echo "🔐 SECURITY AUDITOR EXPERT - Loading security context..."
echo "======================================================="

PROJECT_ROOT="/Users/tmk/Documents/prophet-growth-analysis"

# Phase 1: Security Architecture Overview
echo "🛡️ Phase 1: Security Architecture Context..."
echo ""
echo "✅ Current Security Stack:"
echo "   → Authentication: JWT tokens with secure storage"
echo "   → Password Security: bcrypt with 10 rounds"
echo "   → API Security: Rate limiting on all endpoints"
echo "   → Database: Row-level security (RLS) ready"
echo "   → HTTPS: Enforced via Vercel platform"
echo ""

# Phase 2: Authentication & Authorization
echo "🔑 Phase 2: Auth Security Patterns..."
echo ""
echo "✅ JWT Implementation:"
echo "   → Secure token generation with crypto"
echo "   → HttpOnly cookies for storage"
echo "   → Refresh token rotation"
echo "   → Session timeout management"
echo ""
echo "✅ Password Security:"
echo "   → Minimum 8 characters required"
echo "   → bcrypt hashing (never plain text)"
echo "   → Password reset via secure tokens"
echo "   → Failed login attempt tracking"
echo ""

# Phase 3: API Security Checklist
echo "🌐 Phase 3: API Security Requirements..."
echo ""
echo "✅ API Security Measures:"
echo "   → Input validation with Zod schemas"
echo "   → SQL injection prevention (prepared statements)"
echo "   → XSS protection via Next.js sanitization"
echo "   → CSRF protection with tokens"
echo "   → Rate limiting per IP/user"
echo ""

# Phase 4: Environment Variable Security
echo "🔐 Phase 4: Secrets Management..."
echo ""
echo "✅ Environment Variables to Audit:"
echo "   → Never commit .env.local files"
echo "   → Rotate API keys regularly"
echo "   → Use Vercel's encrypted env storage"
echo "   → Different keys for dev/staging/prod"
echo ""
echo "⚠️  Critical Secrets to Protect:"
echo "   → JWT_SECRET - Authentication signing"
echo "   → Database URLs - Contains credentials"
echo "   → API Keys - Third-party services"
echo "   → OAuth Secrets - If implemented"
echo ""

# Phase 5: Data Protection
echo "💾 Phase 5: Data Security Context..."
echo ""
echo "✅ Data Protection Measures:"
echo "   → Encrypt sensitive data at rest"
echo "   → Use HTTPS for data in transit"
echo "   → Implement data retention policies"
echo "   → Regular security backups"
echo "   → GDPR compliance considerations"
echo ""

# Phase 6: Common Vulnerabilities
echo "🐛 Phase 6: Vulnerability Patterns to Check..."
echo ""
echo "✅ OWASP Top 10 Checklist:"
echo "   → Injection attacks (SQL, NoSQL)"
echo "   → Broken authentication"
echo "   → Sensitive data exposure"
echo "   → XML External Entities (XXE)"
echo "   → Broken access control"
echo "   → Security misconfiguration"
echo "   → Cross-Site Scripting (XSS)"
echo "   → Insecure deserialization"
echo "   → Using components with known vulnerabilities"
echo "   → Insufficient logging & monitoring"
echo ""

# Phase 7: Security Headers
echo "📋 Phase 7: Security Headers Configuration..."
echo ""
echo "✅ Required Security Headers:"
echo "   → Content-Security-Policy"
echo "   → X-Frame-Options: DENY"
echo "   → X-Content-Type-Options: nosniff"
echo "   → Referrer-Policy: strict-origin"
echo "   → Permissions-Policy"
echo ""

# Phase 8: Dependency Security
echo "📦 Phase 8: Dependency Scanning..."
echo ""
echo "✅ Dependency Audit Commands:"
echo "   → npm audit - Check for vulnerabilities"
echo "   → npm audit fix - Auto-fix issues"
echo "   → Keep dependencies updated"
echo "   → Review dependency licenses"
echo ""

# Phase 9: Security Testing
echo "🧪 Phase 9: Security Testing Checklist..."
echo ""
echo "✅ Testing Requirements:"
echo "   → Penetration testing for APIs"
echo "   → Authentication flow testing"
echo "   → Input validation testing"
echo "   → Rate limit testing"
echo "   → Error message sanitization"
echo ""

# Context Summary
echo "🎯 SECURITY AUDITOR EXPERT CONTEXT LOADED"
echo "======================================================="
echo "✅ Security Architecture: Understood"
echo "✅ Vulnerability Patterns: Loaded"
echo "✅ Compliance Requirements: Known"
echo "✅ Testing Checklist: Ready"
echo "✅ Ready to audit and secure the application!"
echo "======================================================="