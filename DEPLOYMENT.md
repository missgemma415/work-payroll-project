# Deployment Guide - CEO Payroll Analytics Platform

## Production Architecture

### Services Overview
- **Next.js Frontend**: Executive dashboard with Fortune 500 styling (Port 3000)
- **Neural Forecasting Service**: FastAPI + NeuralProphet + TimeGPT (Port 8000)
- **QuickBooks Integration Service**: FastAPI + OAuth 2.0 + python-quickbooks (Port 8001)
- **Database**: Neon PostgreSQL Serverless with 6 QuickBooks tables
- **MCP Services**: Taskmaster AI + Serena for development coordination

## Quick Start

### 1. Environment Setup
```bash
# Copy and configure environment variables
cp .env.example .env.local

# Required variables:
NEON_DATABASE_URL="postgresql://..."
ANTHROPIC_API_KEY="sk-ant-..."
QUICKBOOKS_CLIENT_ID="your-app-id"
QUICKBOOKS_CLIENT_SECRET="your-app-secret"
```

### 2. Database Setup
```bash
# Install PostgreSQL client
brew install postgresql

# Apply QuickBooks schema
psql $NEON_DATABASE_URL -f quickbooks_service/schema.sql
```

### 3. Service Deployment

#### Neural Forecasting Service
```bash
cd forecasting_service
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000
```

#### QuickBooks Integration Service  
```bash
cd quickbooks_service
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8001
```

#### Next.js Frontend
```bash
npm install
npm run build
npm start
```

## Production Configuration

### Docker Deployment (Recommended)

#### Neural Forecasting
```bash
cd forecasting_service
docker build -t neural-forecasting .
docker run -p 8000:8000 -e NEON_DATABASE_URL="..." neural-forecasting
```

#### QuickBooks Integration
```bash
cd quickbooks_service
docker build -t quickbooks-integration .
docker run -p 8001:8001 -e NEON_DATABASE_URL="..." quickbooks-integration
```

### Vercel Deployment (Next.js)
```bash
# Set environment variables in Vercel dashboard
vercel env add NEON_DATABASE_URL
vercel env add ANTHROPIC_API_KEY
vercel env add QUICKBOOKS_CLIENT_ID
vercel env add QUICKBOOKS_CLIENT_SECRET

# Deploy
vercel --prod
```

## QuickBooks OAuth Setup

### 1. Create QuickBooks Developer App
1. Go to [developer.intuit.com](https://developer.intuit.com)
2. Create new app with "Accounting" scope
3. Configure redirect URI: `https://yourdomain.com/api/quickbooks/callback`
4. Note Client ID and Client Secret

### 2. OAuth Flow Testing
```bash
# Initialize OAuth (returns authorization URL)
curl -X POST https://yourdomain.com/api/quickbooks?action=initialize_auth \
  -H "Content-Type: application/json" \
  -d '{"state": "test-auth"}'

# After user authorization, test employee sync
curl -X POST https://yourdomain.com/api/quickbooks?action=sync_employees&realm_id=123456
```

## Monitoring & Health Checks

### Service Health Endpoints
- Neural Forecasting: `GET /health`
- QuickBooks Integration: `GET /health` 
- Next.js API: `GET /api/quickbooks` (status info)

### Database Monitoring
```sql
-- Check QuickBooks tables
SELECT table_name, table_rows 
FROM information_schema.tables 
WHERE table_name LIKE 'quickbooks%';

-- Monitor sync operations
SELECT * FROM quickbooks_sync_log 
ORDER BY completed_at DESC LIMIT 10;
```

## Performance Optimization

### Rate Limiting Compliance
- QuickBooks API: 500 requests/minute, 10 concurrent
- Automatic retry with exponential backoff
- Circuit breaker for service failures

### Caching Strategy (Optional)
```bash
# Redis setup for production
redis-server --port 6379
export REDIS_URL="redis://localhost:6379"
```

## Security Best Practices

### 1. Credential Management
- Never commit actual API keys to version control
- Use secure environment variable management
- Rotate credentials regularly (quarterly recommended)

### 2. Database Security
- Enable SSL/TLS for all database connections
- Use connection pooling to prevent connection exhaustion
- Regular backup and disaster recovery testing

### 3. API Security
- HTTPS-only for all production endpoints  
- CORS configuration for allowed origins
- Request rate limiting and DDoS protection

## Troubleshooting

### Common Issues

#### Database Connection Errors
```bash
# Test database connectivity
NEON_DATABASE_URL="..." psql $NEON_DATABASE_URL -c "SELECT 1;"
```

#### QuickBooks OAuth Failures
```bash
# Check token expiration
SELECT realm_id, token_expires_at, active 
FROM quickbooks_credentials 
WHERE active = true;
```

#### Service Communication Issues
```bash
# Test service connectivity
curl http://localhost:8000/health
curl http://localhost:8001/health
```

### Logs and Debugging
- Next.js logs: Check Vercel dashboard or console
- FastAPI logs: `uvicorn main:app --log-level debug`
- Database logs: Monitor Neon dashboard for query performance

## Scaling Considerations

### Horizontal Scaling
- Deploy multiple FastAPI instances behind load balancer
- Use Redis for shared session/cache state
- Database connection pooling for multiple instances

### Performance Targets
- Executive insights: Sub-10 second response times
- QuickBooks sync: <60 seconds for 100+ employees
- Neural forecasting: <30 seconds for 12-month predictions

## Support and Maintenance

### Regular Tasks
- Weekly: Review sync logs and error rates
- Monthly: Test OAuth refresh mechanism  
- Quarterly: Rotate API keys and credentials
- Annually: Review and update dependencies

### Mexico City Demo Ready Features
- ✅ Neural forecasting with 11% efficiency predictions
- ✅ QuickBooks integration with OAuth 2.0 security
- ✅ Executive dashboard with Fortune 500 styling
- ✅ Mobile-responsive design for prospect presentations
- ✅ Real-time sync with confidence intervals