# Codebase Structure

## Directory Layout
```
work-payroll-project/
├── app/                    # Next.js 15 App Router
│   ├── api/               # API routes
│   │   ├── employee-costs/ # Cost analysis endpoint
│   │   ├── process-files/ # CSV file processing
│   │   ├── scan-files/    # File scanning endpoint
│   │   ├── export/excel/  # Excel export functionality
│   │   ├── health/        # Health check endpoint
│   │   └── chat/          # AI chat functionality
│   ├── analytics/         # Analytics dashboard pages
│   ├── auth-demo/         # Authentication demo
│   ├── login/             # Login functionality
│   ├── register/          # Registration page
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx          # Executive dashboard (main page)
│   └── globals.css       # Global Tailwind styles
├── components/            # Reusable UI components
├── lib/                   # Core utilities and services
│   ├── database/         # Database schemas and queries
│   ├── parsers/          # CSV parsing utilities
│   ├── types/            # TypeScript type definitions
│   ├── auth/             # Authentication utilities
│   ├── api/              # API utilities and clients
│   ├── database.ts       # Main database connection
│   ├── utils.ts          # General utilities (cn, etc.)
│   └── env.ts            # Environment variable handling
├── payroll-files-only/   # CSV data files for processing
├── scripts/              # Database and utility scripts
├── migrations/           # Database migration files
├── docs/                 # Project documentation
├── .taskmaster/          # Taskmaster AI configuration
├── .claude/              # Claude AI memory and config
└── .serena/              # Serena MCP configuration
```

## Key Architecture Patterns
- **App Router**: Next.js 15 app directory structure
- **API Routes**: RESTful endpoints in app/api/
- **Component-Based**: React functional components with TypeScript
- **Server Components**: Leveraging Next.js server components
- **Database Layer**: Clean separation with lib/database.ts
- **Type Safety**: Full TypeScript coverage with strict mode