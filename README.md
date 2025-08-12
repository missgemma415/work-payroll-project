# Work Payroll Project

CEO desktop application for comprehensive payroll analysis, project cost tracking, and workforce performance insights. Integrates data from SpringAhead, Paychex, and QuickBooks to provide executive-level financial intelligence.

## 🎯 Project Overview

A streamlined web application that consolidates payroll data from multiple sources and organizes them around client project identifiers. Provides real-time cost analysis, employee performance insights, forecasting capabilities, and executive reporting for data-driven staffing decisions.

## 🚀 Tech Stack

- **Frontend:** Next.js 15 with App Router, React 19, TypeScript
- **Database:** Neon PostgreSQL (serverless, auto-scaling, 8 tables configured)
- **Deployment:** Vercel (zero-config, global CDN)
- **Visualization:** Recharts for charts and data visualization
- **File Processing:** CSV/Excel parsing for payroll data imports
- **Validation:** Zod schemas with TypeScript strict mode
- **UI Components:** Radix UI with Tailwind CSS

## ✨ Key Features

### Data Integration
- **SpringAhead Import** - Time tracking data by project and employee
- **Paychex Integration** - Payroll reports with taxes, bonuses, deductions
- **QuickBooks Import** - Employee, contractor, and vendor expenses
- **Customer Service Metrics** - Call data, tickets, CSAT scores

### Cost Analysis & Reporting
- **Project Cost Tracking** - Real cost per client project identifier
- **Employee Performance Insights** - Comprehensive profiles with metrics
- **True Cost Calculation** - Including benefits, overhead, and burden rates
- **Executive Reports** - Excel and PDF export capabilities

### Forecasting & Planning
- **Staffing Cost Projections** - Pre-hire through post-termination scenarios
- **Performance-Based Insights** - Link customer service metrics to compensation
- **Budget vs Actual Analysis** - Track spending against projections
- **ROI Calculations** - Break-even timelines and financial impact

## 🛠 Quick Start

```bash
# Install dependencies
npm install

# Set up environment (database already configured)
cp .env.local.example .env.local
# Neon database URL is already configured in .env.local

# Test database connection
npm run db:test

# Run development server
npm run dev

# Open http://localhost:3000
```

## 🔧 Environment Configuration

Current configuration includes:

```bash
# Database (Already Configured)
NEON_DATABASE_URL="postgresql://neondb_owner:npg_26KGepdyhVnU@ep-ancient-sea-aenslh7h-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Application
NEXT_PUBLIC_APP_URL=https://work-payroll-project.vercel.app

# Authentication
JWT_SECRET=your-super-secret-jwt-key-minimum-32-chars

# Future Features (Optional)
GOOGLE_GEMINI_API_KEY=your-google-gemini-api-key  # For AI insights
ELEVENLABS_API_KEY=your-elevenlabs-api-key        # For voice features
```

## 📊 Database Schema

**8 Tables Configured:**
- `organizations` - Company/organization data
- `users` - User accounts and profiles  
- `projects` - Project tracking with hourly rates (sample data included)
- `imported_files` - File upload tracking
- `payroll_data` - Core payroll and expense data
- `employee_costs` - Aggregated cost analysis
- `activity_logs` - Audit trail
- `migrations` - Migration tracking

**Sample Data Included:**
- PROJ-001: Client Alpha (Software Development)
- PROJ-002: Client Beta (Consulting Services)  
- PROJ-003: Client Gamma (Data Analysis)
- INTERNAL: Internal company activities

## 🚦 Available Commands

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production  
npm run start            # Start production server
npm run lint             # Run ESLint
npm run lint:fix         # Auto-fix ESLint issues
npm run type-check       # TypeScript validation
npm run validate         # All checks (lint + type + format)

# Database
npm run db:test          # Test database connection
npm run migrate          # Run database migrations

# Testing
npm test                 # Run Jest tests
npm run format           # Format code with Prettier

# Deployment
npm run deploy           # Deploy to Vercel production
```

## 🏗 Architecture

**Clean MVP Architecture:**
- **Direct Data Integration** - No complex orchestration layers
- **Project-Centric Organization** - All data organized by client project identifiers
- **Serverless Infrastructure** - Neon PostgreSQL + Vercel deployment
- **Type-Safe Development** - Zod validation + TypeScript strict mode
- **Modern React Patterns** - App Router, Server Components, React 19

**Data Flow:**
```
CSV/Excel Files → File Processing → Database Storage → Cost Analysis → Executive Reports
```

## 📋 Implementation Roadmap

### Phase 1: Core Data Import (Week 1)
- ✅ Database schema and infrastructure
- 🔄 SpringAhead CSV processing
- 🔄 Paychex payroll import
- 🔄 QuickBooks expense processing

### Phase 2: Cost Analysis Engine (Week 2)  
- 🔄 Project cost calculations
- 🔄 Employee performance metrics
- 🔄 True cost with burden rates
- 🔄 Performance-based insights

### Phase 3: CEO Dashboard UI (Week 3)
- 🔄 Executive summary interface
- 🔄 Project cost visualizations
- 🔄 Employee performance dashboards
- 🔄 Export functionality

### Phase 4: Advanced Features (Week 4+)
- 🔄 Forecasting and scenario planning
- 🔄 Historical trend analysis
- 🔄 Multi-organization support
- 🔄 Mobile optimization

## 📚 Documentation

- `CLAUDE.md` - Development guidelines and technical reference
- `ProjectContextEngineering.md` - Architecture and implementation details
- `ProjectTasks.md` - Complete task breakdown and implementation plan

## 🎯 Success Metrics

**Technical Goals:**
- Zero TypeScript/ESLint errors ✅
- <200ms API response time
- 99.9% uptime via Vercel
- Support 10,000+ payroll records per file

**Business Goals:**
- 80% reduction in manual payroll analysis time
- Accurate cost calculation with 95%+ precision
- Real-time project cost tracking
- Executive-ready reporting capabilities

## 🚀 Current Status

**✅ Ready for Development**
- Database fully configured with sample data
- All TypeScript and build errors resolved
- File processing infrastructure in place
- Vercel deployment configured
- Test suite passing (5/5 tests)

**Next Steps:**
1. Add your sample data files (SpringAhead, Paychex, QuickBooks CSVs)
2. Implement data import parsers
3. Build cost analysis engine
4. Create CEO dashboard interface

---

_Transforming payroll data into executive intelligence for strategic workforce decisions._