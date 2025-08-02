# CLAUDE.md - Project Guidelines and Instructions

## Core Principles

- **Zero-tolerance policy for TypeScript and ESLint errors going forward!**
- Enterprise-grade code quality standards
- Security-first approach
- Clean, maintainable code
- Simple, scalable architecture

## Project Overview

**Prophet Growth Analysis** is an AI-powered financial intelligence platform that provides real-time cost analysis, predictive forecasting, and intelligent insights for employee costs and workforce planning. Built with a modern, simplified stack focusing on direct API integrations and scalable infrastructure.

## Project Workflow Guidelines

- Always start with claude.md file then read projectcontextengineering.md next and the next is projecttasks.md in that order every time asked to review project or opens the project for first time

## Architecture Overview

### Modern Stack Architecture

We use a simplified, scalable approach:

- **Frontend**: Next.js 15 with App Router (React 19)
- **Deployment**: Vercel (seamless Next.js integration)
- **Database**: Neon PostgreSQL (serverless, scalable)
- **AI Chat**: Anthropic Claude API (direct integration)
- **Voice**: ElevenLabs API (voice synthesis)
- **CLI Tools**: GitHub CLI, Neon CLI, Vercel CLI

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

4. **Direct API Integrations**
   - Anthropic Claude for AI chat
   - ElevenLabs for voice synthesis
   - No complex orchestration layers

## API Architecture

### Simple API Routes Structure

```
app/api/
├── auth/
│   ├── login/route.ts
│   ├── register/route.ts
│   └── logout/route.ts
├── chat/route.ts          # Anthropic Claude integration
├── voice/route.ts         # ElevenLabs voice synthesis
├── analyze/route.ts       # Financial analysis logic
├── forecast/route.ts      # Prophet time series forecasting
├── employees/route.ts     # Employee data management
└── health/route.ts        # Health check endpoint
```

### API Development Guidelines

```typescript
// Example API route structure
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const requestSchema = z.object({
  message: z.string(),
  context: z.object({}).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, context } = requestSchema.parse(body);

    // Direct API call to Anthropic
    const response = await anthropicClient.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      messages: [{ role: 'user', content: message }],
    });

    return NextResponse.json({ response: response.content });
  } catch (error) {
    return NextResponse.json({ error: 'Request failed' }, { status: 500 });
  }
}
```

## Environment Configuration

```bash
# Core APIs
ANTHROPIC_API_KEY=your-anthropic-api-key
ELEVENLABS_API_KEY=your-elevenlabs-api-key

# Database
NEON_DATABASE_URL=postgresql://user:pass@host/db

# CLI Tools
GITHUB_TOKEN=your-github-token
VERCEL_TOKEN=your-vercel-token

# App Configuration
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
NODE_ENV=production

# Security
JWT_SECRET=your-super-secret-jwt-key-minimum-32-chars
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_EXPIRES_IN=30d
BCRYPT_ROUNDS=10
```

## Deployment

### Vercel Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to production
npm run deploy

# Preview deployment
vercel

# Environment variables
vercel env add ANTHROPIC_API_KEY
vercel env add NEON_DATABASE_URL
```

### Database Management

```bash
# Install Neon CLI
npm i -g @neondatabase/cli

# Connect to database
neon sql "SELECT * FROM employees LIMIT 10"

# Create database branch
neon branches create --name feature-branch

# Run migrations
neon sql < migrations/001_initial.sql
```

## CLI Tools Integration

### GitHub CLI

```bash
# Create pull request
gh pr create --title "Feature: Add voice interface" --body "Implementation details..."

# Manage issues
gh issue create --title "Bug: API timeout" --body "Description..."

# Repository management
gh repo view --web
```

### Development Commands

```bash
# Development
npm run dev          # Start dev server (Next.js)
npm run lint         # Check for ESLint errors
npm run type-check   # Run TypeScript checks
npm run validate     # Run all checks (lint + type + format)

# Database
neon sql             # Connect to Neon database
neon branches list   # List database branches

# Deployment
vercel dev           # Local development with Vercel
vercel --prod        # Deploy to production
vercel logs          # View deployment logs

# Git workflow
gh pr create         # Create pull request
gh pr merge          # Merge pull request
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

- Use connection pooling (Neon handles this)
- Create database branches for features
- Write migrations for schema changes
- Use prepared statements to prevent SQL injection
- Index frequently queried columns

## Testing

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Test API endpoints
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Analyze employee costs"}'
```

## Monitoring

- Use Vercel Analytics for performance monitoring
- Monitor API usage and costs (Anthropic, ElevenLabs)
- Set up error tracking with Vercel's built-in error reporting
- Track database performance with Neon metrics

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

- **Database persistence**: User sessions, conversation history
- **CLI tool integration**: GitHub for code management, Neon for data
- **Environment-based configuration**: Per-deployment settings
- **Simple state management**: React Query for client state

## Development Team & Agents

### **Core Development Team**

Our development process is enhanced by specialized AI agents that maintain code quality and accelerate development:

#### **1. Fullstack Architect Agent** 🏗️

- **Role**: Elite Fullstack Development Expert
- **Responsibilities**:
  - Architecture decisions and technology recommendations
  - Code reviews across frontend and backend
  - Complex web application development
  - Scalability and performance optimization
  - Database design and API development
- **When to Use**:
  - Complex feature development requiring full-stack expertise
  - Architecture decisions and technology stack choices
  - Performance optimization and scalability planning
  - Full-stack code reviews and quality assurance
- **Key Expertise**:
  - Modern JavaScript/TypeScript frameworks (React, Vue, Angular)
  - Backend technologies (Node.js, Python, Go, Rust)
  - Database design and optimization (SQL, NoSQL)
  - Cloud platforms and deployment strategies
  - Test-driven development and security best practices

#### **2. MCP Tools Specialist Agent** 🔧

- **Role**: Integration Architecture Expert
- **Responsibilities**:
  - API integration patterns and optimization
  - Tool schema design with Zod validation
  - MCP protocol implementation (when needed)
  - Integration troubleshooting and debugging
- **When to Use**:
  - Designing new API integrations
  - Creating tool schemas with proper validation
  - Optimizing existing integration patterns
  - Troubleshooting API connection issues

### **Specialized Agents**

#### **3. Neon Database Architect** 🗄️

- Specializes in database schema design, query optimization, and Neon-specific features

#### **4. Vercel Deployment Specialist** 🚀

- Handles deployment configurations, environment management, and performance monitoring

#### **5. Security Auditor Expert** 🔐

- Focuses on security patterns, vulnerability assessment, and compliance

#### **6. API Integration Specialist** 🔌

- Expert in API documentation, rate limits, and integration patterns

#### **7. Project Docs Curator** 📝

- Maintains documentation consistency and automated updates

#### **8. Performance Optimizer** ⚡

- Tracks performance metrics and optimization strategies

### **Agent Collaboration Workflow**

```mermaid
graph LR
    A[Developer] --> B[Write Code]
    B --> C[TypeScript ESLint Agent]
    C --> D{Errors Found?}
    D -->|Yes| E[Auto-fix & Report]
    E --> C
    D -->|No| F[Code Review Passed]
    F --> G[Commit Ready]

    H[New Integration] --> I[MCP Tools Specialist]
    I --> J[Design & Implement]
    J --> C
```

### **Team Expansion Guidelines**

As we add more specialized agents to our team:

1. **Document Each Agent**:
   - Role and responsibilities
   - When to use vs. when not to use
   - Specialization areas
   - Collaboration patterns

2. **Maintain Agent Hierarchy**:
   - TypeScript ESLint Enforcer = Quality gatekeeper (always final step)
   - Specialists = Feature/domain experts
   - General agents = Broad task support

3. **Integration Points**:
   - All agents must respect code quality standards
   - Specialist agents feed into quality enforcement
   - Clear hand-off protocols between agents

### **Agent Usage Best Practices**

- **Proactive Usage**: Use agents before they're needed (preventive vs. reactive)
- **Clear Instructions**: Provide specific, actionable tasks for each agent
- **Architecture First**: Involve Fullstack Architect for complex decisions
- **Documentation**: Keep agent capabilities and usage patterns updated

## Agent Context Review Hook System

### **Overview**

Our sophisticated hook system ensures every agent starts with complete context awareness and contributes specialized knowledge back to the collective intelligence system.

### **Hook System Architecture**

```
.claude/
├── hooks-config.json         # Main hook configuration
├── settings.local.json       # Hook integration settings
├── scripts/
│   ├── pre-task-context.sh   # Universal context loading
│   ├── post-task-update.sh   # Knowledge preservation
│   ├── agents/               # Agent-specific scripts
│   │   ├── neon-db-context.sh
│   │   ├── vercel-deploy-context.sh
│   │   ├── security-audit-context.sh
│   │   ├── api-integration-context.sh
│   │   ├── docs-curator-update.sh
│   │   └── performance-metrics.sh
│   └── validation/           # Validation scripts
│       ├── vercel-health-check.sh
│       ├── neon-db-validate.sh
│       └── security-scan.sh
```

### **Pre-Task Context Loading**

Every agent automatically:

1. **Reads Core Documentation** - CLAUDE.md, ProjectContextEngineering.md, ProjectTasks.md
2. **Reviews Architecture** - Current NEON + Vercel + Direct APIs stack
3. **Checks Memory System** - Previous learnings and patterns
4. **Loads Agent-Specific Context** - Specialized knowledge for their domain

### **Post-Task Knowledge Updates**

After task completion:

1. **Memory Updates** - New patterns and solutions recorded
2. **Documentation Review** - Flags needed updates
3. **Pattern Recognition** - Successful approaches archived
4. **Agent-Specific Actions** - Domain-specific knowledge preservation

### **Agent-Specific Hooks**

Each specialized agent has tailored:

- **Context Loading**: Domain-specific information and history
- **Post-Task Actions**: Specialized knowledge preservation
- **Validation Checks**: Pre/post-task health verification

### **Hook Configuration**

Hooks are configured in `.claude/settings.local.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      /* Context loading hooks */
    ],
    "PostToolUse": [
      /* Knowledge update hooks */
    ],
    "UserPromptSubmit": [
      /* Context reminders */
    ],
    "Validation": [
      /* Health check hooks */
    ]
  }
}
```

Remember: **We're building a scalable, maintainable financial intelligence platform with modern tools, simple architecture, and AI-enhanced development workflows.**

# Important Instruction Reminders

Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (\*.md) or README files. Only create documentation files if explicitly requested by the User.
