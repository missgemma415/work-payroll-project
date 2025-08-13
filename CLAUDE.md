# Claude AI Assistant Instructions

## Project Overview
**CEO Payroll Analytics Platform** - A Fortune 500-level executive dashboard for comprehensive workforce cost analysis with real-time burden calculations and responsive design.

## Key Commands & Operations

### Development
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

### Database Operations
- **Connection Test**: `NEON_DATABASE_URL="postgresql://neondb_owner:npg_26KGepdyhVnU@ep-icy-hall-ae2vazj8.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require" npx tsx -e "import { testConnection } from './lib/database.js'; testConnection().then(ok => console.log('DB Connection:', ok ? '✅ Success' : '❌ Failed'))"`
- **Schema Setup**: Database schema is in `create-schema.sql`
- **Data Query**: Use `sql` template literals or `query()` function from `lib/database.ts`

### File Processing
- **Process Files**: POST to `/api/process-files` - Processes CSV files from `payroll-files-only/` folder
- **Scan Files**: GET `/api/scan-files` - Lists files and processing status
- **Employee Costs**: GET `/api/employee-costs` - Returns calculated employee costs with burden analysis
- **Excel Export**: GET `/api/export/excel` - Generates board-ready Excel reports

### Deployment
- **Vercel Deploy**: `vercel --prod`
- **Current Production URL**: https://work-payroll-project-jflwxgi7g-gemmas-projects-a73d186f.vercel.app
- **Environment**: NEON_DATABASE_URL must be set in Vercel

## Architecture

### Tech Stack
- **Frontend**: Next.js 15.4.6, React 19.1.0, TypeScript
- **Styling**: Tailwind CSS 3.4.17 (stable) with custom executive theme
- **Database**: Neon PostgreSQL Serverless
- **UI Components**: Radix UI with shadcn/ui design system
- **Fonts**: Poppins (display), Inter (sans-serif) via Google Fonts
- **Deployment**: Vercel

### Key Features
1. **Executive Dashboard**: Fortune 500-level dark slate theme with gold accents
2. **Responsive Design**: Mobile-first with perfect scaling across all devices
3. **Real-time Analytics**: Live workforce cost calculations with whole number rounding
4. **Burden Analysis**: Comprehensive tax and benefits cost calculations
5. **Excel Export**: Board-ready reports with 4 detailed worksheets
6. **Multi-source Processing**: SpringAhead (time tracking) + Paychex (payroll) integration

### Data Flow
1. CSV files placed in `payroll-files-only/` folder
2. API processes and validates data with proper error handling
3. Database stores raw and calculated data
4. Dashboard displays real-time analytics with responsive design
5. Excel export generates executive reports

## Current Status (December 2024)
- ✅ **Database**: 24 employees, $596,000 total monthly cost, 23.7% average burden rate
- ✅ **Processing**: 4 files processed (SpringAhead + Paychex Nov/Dec 2024)
- ✅ **Design**: Fortune 500 executive dashboard with premium responsive styling
- ✅ **Export**: Working Excel export with comprehensive data
- ✅ **Production**: Deployed and fully operational
- ✅ **Responsive**: Perfect display on mobile, tablet, and desktop
- ✅ **Currency**: Whole number rounding for clean executive presentation

## Recent Technical Fixes
- **Tailwind CSS**: Downgraded from v4 (alpha) to v3.4.17 (stable) for proper utility class support
- **Font Loading**: Fixed Poppins and Inter font loading with proper variable configuration
- **Responsive Design**: Implemented mobile-first responsive typography and layout
- **Currency Display**: Added Math.round() for whole number presentation
- **CSS Variables**: Resolved conflicts between globals.css and component styling

## Important Notes
- Always use empty parameter arrays `[]` with query function for raw SQL
- File processing status is tracked in `imported_files` table
- Burden calculations include FICA, Medicare, FUTA, SUTA, and benefits
- Executive styling uses dark slate gradient theme with gold accents
- All currency values are rounded to whole numbers for executive presentation
- Typography scales responsively: `text-4xl md:text-5xl lg:text-6xl`