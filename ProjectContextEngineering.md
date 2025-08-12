# Project Context Engineering

## Overview

**Work Payroll Project** is a CEO desktop application for comprehensive payroll analysis, project cost tracking, and workforce performance insights. Built as a clean MVP focusing on integrating data from SpringAhead, Paychex, and QuickBooks, organized around client project identifiers.

## Business Vision

### Problem Statement

CEOs and executives struggle with:

- Lack of real-time visibility into true employee costs by project
- Manual payroll analysis across SpringAhead, Paychex, and QuickBooks
- Difficulty understanding project profitability and resource allocation
- Time-consuming cost calculation and executive reporting
- Disconnected data sources preventing strategic workforce decisions

### Solution

A CEO-focused desktop application that:

- Integrates data from SpringAhead (time tracking), Paychex (payroll), and QuickBooks (expenses)
- Organizes all data around client project identifiers
- Calculates true employee costs including benefits, taxes, and overhead burden
- Provides executive-level project cost tracking and profitability analysis
- Generates comprehensive reports for strategic decision-making
- Scales effortlessly with serverless Neon PostgreSQL and Vercel deployment

## Technical Architecture

### Core Technologies

- **Frontend**: Next.js 15 with App Router, React 19, TypeScript
- **Deployment**: Vercel (zero-config, global CDN)
- **Database**: Neon PostgreSQL (serverless, auto-scaling)
- **File Processing**: CSV/Excel parsing and validation
- **Type Safety**: Zod validation, TypeScript strict mode
- **Testing**: Jest with React Testing Library

### Simplified Architecture Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js App (Vercel)                     │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              React Components                        │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │    │
│  │  │ Analytics    │  │ File Upload  │  │ Cost        │ │    │
│  │  │ Dashboard    │  │ Interface    │  │ Analysis    │ │    │
│  │  └──────────────┘  └──────────────┘  └─────────────┘ │    │
│  └─────────────────┬───────────────────────────────────┘    │
└────────────────────┼────────────────────────────────────────┘
                     │ API Routes
┌────────────────────▼────────────────────────────────────────┐
│                  API Routes Layer                           │
│                                                             │
│  /api/process-files ──► File Processing & Validation        │
│  /api/scan-files ─────► File Format Detection              │
│  /api/employee-costs ─► Cost Analysis Logic                │
│  /api/export/excel ───► Data Export Functionality          │
│  /api/health ─────────► System Health Checks               │
│                                                             │
└────────────────────┬────────────────────────────────────────┘
                     │ Database Queries
┌────────────────────▼────────────────────────────────────────┐
│                Neon PostgreSQL                              │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │Organizations│  │   Users &   │  │  Projects   │         │
│  │    Data     │  │    Auth     │  │   Tracking  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Payroll     │  │ Employee    │  │ Imported    │         │
│  │    Data     │  │   Costs     │  │   Files     │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

### API Route Specifications

#### Core API Endpoints

**1. File Processing API (`/api/process-files`)**

- **Purpose**: Process uploaded payroll CSV/Excel files
- **Input**: File data, processing parameters
- **Output**: Parsed payroll records, validation results
- **Features**: Automatic format detection, data validation

**2. File Scanning API (`/api/scan-files`)**

- **Purpose**: Analyze file format and structure
- **Input**: File metadata and sample data
- **Output**: File type, column mapping, format validation
- **Features**: Smart column detection, error reporting

**3. Employee Cost Analysis API (`/api/employee-costs`)**

- **Purpose**: Calculate true employee costs including overhead
- **Input**: Employee data, cost parameters, time period
- **Output**: Detailed cost breakdown with burden calculations
- **Features**: Project allocation, benefit calculations

**4. Excel Export API (`/api/export/excel`)**

- **Purpose**: Generate Excel reports from analysis data
- **Input**: Report parameters, data filters
- **Output**: Excel file with formatted reports
- **Features**: Multi-sheet reports, charts, formatting

### Data Models

#### Core Database Schema

The database includes 8 main tables:

```sql
-- Organizations
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  subscription_tier VARCHAR(50) DEFAULT 'starter',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL UNIQUE,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  organization_id UUID NOT NULL,
  role VARCHAR(50) DEFAULT 'member',
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

-- Projects
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_identifier VARCHAR(100) UNIQUE NOT NULL,
  client_name VARCHAR(255),
  description TEXT,
  hourly_rate DECIMAL(10,2),
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payroll Data
CREATE TABLE payroll_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  imported_file_id UUID NOT NULL,
  employee_name VARCHAR(255) NOT NULL,
  project_identifier VARCHAR(100),
  work_date DATE,
  hours_worked DECIMAL(8,2),
  gross_pay DECIMAL(12,2),
  total_taxes DECIMAL(12,2),
  net_pay DECIMAL(12,2),
  true_cost DECIMAL(12,2),
  burden_rate DECIMAL(5,4),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  FOREIGN KEY (imported_file_id) REFERENCES imported_files(id),
  FOREIGN KEY (project_identifier) REFERENCES projects(project_identifier)
);

-- Employee Costs (Aggregated)
CREATE TABLE employee_costs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  employee_name VARCHAR(255) NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_hours DECIMAL(10,2) DEFAULT 0,
  gross_pay DECIMAL(12,2) DEFAULT 0,
  total_taxes DECIMAL(12,2) DEFAULT 0,
  total_benefits DECIMAL(12,2) DEFAULT 0,
  total_true_cost DECIMAL(12,2) DEFAULT 0,
  project_allocations JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### TypeScript Types

```typescript
interface Organization {
  id: string;
  name: string;
  slug: string;
  subscriptionTier: 'starter' | 'professional' | 'enterprise';
  settings: Record<string, unknown>;
}

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  organizationId: string;
  role: 'owner' | 'admin' | 'member';
  status: 'active' | 'inactive' | 'pending';
}

interface Project {
  id: string;
  projectIdentifier: string;
  clientName?: string;
  description?: string;
  hourlyRate?: number;
  status: 'active' | 'completed' | 'on_hold' | 'cancelled';
}

interface PayrollData {
  id: string;
  importedFileId: string;
  employeeName: string;
  projectIdentifier?: string;
  workDate?: Date;
  hoursWorked?: number;
  grossPay?: number;
  totalTaxes?: number;
  netPay?: number;
  trueCost?: number;
  burdenRate?: number;
}

interface EmployeeCost {
  id: string;
  employeeName: string;
  periodStart: Date;
  periodEnd: Date;
  totalHours: number;
  grossPay: number;
  totalTaxes: number;
  totalBenefits: number;
  totalTrueCost: number;
  projectAllocations: Record<string, number>;
}
```

## Development Workflow

### Environment Setup

```bash
# Clone repository
git clone <repository-url>
cd work-payroll-project

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Add your Neon database URL

# Test database connection
npm run db:test

# Start development server
npm run dev
```

### API Route Development Pattern

```typescript
// /app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/database';

const requestSchema = z.object({
  employeeName: z.string().min(1),
  baseSalary: z.number().positive(),
  benefits: z.number().min(0).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Validation
    const body = await request.json();
    const validatedData = requestSchema.parse(body);

    // Business logic
    const result = await processEmployeeCost(validatedData);

    // Response
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
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

## Security Architecture

### Authentication & Authorization

- **JWT-based authentication** with secure token storage
- **Role-based access control** (owner, admin, member)
- **Input validation** using Zod schemas
- **File upload security** with type and size validation

### Data Protection

- **Encrypted connections** (HTTPS, TLS)
- **Secure password hashing** with bcrypt
- **SQL injection prevention** with prepared statements
- **File validation** for uploaded payroll data
- **Environment variable protection** for secrets

## Performance Optimization

### Database Optimization

- **Connection pooling** (handled by Neon)
- **Query optimization** with proper indexing
- **Automatic scaling** based on usage
- **Efficient file processing** with streaming

### API Optimization

- **Response caching** for expensive calculations
- **File processing optimization** with chunked reading
- **Error handling** with proper status codes
- **Request validation** to prevent malformed data

### Frontend Optimization

- **Server-side rendering** with Next.js
- **Static generation** where possible
- **Code splitting** for optimal bundle size
- **Lazy loading** for large datasets

## File Processing Architecture

### Supported File Formats

- **CSV Files**: Standard payroll exports
- **Excel Files**: .xlsx format with multiple sheets
- **Custom Formats**: Configurable column mapping

### Processing Pipeline

1. **File Upload**: Secure file upload with validation
2. **Format Detection**: Automatic format and structure analysis
3. **Data Parsing**: Extract payroll records with error handling
4. **Validation**: Check data integrity and required fields
5. **Cost Calculation**: Apply burden rates and benefit calculations
6. **Storage**: Save processed data to PostgreSQL
7. **Reporting**: Generate analysis and export capabilities

## Deployment Pipeline

### Development Environment

```bash
# Local development
npm run dev          # Next.js dev server with hot reload
npm run db:test      # Test database connection
npm run lint         # Code quality checks
npm run type-check   # TypeScript validation
```

### Production Environment

```bash
# Production deployment
npm run build        # Build optimized production bundle
npm run deploy       # Deploy to Vercel
npm run validate     # Full validation suite
```

## Monitoring & Analytics

### Performance Monitoring

- **Vercel Analytics** for web vitals and performance
- **Database metrics** via Neon dashboard
- **API response times** and error rates
- **File processing performance** tracking

### Error Tracking

- **Vercel Error Reporting** for runtime errors
- **File processing errors** with detailed logging
- **Database query monitoring** for performance issues
- **User activity logging** for audit trails

## Success Metrics

### Technical KPIs

- **99.9% uptime** via Vercel's global infrastructure
- **<200ms API response time** for most endpoints
- **Zero TypeScript/ESLint errors** in codebase
- **Efficient file processing** (1000+ records per second)

### Business KPIs

- **Automated payroll processing** reducing manual work by 80%
- **Accurate cost calculation** with benefits and overhead
- **Project-based cost allocation** for better insights
- **Export capabilities** for executive reporting

### User KPIs

- **Intuitive file upload** with drag-and-drop interface
- **Real-time processing feedback** with progress indicators
- **Clear error messages** for data validation issues
- **Fast report generation** for immediate insights

Remember: **We're building a clean, focused payroll analysis platform with modern tools and simple architecture for maximum reliability and maintainability.**