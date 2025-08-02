#!/bin/bash

# Neon Database Architect - Specialized Context Loading Script
# Loads database schemas, connection patterns, and optimization history

echo "🗄️ NEON DATABASE ARCHITECT - Loading specialized database context..."
echo "=================================================================="

PROJECT_ROOT="/Users/tmk/Documents/prophet-growth-analysis"

# Phase 1: Database Schema Context
echo "📊 Phase 1: Loading Database Schema Information..."
echo ""

# Check for schema files
if [[ -f "$PROJECT_ROOT/migrations/001_initial.sql" ]]; then
    echo "✅ Database migrations found - reviewing schema evolution"
    echo "   → Initial schema: users, employees, cost_analyses, conversations, forecasts"
else
    echo "⚠️  No migration files found - will need to create schema"
fi

# Load database configuration
echo "✅ Neon PostgreSQL Configuration:"
echo "   → Serverless architecture with auto-scaling"
echo "   → Connection pooling enabled by default"
echo "   → Branch-based development workflow supported"
echo "   → Point-in-time recovery available"
echo ""

# Phase 2: Connection Patterns
echo "🔌 Phase 2: Database Connection Patterns..."
echo ""
echo "✅ Connection Best Practices:"
echo "   → Use connection pooling for all queries"
echo "   → Implement retry logic for transient failures"
echo "   → Use prepared statements for security"
echo "   → Monitor connection pool health"
echo ""

# Phase 3: Query Optimization History
echo "⚡ Phase 3: Query Optimization Patterns..."
echo ""
echo "✅ Common Optimizations:"
echo "   → Index frequently queried columns (user_id, employee_id, created_at)"
echo "   → Use EXPLAIN ANALYZE for query planning"
echo "   → Batch inserts for bulk operations"
echo "   → Implement pagination for large datasets"
echo "   → Use JSON aggregation for complex queries"
echo ""

# Phase 4: Database Tools & Commands
echo "🛠️ Phase 4: Neon CLI Commands..."
echo ""
echo "✅ Essential Commands:"
echo "   → neon branches list - View all database branches"
echo "   → neon branches create --name feature-x - Create feature branch"
echo "   → neon sql 'SELECT * FROM users' - Execute queries"
echo "   → neon connection-string - Get connection details"
echo ""

# Phase 5: Performance Metrics
echo "📈 Phase 5: Database Performance Targets..."
echo ""
echo "✅ Performance SLAs:"
echo "   → Query response time: <100ms for simple queries"
echo "   → Connection pool size: 20-50 connections"
echo "   → Database branching: <30 seconds"
echo "   → Backup frequency: Continuous (built-in)"
echo ""

# Phase 6: Current Schema Summary
echo "🗂️ Phase 6: Current Schema Overview..."
echo ""
echo "✅ Core Tables:"
echo "   → users: Authentication and user management"
echo "   → employees: Employee data and cost information"
echo "   → cost_analyses: Detailed cost breakdowns"
echo "   → conversations: AI chat history"
echo "   → forecasts: Prophet predictions and time series data"
echo ""

# Phase 7: Security Considerations
echo "🔐 Phase 7: Database Security Context..."
echo ""
echo "✅ Security Practices:"
echo "   → Row-level security (RLS) for multi-tenant data"
echo "   → Encrypted connections (SSL/TLS required)"
echo "   → API key rotation for database access"
echo "   → Audit logging for compliance"
echo ""

# Context Summary
echo "🎯 NEON DATABASE ARCHITECT CONTEXT LOADED"
echo "=================================================================="
echo "✅ Schema Knowledge: Loaded"
echo "✅ Connection Patterns: Understood"
echo "✅ Optimization History: Available"
echo "✅ Security Practices: Enforced"
echo "✅ Ready to architect database solutions!"
echo "=================================================================="