# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Core Principles

- **Zero-tolerance policy for TypeScript and ESLint errors going forward!**
- Enterprise-grade code quality standards
- Security-first approach
- Clean, maintainable code
- Simple, scalable architecture

## Project Overview

**Work Payroll Project** is a payroll cost management and analysis platform. Built with a clean MVP stack: Next.js 15 + Neon PostgreSQL + Vercel deployment.

## Architecture Overview

### Modern Stack Architecture

We use a simplified, scalable approach:

- **Frontend**: Next.js 15 with App Router (React 19)
- **Deployment**: Vercel (seamless Next.js integration) 
- **Database**: Neon PostgreSQL (serverless, scalable)
- **Testing**: Jest with React Testing Library

### Key Technologies

1. **Next.js 15 App Router**
   - Server-side rendering
   - API routes for backend logic
   - React 19 with concurrent features
   - TypeScript strict mode

2. **Vercel Platform**
   - Zero-config deployment
   - Edge functions
   - Environment management
   - Analytics and monitoring

3. **Neon PostgreSQL**
   - Serverless database
   - Auto-scaling
   - Branching for development
   - Connection pooling

4. **Simple Architecture**
   - Direct database integration
   - RESTful API design
   - No complex orchestration layers

## API Architecture

### Current API Routes Structure

```
app/api/
├── employee-costs/route.ts    # Employee cost analysis endpoints
├── export/excel/route.ts      # Excel export functionality  
├── process-files/route.ts     # File processing for payroll data
├── scan-files/route.ts        # File scanning and validation
├── health/route.ts            # Health check and environment validation
├── chat/route.ts              # Basic chat functionality
└── voice/route.ts             # Voice interface (future)
```

### API Development Guidelines

```typescript
// Example API route structure (based on /api/employee-costs)
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/database';

const employeeCostSchema = z.object({
  employee_id: z.string().uuid(),
  base_salary: z.number().positive(),
  benefits_multiplier: z.number().min(1).max(2),
  start_date: z.string().datetime().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = employeeCostSchema.parse(body);

    // Calculate total cost
    const totalCost = validatedData.base_salary * validatedData.benefits_multiplier;
    
    // Store in database
    const result = await db.employee_costs.create({
      ...validatedData,
      total_annual_cost: totalCost,
      created_at: new Date().toISOString(),
    });

    return NextResponse.json({
      employee_cost: result,
      total_annual_cost: totalCost,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: 'Request failed' }, { status: 500 });
  }
}
```

## Environment Configuration

```bash
# Database (Required)
NEON_DATABASE_URL="postgresql://neondb_owner:npg_26KGepdyhVnU@ep-ancient-sea-aenslh7h-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require"

# App Configuration
NEXT_PUBLIC_APP_URL=https://work-payroll-project.vercel.app
NODE_ENV=production

# Security
JWT_SECRET=your-super-secret-jwt-key-minimum-32-chars

# Future APIs (not currently used in MVP)
GOOGLE_GEMINI_API_KEY=your-google-gemini-api-key
ELEVENLABS_API_KEY=your-elevenlabs-api-key
```

## Database Setup

### Neon PostgreSQL Database

The database is fully configured with the following tables:

- `organizations` - Company/organization data
- `users` - User accounts and profiles  
- `projects` - Project tracking with hourly rates
- `imported_files` - File upload tracking
- `payroll_data` - Core payroll and expense data
- `employee_costs` - Aggregated cost analysis
- `activity_logs` - Audit trail
- `migrations` - Migration tracking

### Database Connection Test

```bash
# Test database connection
npm run db:test

# Run database setup (if needed)
node setup-db-final.js
```

### Development Commands

```bash
# Development
npm run dev          # Start dev server (Next.js)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Check for ESLint errors
npm run lint:fix     # Auto-fix ESLint issues
npm run type-check   # Run TypeScript checks
npm run validate     # Run all checks (lint + type + format)
npm run format       # Format code with Prettier
npm run test         # Run Jest tests

# Database
npm run db:test      # Test database connection
npm run migrate      # Run database migrations

# Deployment
npm run deploy       # Deploy to Vercel production
```

## Development Guidelines

### API Route Development

- Use Zod for request/response validation
- Implement proper error handling
- Add rate limiting for public endpoints
- Log important events for debugging
- Follow RESTful conventions

### Security

- Never expose API keys in client-side code
- Use environment variables for all secrets
- Implement proper authentication middleware
- Validate all user inputs
- Use HTTPS in production

### Database

- Use connection pooling (Neon handles this automatically)
- Use prepared statements to prevent SQL injection
- Index frequently queried columns
- Database is fully set up with all required tables

## Common Development Tasks

### Build and Quality Checks

```bash
# Build the project
npm run build

# Run linting
npm run lint
npm run lint:fix    # Auto-fix issues

# TypeScript type checking
npm run type-check

# Run all validation checks (lint + type-check + format)
npm run validate

# Format code
npm run format
npm run format:check  # Check without fixing
```

### Testing

```bash
# Run all tests
npm run test

# Run specific test file
npm run test -- components/dashboard/Forecast.test.tsx

# Test API endpoints
curl -X GET http://localhost:3000/api/health
curl -X POST http://localhost:3000/api/employee-costs \
  -H "Content-Type: application/json" \
  -d '{"employee_id": "123", "base_salary": 75000}'
```

### Database Operations

```bash
# Test database connection
npm run db:test

# Database is fully set up - no migrations needed
# All tables created: organizations, users, projects, payroll_data, etc.
```

## Monitoring

- Use Vercel Analytics for performance monitoring
- Set up error tracking with Vercel's built-in error reporting
- Track database performance with Neon metrics
- Monitor API usage for future integrations

## Best Practices

1. **Code Quality**
   - Follow TypeScript strict mode
   - Use ESLint and Prettier
   - Write tests for API routes
   - Document complex logic

2. **Performance**
   - Use Next.js built-in optimizations
   - Implement caching for expensive operations
   - Optimize database queries
   - Use Vercel Edge Functions when appropriate

3. **User Experience**
   - Provide loading states
   - Handle errors gracefully
   - Implement progressive enhancement
   - Ensure accessibility compliance

## Memory and Context Management

The system maintains context through:

- **Database persistence**: User sessions, payroll data, cost analysis
- **Environment-based configuration**: Per-deployment settings
- **Simple state management**: React Query for client state
- **File processing**: CSV/Excel payroll data import

## Key File Locations

- **API Routes**: `app/api/` - All backend endpoints
- **Components**: `components/` - React components organized by feature
- **Database**: `lib/database/` - Database connection and repositories
- **Types**: `lib/types/` - TypeScript type definitions
- **Migrations**: `migrations/` - Database schema migrations
- **Tests**: Component tests alongside components (e.g., `Forecast.test.tsx`)

## Critical Configuration

- **TypeScript**: Strict mode enabled with all checks (see `tsconfig.json`)
- **ESLint**: Configured with Next.js and TypeScript rules
- **Jest**: Configured with Next.js SWC transformer
- **Database**: Neon PostgreSQL with connection pooling (fully configured with 8 tables)
