# Prophet Growth Analysis

AI-powered financial intelligence platform that transforms workforce cost management through predictive analytics, intelligent automation, and real-time insights for employee costs and workforce planning.

## 🚀 Tech Stack

- **Frontend:** Next.js 15 with App Router, React 19, TypeScript
- **Database:** Neon PostgreSQL (serverless, auto-scaling)
- **Deployment:** Vercel (zero-config, global CDN)
- **AI Chat:** Google Gemini API (direct integration)
- **Voice:** ElevenLabs API (voice synthesis)
- **Forecasting:** Prophet time series forecasting
- **Validation:** Zod schemas with TypeScript strict mode

## ✨ Key Features

- **Real-time Cost Analysis** - Instant employee cost insights through AI
- **Predictive Forecasting** - Prophet-powered workforce cost predictions
- **Voice-Powered Interactions** - ElevenLabs voice synthesis for accessibility
- **Conversation Management** - Persistent chat history and context
- **Executive Reports** - AI-generated financial intelligence reports
- **Agent Guardrails System** - Comprehensive AI agent accountability and reliability

## 🛠 Quick Start

```bash
# Install dependencies
npm install

# Set up environment
cp .env.local.example .env.local
# Edit .env.local with your API keys

# Run development server
npm run dev

# Open http://localhost:3000
```

## 🔧 Environment Setup

Required environment variables:

```bash
# Core APIs
GOOGLE_GEMINI_API_KEY=your-google-gemini-api-key
ELEVENLABS_API_KEY=your-elevenlabs-api-key

# Database
NEON_DATABASE_URL=postgresql://user:password@host:5432/database

# Authentication
JWT_SECRET=your-super-secret-jwt-key-minimum-32-chars
```

## 📚 Documentation

- `CLAUDE.md` - Complete development guidelines and architecture
- `ProjectContextEngineering.md` - Technical architecture details
- `ProjectTasks.md` - Implementation roadmap and task tracking
- `README-agent-guardrails.md` - AI agent accountability system

## 🤖 AI-Enhanced Development

Our development process leverages:

- **Agent Guardrails System** - Prevents phantom work and validates deliverables
- **Specialized AI Agents** - Fullstack architects, API specialists, security auditors
- **Reliability Metrics** - Performance scoring and trend analysis
- **Automated Verification** - Build checks and code quality enforcement

## 🚦 Available Commands

```bash
# Development
npm run dev              # Start development server
npm run build            # Build for production
npm run lint             # Run ESLint
npm run type-check       # TypeScript validation
npm run validate         # All checks (lint + type + format)

# Agent System
npm run agent:verify     # Comprehensive agent verification
npm run agent:dashboard  # Reliability dashboard
npm run agent:metrics    # Performance metrics

# Database
npm run migrate          # Run database migrations
npm run db:test          # Test database connection
```

## 🏗 Architecture

Built on a simplified, scalable approach:

- **Direct API Integrations** - No complex orchestration layers
- **Serverless Infrastructure** - Neon PostgreSQL + Vercel deployment
- **Type-Safe Development** - Zod validation + TypeScript strict mode
- **Modern React Patterns** - App Router, Server Components, React 19

## 📊 Features in Development

- Advanced financial analytics
- Enhanced multi-tenant features
- Real-time collaboration tools
- Advanced reporting dashboards
- Mobile-responsive design enhancements

---

_Building the future of workforce financial intelligence._
