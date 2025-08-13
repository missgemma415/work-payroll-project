# CEO Payroll Analytics Platform

A Fortune 500-level executive dashboard for comprehensive workforce cost analysis with real-time burden calculations.

## 🎯 Overview

Professional executive dashboard providing strategic workforce cost intelligence for C-suite decision making. Features responsive design, real-time analytics, and board-ready reporting.

## 🚀 Live Production

**Dashboard**: https://work-payroll-project-lzjz0fori-gemmas-projects-a73d186f.vercel.app

## 📊 Current Metrics

- **24 Active Employees** with complete cost analysis
- **$596,000 Total Monthly Cost** (all-inclusive)
- **23.7% Average Burden Rate** (FICA, Medicare, FUTA, SUTA, benefits)
- **4 Data Sources** processed (SpringAhead + Paychex)

## 🏗️ Tech Stack

- **Frontend**: Next.js 15.4.6, React 19.1.0, TypeScript
- **Styling**: Tailwind CSS 3.4.17 with Fortune 500 executive theme
- **Database**: Neon PostgreSQL Serverless
- **Deployment**: Vercel
- **UI Components**: Radix UI with shadcn/ui

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

## 📁 Project Structure

```
├── app/                    # Next.js app directory
│   ├── api/               # API endpoints
│   └── page.tsx           # Executive dashboard
├── components/            # UI components
├── lib/                   # Database & utilities
├── payroll-files-only/    # CSV data files
└── docs/                  # Documentation
```

## 📋 Features

- **Executive Dashboard**: Dark slate theme with gold accents
- **Responsive Design**: Mobile-first responsive layout
- **Real-time Analytics**: Live workforce cost calculations
- **Excel Export**: Board-ready reports with 4 worksheets
- **File Processing**: SpringAhead + Paychex CSV integration
- **Burden Analysis**: Complete employer cost calculations

## 📖 Documentation

- **[CLAUDE.md](./CLAUDE.md)** - AI assistant instructions
- **[projectcontextengineering.md](./projectcontextengineering.md)** - Technical architecture
- **[projecttasks.md](./projecttasks.md)** - Development history & roadmap

## 🔐 Environment

Required environment variables:
```
NEON_DATABASE_URL=postgresql://...
```

## 📈 Status

✅ **Production Ready** - Fortune 500 executive dashboard operational

---

**Built for Fortune 500 C-suite executives** | **Deployed on Vercel** | **Powered by Next.js**