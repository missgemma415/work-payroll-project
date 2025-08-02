# Project Context Engineering

## Overview

**Prophet Growth Analysis** is an AI-powered financial intelligence platform that transforms workforce cost management through direct API integrations, predictive analytics, and intelligent automation. Built on a modern, scalable stack with Vercel + Neon + direct API approach for maximum simplicity and reliability.

## Business Vision

### Problem Statement

Organizations struggle with:

- Manual, reactive employee cost tracking
- Lack of predictive insights for workforce planning
- Siloed financial data across departments
- Time-consuming scenario planning
- Delayed decision-making on hiring/termination impacts

### Solution

A streamlined AI financial operations platform that:

- Provides instant cost analysis through Claude AI
- Predicts future costs with Prophet forecasting
- Enables voice-powered interactions via ElevenLabs
- Delivers executive-ready insights immediately
- Scales effortlessly with serverless infrastructure

## Technical Architecture

### Core Technologies

- **Frontend**: Next.js 15 with App Router, React 19, TypeScript
- **Deployment**: Vercel (zero-config, global CDN)
- **Database**: Neon PostgreSQL (serverless, auto-scaling)
- **AI Chat**: Anthropic Claude API (direct integration)
- **Voice**: ElevenLabs API (voice synthesis)
- **CLI Tools**: GitHub CLI, Neon CLI, Vercel CLI
- **Type Safety**: Zod validation, TypeScript strict mode

### Simplified Architecture Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js App (Vercel)                     │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              React Components                        │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │    │
│  │  │ Analytics    │  │  AI Chat     │  │   Voice     │ │    │
│  │  │ Dashboard    │  │ Interface    │  │ Interface   │ │    │
│  │  └──────────────┘  └──────────────┘  └─────────────┘ │    │
│  └─────────────────┬───────────────────────────────────┘    │
└────────────────────┼────────────────────────────────────────┘
                     │ API Routes
┌────────────────────▼────────────────────────────────────────┐
│                  API Routes Layer                           │
│                                                             │
│  /api/chat ──────► Anthropic Claude API                     │
│  /api/voice ─────► ElevenLabs API                          │
│  /api/analyze ───► Financial Analysis Logic                │
│  /api/forecast ──► Prophet Forecasting                     │
│  /api/employees ─► Employee Management                      │
│  /api/auth ──────► Authentication Logic                    │
│                                                             │
└────────────────────┬────────────────────────────────────────┘
                     │ Database Queries
┌────────────────────▼────────────────────────────────────────┐
│                Neon PostgreSQL                              │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Users &   │  │  Employee   │  │   Cost      │         │
│  │    Auth     │  │    Data     │  │  Analysis   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Conversation│  │ Forecasts & │  │ Audit Logs  │         │
│  │   History   │  │ Predictions │  │ & Sessions  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
```

### API Route Specifications

#### Core API Endpoints

**1. Chat API (`/api/chat`)**

- **Purpose**: Direct integration with Anthropic Claude
- **Input**: User message, conversation context
- **Output**: AI-generated financial insights
- **Features**: Context preservation, conversation memory

**2. Voice API (`/api/voice`)**

- **Purpose**: Text-to-speech via ElevenLabs
- **Input**: Text content, voice settings
- **Output**: Audio file/stream
- **Features**: Multiple voice options, SSML support

**3. Analysis API (`/api/analyze`)**

- **Purpose**: Financial cost analysis and recommendations
- **Input**: Employee data, time period, parameters
- **Output**: Detailed cost breakdown, insights, recommendations
- **Features**: Real-time calculations, comparative analysis

**4. Forecast API (`/api/forecast`)**

- **Purpose**: Time series prediction using Prophet
- **Input**: Historical data, forecast parameters
- **Output**: Predictions, confidence intervals, trends
- **Features**: Seasonal analysis, anomaly detection

### Data Models

#### Core Database Schema

```sql
-- Users and Authentication
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'user',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Employees
CREATE TABLE employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  name VARCHAR(255) NOT NULL,
  department VARCHAR(255),
  position VARCHAR(255),
  level VARCHAR(100),
  location VARCHAR(255),
  start_date DATE,
  base_salary DECIMAL(12,2),
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Cost Analysis
CREATE TABLE cost_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  employee_id UUID REFERENCES employees(id),
  analysis_date DATE NOT NULL,
  base_salary DECIMAL(12,2),
  benefits_cost DECIMAL(12,2),
  overhead_cost DECIMAL(12,2),
  total_monthly_cost DECIMAL(12,2),
  total_annual_cost DECIMAL(12,2),
  utilization_rate DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Conversation History
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  message TEXT NOT NULL,
  response TEXT NOT NULL,
  context JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Forecasts
CREATE TABLE forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  forecast_type VARCHAR(100),
  time_period VARCHAR(50),
  predictions JSONB NOT NULL,
  confidence_score DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

#### TypeScript Types

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
  createdAt: Date;
}

interface Employee {
  id: string;
  userId: string;
  name: string;
  department: string;
  position: string;
  level: string;
  location: string;
  startDate: Date;
  baseSalary: number;
  currency: string;
  status: 'active' | 'inactive';
}

interface CostAnalysis {
  id: string;
  employeeId: string;
  employee: Employee;
  analysisDate: Date;
  baseSalary: number;
  benefitsCost: number;
  overheadCost: number;
  totalMonthlyCost: number;
  totalAnnualCost: number;
  utilizationRate: number;
}

interface Conversation {
  id: string;
  userId: string;
  message: string;
  response: string;
  context?: Record<string, unknown>;
  createdAt: Date;
}

interface Forecast {
  id: string;
  userId: string;
  forecastType: string;
  timePeriod: string;
  predictions: TimeSeries[];
  confidenceScore: number;
  createdAt: Date;
}
```

## Development Workflow

### Environment Setup

```bash
# Clone repository
git clone <repository-url>
cd prophet-growth-analysis

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Fill in your API keys and database URL

# Set up Neon database
neon branches create --name development
neon sql < migrations/001_initial.sql

# Start development server
npm run dev
```

### API Route Development Pattern

```typescript
// /app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { authenticateUser } from '@/lib/auth';
import { db } from '@/lib/database';

const requestSchema = z.object({
  param: z.string(),
  options: z.object({}).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Authentication
    const user = await authenticateUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Validation
    const body = await request.json();
    const { param, options } = requestSchema.parse(body);

    // Business logic
    const result = await processRequest(param, options, user.id);

    // Response
    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

### CLI Tools Integration

#### GitHub CLI Workflow

```bash
# Create feature branch
git checkout -b feature/voice-interface

# Make changes...

# Create pull request
gh pr create --title "Add voice interface" --body "Implementation of ElevenLabs integration"

# Review and merge
gh pr view --web
gh pr merge --squash
```

#### Neon Database Management

```bash
# Create database branch for feature
neon branches create --name feature/voice-interface

# Run migrations
neon sql < migrations/002_add_voice_settings.sql

# Test queries
neon sql "SELECT * FROM users LIMIT 5"

# Merge to main branch
neon branches merge feature/voice-interface
```

#### Vercel Deployment

```bash
# Preview deployment
vercel

# Set environment variables
vercel env add ANTHROPIC_API_KEY production
vercel env add ELEVENLABS_API_KEY production

# Deploy to production
vercel --prod

# Check deployment status
vercel logs
```

## Security Architecture

### Authentication & Authorization

- **JWT-based authentication** with secure token storage
- **Role-based access control** (admin, user)
- **API key management** via environment variables
- **Rate limiting** on all public endpoints
- **Input validation** using Zod schemas

### Data Protection

- **Encrypted connections** (HTTPS, TLS)
- **Secure password hashing** with bcrypt
- **SQL injection prevention** with prepared statements
- **XSS protection** via Next.js built-in security
- **CSRF protection** with proper headers

## Performance Optimization

### Database Optimization

- **Connection pooling** (handled by Neon)
- **Query optimization** with proper indexing
- **Database branching** for development/testing
- **Automatic scaling** based on usage

### API Optimization

- **Response caching** for expensive operations
- **Request batching** for multiple operations
- **Error handling** with proper status codes
- **Rate limiting** to prevent abuse

### Frontend Optimization

- **Server-side rendering** with Next.js
- **Static generation** where possible
- **Code splitting** for optimal bundle size
- **Image optimization** via Next.js Image component

## Deployment Pipeline

### Development Environment

```bash
# Local development
npm run dev          # Next.js dev server
vercel dev           # Local with Vercel functions
neon sql             # Database access
```

### Staging Environment

```bash
# Preview deployment
vercel                # Automatic preview
neon branches create  # Database branch
npm run test         # Run all tests
```

### Production Environment

```bash
# Production deployment
vercel --prod        # Deploy to production
vercel alias         # Set custom domain
vercel logs          # Monitor deployment
```

## Monitoring & Analytics

### Performance Monitoring

- **Vercel Analytics** for web vitals and performance
- **Database metrics** via Neon dashboard
- **API response times** and error rates
- **User engagement** and feature usage

### Error Tracking

- **Vercel Error Reporting** for runtime errors
- **Console logging** for debugging
- **Database query monitoring** for performance issues
- **API usage tracking** for cost management

## Future Roadmap

### Phase 1: Core Platform (Current)

- ✅ Next.js 15 app structure
- ✅ Vercel deployment
- ✅ Neon database setup
- 🔄 API routes implementation
- 🔄 Authentication system

### Phase 2: AI Integration

- 📋 Anthropic Claude chat interface
- 📋 ElevenLabs voice synthesis
- 📋 Prophet forecasting integration
- 📋 Real-time analysis features

### Phase 3: Advanced Features

- 📋 Advanced analytics dashboard
- 📋 Export capabilities (PDF, Excel)
- 📋 Collaborative features
- 📋 Mobile-responsive design

### Phase 4: Enterprise Features

- 📋 Multi-tenant architecture
- 📋 Advanced security features
- 📋 Integration APIs
- 📋 White-label solutions

## Success Metrics

### Technical KPIs

- **99.9% uptime** via Vercel's global infrastructure
- **<200ms API response time** for most endpoints
- **Zero TypeScript/ESLint errors** in codebase
- **100% test coverage** for critical paths

### Business KPIs

- **30% reduction** in manual analysis time
- **15% improvement** in cost prediction accuracy
- **50% faster** scenario planning and decision-making
- **25% cost savings** identified through AI insights

### User KPIs

- **Intuitive user experience** with clear navigation
- **Real-time responsiveness** for all interactions
- **Accessible design** meeting WCAG guidelines
- **Seamless voice integration** for enhanced UX

## Development Team Architecture

### **AI-Enhanced Development Team**

Our development process leverages specialized AI agents to maintain enterprise-grade standards and accelerate feature development. Each agent has specific expertise and integration points within our workflow:

#### **Core Agent Team**

**1. Fullstack Architect Agent** 🏗️

```typescript
interface AgentCapabilities {
  role: 'Elite Fullstack Development Expert';
  responsibilities: [
    'Architecture decisions and technology recommendations',
    'Code reviews across frontend and backend',
    'Complex web application development',
    'Scalability and performance optimization',
    'Database design and API development',
  ];
  expertise: [
    'Modern JavaScript/TypeScript frameworks',
    'Backend technologies (Node.js, Python, Go, Rust)',
    'Database design and optimization',
    'Cloud platforms and deployment',
    'Test-driven development',
    'Security best practices',
  ];
  whenToUse: [
    'Complex feature development',
    'Architecture decisions',
    'Performance optimization',
    'Full-stack code reviews',
    'Scalability planning',
  ];
}
```

**Key Specializations**:

- **Frontend Excellence**: React, Vue, Angular, Svelte, state management
- **Backend Mastery**: Node.js, Python, APIs (REST, GraphQL), databases
- **DevOps & Infrastructure**: Cloud platforms, containerization, CI/CD
- **Quality Assurance**: Testing frameworks, TDD, code coverage

**2. MCP Tools Specialist Agent** 🔧

```typescript
interface AgentCapabilities {
  role: 'Integration Architecture Expert';
  responsibilities: [
    'API integration patterns and optimization',
    'Tool schema design with Zod validation',
    'MCP protocol implementation',
    'Integration troubleshooting and debugging',
  ];
  expertise: [
    'MCP protocol design and standards',
    'API architecture patterns',
    'Schema validation and type safety',
    'Tool registration and discovery',
    'Integration pattern optimization',
  ];
  whenToUse: [
    'Designing new API integrations',
    'Creating tool schemas',
    'MCP tool implementation',
    'Integration debugging',
    'API pattern optimization',
  ];
}
```

**Key Specializations**:

- **Schema Design**: Zod validation, type safety, input/output schemas
- **API Patterns**: RESTful design, error handling, status codes
- **Tool Architecture**: Registration systems, discovery patterns
- **Integration Optimization**: Performance, reliability, maintainability

### **Agent Integration Workflow**

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant TSE as TypeScript ESLint Agent
    participant MCP as MCP Tools Specialist
    participant Repo as Repository

    Dev->>Dev: Write/Modify Code
    Dev->>TSE: Request Code Review
    TSE->>TSE: Analyze & Fix Errors
    TSE->>Dev: Return Clean Code

    Dev->>MCP: Design Integration
    MCP->>MCP: Create Tool Schema
    MCP->>TSE: Validate Implementation
    TSE->>Repo: Commit Clean Code
```

### **Quality Assurance Pipeline**

1. **Development Phase**
   - Write feature code
   - Automatic agent code review
   - Type safety enforcement
   - Style consistency validation

2. **Integration Phase**
   - API schema validation
   - Tool registration verification
   - Integration pattern compliance
   - Error handling validation

3. **Commit Phase**
   - Final TypeScript compilation check
   - ESLint rule compliance
   - Import organization
   - Clean commit preparation

### **Agent Collaboration Patterns**

#### **Pattern 1: Feature Development**

```typescript
// Development workflow
const featureDevelopment = {
  step1: 'Developer writes initial code',
  step2: 'TypeScript ESLint Agent reviews and fixes',
  step3: 'MCP Tools Specialist optimizes integrations',
  step4: 'TypeScript ESLint Agent final validation',
  step5: 'Clean commit ready',
};
```

#### **Pattern 2: Bug Fixes**

```typescript
// Bug fix workflow
const bugFixWorkflow = {
  step1: 'Identify and fix issue',
  step2: 'TypeScript ESLint Agent ensures quality',
  step3: 'Regression testing validation',
  step4: 'Clean deployment',
};
```

#### **Pattern 3: New Team Member Onboarding**

```typescript
// Onboarding workflow
const onboardingProcess = {
  step1: 'New agent defines capabilities',
  step2: 'Integration with existing workflow',
  step3: 'Documentation updates',
  step4: 'Collaboration pattern establishment',
};
```

### **Future Team Expansion**

As we add specialized agents:

**Frontend Specialist Agent** (Future)

- React component optimization
- UI/UX consistency enforcement
- Accessibility compliance
- Performance optimization

**Database Specialist Agent** (Future)

- Query optimization
- Migration management
- Schema validation
- Performance monitoring

**Security Specialist Agent** (Future)

- Security vulnerability scanning
- Authentication pattern validation
- API security enforcement
- Compliance verification

### **Agent Coordination Protocol**

```typescript
interface AgentCoordination {
  hierarchy: {
    architect: 'Fullstack Architect'; // Architecture decisions
    specialists: 'Domain-specific experts'; // Specialized tasks
    validators: 'Security, Database, Deployment'; // Validation
  };

  handoffProtocol: {
    planning_phase: 'Architect designs, specialists implement';
    implementation_phase: 'Specialists execute, architect reviews';
    validation_phase: 'Validators check health and security';
    completion_phase: 'Docs curator updates, metrics saved';
  };

  communication: {
    clear_instructions: 'Specific, actionable tasks';
    context_sharing: 'Full problem context provided';
    result_documentation: 'Comprehensive change reports';
  };
}
```

### **Agent-Specific Hook Workflows**

#### **Pre-Task Context Loading**

Each agent receives specialized context:

```mermaid
graph LR
    A[Task Start] --> B[Universal Context]
    B --> C{Agent Type?}
    C -->|Database| D[Load Schema & Patterns]
    C -->|Deployment| E[Load Configs & Env]
    C -->|Security| F[Load Vulnerabilities]
    C -->|API| G[Load Docs & Limits]
    D --> H[Execute Task]
    E --> H
    F --> H
    G --> H
```

#### **Post-Task Knowledge Updates**

Specialized knowledge preservation:

```mermaid
graph LR
    A[Task Complete] --> B[Universal Updates]
    B --> C{Agent Type?}
    C -->|Docs Curator| D[Update Documentation]
    C -->|DB Architect| E[Save Query Patterns]
    C -->|Security| F[Generate Audit Report]
    C -->|Performance| G[Record Metrics]
    D --> H[Knowledge Preserved]
    E --> H
    F --> H
    G --> H
```

### **Hook System Integration**

The hook system is integrated via `.claude/settings.local.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Task*",
        "hooks": [
          {
            "command": "/path/to/pre-task-context.sh"
          }
        ]
      },
      {
        "matcher": "*neon-database-architect*",
        "hooks": [
          {
            "command": "/path/to/agents/neon-db-context.sh"
          }
        ]
      }
    ],
    "PostToolUse": [
      // Post-task hooks configuration
    ],
    "Validation": [
      // Validation hooks configuration
    ]
  }
}
```

### **Knowledge Organization Structure**

```
.claude/
├── hooks-config.json
├── scripts/
│   ├── agents/
│   └── validation/
├── knowledge/
│   ├── agents/
│   │   ├── neon-database-architect/
│   │   │   ├── schemas/
│   │   │   ├── optimizations/
│   │   │   └── patterns/
│   │   ├── vercel-deployment-specialist/
│   │   │   ├── configs/
│   │   │   └── deployments/
│   │   └── [other agents]/
│   └── shared/
│       ├── architecture/
│       └── patterns/
├── metrics/
│   ├── daily/
│   └── reports/
└── logs/
    ├── changelogs/
    └── knowledge-updates.log
```

### **Development Quality Metrics**

Our AI-enhanced team maintains:

- **Zero TypeScript errors** (Fullstack Architect enforcement)
- **Zero ESLint violations** (automated fixing)
- **100% type safety** (validated at compile time)
- **Consistent API patterns** (MCP Tools Specialist)
- **Security compliance** (Security Auditor validation)
- **Performance targets** (Performance Optimizer tracking)
- **Clean commit history** (quality-gated)

### **Agent Specialization Benefits**

1. **Focused Expertise**: Each agent masters their domain
2. **Parallel Processing**: Multiple agents can work simultaneously
3. **Knowledge Preservation**: Domain-specific learnings are captured
4. **Quality Assurance**: Specialized validation for each area
5. **Continuous Improvement**: Metrics and patterns drive optimization

Remember: We're building a **simple, scalable, and intelligent financial platform** with **AI-enhanced development workflows** that leverage modern tools and direct API integrations for maximum reliability and performance.
