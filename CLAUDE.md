# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Core Principles

- **Zero-tolerance policy for TypeScript and ESLint errors!**
- **Project-centric organization** - All data organized around client project identifiers
- Enterprise-grade code quality standards
- Security-first approach
- Clean, maintainable code architecture

## Project Overview

**Work Payroll Project** is a CEO desktop application for payroll analysis, project cost tracking, and workforce performance insights. Built with a clean MVP stack focusing on integrating data from SpringAhead, Paychex, and QuickBooks.

## Architecture Overview

### Current Tech Stack

We use a streamlined, proven approach:

- **Frontend**: Next.js 15 with App Router (React 19, TypeScript)
- **Database**: Neon PostgreSQL (serverless, 8 tables configured)
- **Deployment**: Vercel (zero-config deployment)
- **File Processing**: CSV/Excel parsing for payroll data
- **UI**: Radix UI components with Tailwind CSS
- **Charts**: Recharts for data visualization

### Key Technologies

1. **Next.js 15 App Router**
   - Server-side rendering
   - API routes for backend logic
   - React 19 with concurrent features
   - TypeScript strict mode ✅

2. **Neon PostgreSQL**
   - Serverless database (fully configured)
   - Auto-scaling capabilities
   - 8 tables with sample data
   - Connection pooling handled automatically

3. **Vercel Platform**
   - Zero-config deployment
   - Environment management
   - Global CDN
   - Build optimization

4. **File Processing System**
   - CSV/Excel parsing infrastructure
   - Multi-source data integration
   - Error handling and validation

## Database Schema (Configured)

The database includes 8 fully configured tables:

- **`organizations`** - Company/organization data
- **`users`** - User accounts and profiles  
- **`projects`** - Project tracking with hourly rates
- **`imported_files`** - File upload tracking
- **`payroll_data`** - Core payroll and expense data
- **`employee_costs`** - Aggregated cost analysis
- **`activity_logs`** - Audit trail
- **`migrations`** - Migration tracking

**Sample Projects Included:**
- PROJ-001: Client Alpha (Software Development, $150/hr)
- PROJ-002: Client Beta (Consulting Services, $200/hr)
- PROJ-003: Client Gamma (Data Analysis, $125/hr)
- INTERNAL: Internal company activities ($0/hr)

## API Architecture

### Current API Routes Structure

```
app/api/
├── chat/route.ts                # Basic chat functionality (placeholder)
├── employee-costs/route.ts      # Employee cost analysis endpoints
├── export/excel/route.ts        # Excel export functionality  
├── health/route.ts              # Health check and environment validation
├── process-files/route.ts       # File processing for payroll data
├── scan-files/route.ts          # File scanning and validation
└── voice/route.ts               # Voice interface (placeholder)
```

### API Development Guidelines

```typescript
// Example API route structure (based on existing patterns)
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { query } from '@/lib/database/connection';

const requestSchema = z.object({
  employee_id: z.string().uuid(),
  project_identifier: z.string(),
  period_start: z.string().datetime(),
  period_end: z.string().datetime()
});

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const validatedData = requestSchema.parse(body);

    // Business logic here
    const result = await query(
      `SELECT * FROM payroll_data WHERE employee_id = $1 AND project_identifier = $2`,
      [validatedData.employee_id, validatedData.project_identifier]
    );

    return NextResponse.json({
      success: true,
      data: result,
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
# Database (Already Configured)
NEON_DATABASE_URL="postgresql://neondb_owner:npg_26KGepdyhVnU@ep-ancient-sea-aenslh7h-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Application
NEXT_PUBLIC_APP_URL=https://work-payroll-project.vercel.app
NODE_ENV=production

# Authentication
JWT_SECRET=your-super-secret-jwt-key-minimum-32-chars

# Future Features (Optional)
GOOGLE_GEMINI_API_KEY=your-google-gemini-api-key
ELEVENLABS_API_KEY=your-elevenlabs-api-key
```

## Development Commands

```bash
# Development
npm run dev              # Start dev server (Next.js)
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Check for ESLint errors  
npm run lint:fix         # Auto-fix ESLint issues
npm run type-check       # Run TypeScript checks
npm run validate         # Run all checks (lint + type + format)
npm run format           # Format code with Prettier
npm run test             # Run Jest tests (5/5 passing)

# Database
npm run db:test          # Test database connection
npm run migrate          # Run database migrations (if needed)

# Deployment
npm run deploy           # Deploy to Vercel production
```

## Data Integration Strategy

### File Processing Flow

1. **File Upload**: CSV/Excel files via web interface
2. **Format Detection**: Automatic source identification (SpringAhead/Paychex/QuickBooks)
3. **Data Parsing**: Extract records with error handling
4. **Validation**: Check data integrity and required fields
5. **Storage**: Save to appropriate database tables
6. **Processing**: Calculate costs, allocate to projects
7. **Reporting**: Generate analysis and export capabilities

### Source Systems

**SpringAhead (Time Tracking)**
- Weekly CSV exports with hours by project
- Employee-level and daily breakdowns
- Project identifier mapping

**Paychex (Payroll)**
- Payroll reports with taxes, deductions, bonuses
- Employer contributions and garnishments
- Project-based cost attribution

**QuickBooks (Expenses)**
- Employee, contractor, vendor expenses
- Direct project cost allocation
- Expense categorization

**Customer Service Metrics**
- Call metrics and ticket data
- CSAT scores and resolution times
- Performance tracking by employee

## Development Guidelines

### Code Quality Standards

- **TypeScript**: Strict mode with full type safety ✅
- **ESLint**: Zero errors policy ✅
- **Testing**: Jest tests must pass (currently 5/5) ✅
- **Build**: Must compile successfully ✅

### API Route Best Practices

- Use Zod for request/response validation
- Implement proper error handling with specific status codes
- Log important events for debugging
- Follow RESTful conventions
- Include rate limiting for public endpoints

### Database Practices

- Use prepared statements (handled by query function)
- Implement proper indexing (already configured)
- Validate inputs before database operations
- Use connection pooling (handled by Neon automatically)

### Security Requirements

- Never expose API keys in client-side code
- Use environment variables for all secrets
- Validate all user inputs with Zod schemas
- Implement proper authentication middleware
- Use HTTPS in production (handled by Vercel)

## File Processing Implementation

### CSV Parser Structure

```typescript
// lib/parsers/csv-parser.ts (existing structure)
import { parse } from 'csv-parse';
import type CsvRow = Record<string, string | undefined>;

export interface SpringAheadRecord {
  employee_name: string;
  employee_id?: string;
  date: string;
  project_identifier: string;
  hours: number;
  hourly_rate?: number;
}

export class CSVParser {
  async parseFile(filePath: string, fileType: string): Promise<ParsedData> {
    // Implementation handles multiple CSV formats
    // with flexible column name detection
  }
}
```

## Testing Strategy

### Current Test Status
- **Jest Tests**: 5/5 passing ✅
- **TypeScript**: 0 errors ✅
- **Build**: Successful compilation ✅
- **Database**: Connection verified ✅

### Testing Commands

```bash
# Run all tests
npm test

# Run specific test file
npm test -- components/dashboard/Forecast.test.tsx

# Test API endpoints
curl -X GET http://localhost:3000/api/health
curl -X POST http://localhost:3000/api/employee-costs \
  -H "Content-Type: application/json" \
  -d '{"employee_id": "123", "project_identifier": "PROJ-001"}'
```

## Performance Optimization

### Database Performance
- Connection pooling (handled by Neon automatically)
- Proper indexing configured
- Efficient queries with prepared statements
- Auto-scaling based on usage

### API Performance
- Response caching for expensive calculations
- Error handling with proper status codes
- Request validation to prevent malformed data
- File processing optimization

### Frontend Performance
- Server-side rendering with Next.js
- Code splitting for optimal bundle sizes
- Lazy loading for large datasets
- Recharts for optimized data visualization

## Monitoring & Deployment

### Production Monitoring
- Vercel Analytics for performance tracking
- Database metrics via Neon dashboard
- Error tracking with Vercel's built-in reporting
- API response time monitoring

### Deployment Process
- **Vercel**: Automatic deployment on git push
- **Database**: Neon PostgreSQL (production-ready)
- **Environment**: All variables configured
- **Domain**: work-payroll-project.vercel.app

## Memory and Context Management

The system maintains context through:

- **Database persistence**: Payroll data, cost analysis, project tracking
- **Environment-based configuration**: Per-deployment settings
- **File processing state**: Import status and error handling
- **User sessions**: Authentication and preferences

## Key File Locations

- **API Routes**: `app/api/` - All backend endpoints
- **Components**: `components/` - React components for UI
- **Database**: `lib/database/` - Connection and query utilities
- **Parsers**: `lib/parsers/` - CSV/Excel processing logic
- **Types**: `lib/types/` - TypeScript type definitions
- **Tests**: Component tests alongside components

## Critical Configuration Status

✅ **TypeScript**: Strict mode enabled, 0 errors  
✅ **ESLint**: Configured and passing  
✅ **Jest**: 5/5 tests passing  
✅ **Database**: Neon PostgreSQL fully configured with 8 tables  
✅ **Build**: Successful compilation  
✅ **Deployment**: Vercel ready  

## Implementation Priorities

### Immediate (Week 1-2)
1. Extend file processing for specific CSV formats
2. Implement cost calculation engine
3. Build basic CEO dashboard interface
4. Add project cost tracking

### Near-term (Week 3-4)  
1. Employee performance insights
2. Excel/PDF export functionality
3. Historical trend analysis
4. Mobile optimization

### Future Enhancements
1. Advanced forecasting models
2. Multi-organization support
3. Real-time collaboration features
4. Advanced analytics dashboards

Remember: **Focus on clean, maintainable code with the project-centric organization around client identifiers. The foundation is solid - build incrementally with proper testing and validation.**