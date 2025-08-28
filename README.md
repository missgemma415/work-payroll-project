# CEO Payroll Analytics Platform

A Fortune 500-level executive dashboard for comprehensive workforce cost analysis with real-time burden calculations, neural forecasting, QuickBooks integration, and AI-powered natural language insights.

## 🎯 Overview

Professional executive dashboard providing strategic workforce cost intelligence for C-suite decision making. Features responsive design, real-time analytics, AI-powered natural language queries, neural time series forecasting, QuickBooks Online integration, and board-ready reporting.

## 🚀 Live Production

**Dashboard**: https://work-payroll-project-lzjz0fori-gemmas-projects-a73d186f.vercel.app

## 📊 Current Metrics

- **24 Active Employees** with complete cost analysis
- **$596,000 Total Monthly Cost** (all-inclusive)
- **23.7% Average Burden Rate** (FICA, Medicare, FUTA, SUTA, benefits)
- **4 Data Sources** processed (SpringAhead + Paychex)

## 🏗️ Tech Stack

### Frontend & Dashboard
- **Next.js**: 15.4.6 with React 19.1.0 and TypeScript
- **Styling**: Tailwind CSS 3.4.17 with Fortune 500 executive theme
- **UI Components**: Radix UI with shadcn/ui design system
- **Deployment**: Vercel

### Backend Services
- **Database**: Neon PostgreSQL Serverless with 6 QuickBooks tables
- **Neural Forecasting**: FastAPI + NeuralProphet (PyTorch-based) on port 8000
- **QuickBooks Integration**: FastAPI + python-quickbooks SDK on port 8001
- **AI Integration**: Anthropic Claude API (claude-3-5-haiku-20241022)

### Data & Analytics
- **Time Series Forecasting**: NeuralProphet for complex workforce patterns
- **QuickBooks Online**: OAuth 2.0 integration with real-time sync
- **Mock Data**: 3-year comprehensive test dataset (1,209 payroll records)

## 🛠️ Development

### Quick Start
```bash
npm install
npm run dev
```

### Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Run ESLint
npm run type-check   # TypeScript validation
```

### Database
```bash
# Test connection
NEON_DATABASE_URL="your-url" npx tsx -e "import { testConnection } from './lib/database.js'; testConnection().then(ok => console.log('DB:', ok ? '✅' : '❌'))"
```

### AI Chat API
```bash
# Test natural language queries
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is our total monthly payroll cost?"}'
```

## 📁 Project Structure

```
├── app/                     # Next.js app directory
│   ├── api/                # API endpoints
│   │   ├── chat/           # AI chat endpoint
│   │   └── forecasting/    # Neural forecasting proxy
│   └── page.tsx            # Executive dashboard
├── components/             # UI components
├── lib/                    # Database & utilities
│   └── ai/                 # Claude API integration
├── forecasting_service/    # FastAPI neural forecasting service (port 8000)
├── quickbooks_service/     # FastAPI QuickBooks integration (port 8001)
├── scripts/                # Data generation & testing scripts
├── mock_data/              # 3-year comprehensive test dataset
├── payroll-files-only/     # CSV data files
├── .taskmaster/            # Task management (Taskmaster AI)
└── docs/                   # Documentation
```

## 📋 Features

### Executive Dashboard
- **Fortune 500 Design**: Dark slate theme with gold accents
- **Responsive Layout**: Mobile-first design for all devices
- **Real-time Analytics**: Live workforce cost calculations
- **AI-Powered Chat**: Natural language payroll queries with Claude API
- **Excel Export**: Board-ready reports with 4 comprehensive worksheets

### Advanced Analytics
- **Neural Forecasting**: PyTorch-based workforce cost predictions
- **Time Series Analysis**: Complex seasonal pattern recognition
- **QuickBooks Integration**: Real-time synchronization with accounting data
- **Comprehensive Testing**: 3-year mock dataset with 1,209 payroll records

### Data Processing
- **Multi-source Integration**: SpringAhead + Paychex + QuickBooks
- **Burden Analysis**: Complete employer cost calculations (23.7% average)
- **Edge Case Handling**: Hiring events, terminations, seasonal variations
- **Audit Logging**: Complete sync operation tracking

## 📖 Documentation

- **[CLAUDE.md](./CLAUDE.md)** - AI assistant instructions
- **[projectcontextengineering.md](./projectcontextengineering.md)** - Technical architecture
- **[projecttasks.md](./projecttasks.md)** - Development history & roadmap

## 🔐 Environment

Required environment variables:
```
NEON_DATABASE_URL=postgresql://...
ANTHROPIC_API_KEY=sk-ant-api03-...
```

## 📈 Status

✅ **Production Ready** - Fortune 500 executive dashboard with AI integration operational

---

**Built for Fortune 500 C-suite executives** | **Deployed on Vercel** | **Powered by Next.js**