# Project Context Engineering

## Executive Summary
**CEO Payroll Analytics Platform** - A sophisticated Fortune 500 workforce cost intelligence system with responsive executive dashboard. Provides real-time burden analysis, true employee cost calculations, and board-ready reporting with professional presentation.

## Business Context

### Problem Statement
CEOs need accurate visibility into true employee costs beyond base salaries, including:
- Employer tax burdens (FICA, Medicare, FUTA, SUTA)
- Benefits costs and overhead
- Project allocation and time tracking
- Real-time cost analysis for strategic decision making
- Mobile-accessible data for executive decision making

### Solution Value
- **Strategic Insight**: Complete workforce cost transparency with $596K monthly visibility
- **Board Readiness**: Professional Excel reports for C-suite presentations
- **Real-time Analytics**: Live data dashboard accessible on all devices
- **Multi-source Integration**: SpringAhead + Paychex unified analysis
- **Executive UX**: Fortune 500-level design with responsive mobile experience

## Technical Architecture

### System Design
```
Data Sources → Processing Engine → Database → Responsive Executive Dashboard → Excel Reports
```

#### Data Sources
1. **SpringAhead CSV**: Time tracking and project allocation
   - Employee hours by project
   - Hourly rates and project assignments
   - Task descriptions and work dates

2. **Paychex CSV**: Payroll and tax data
   - Gross pay and deductions
   - Federal, state, FICA, Medicare taxes
   - Benefits costs and bonuses

#### Processing Engine (`/api/process-files`)
- **File Detection**: Auto-identifies SpringAhead vs Paychex files
- **Data Validation**: Ensures data integrity with error handling
- **Burden Calculation**: Computes employer costs with 23.7% average burden
- **Aggregation**: Monthly employee cost summaries with rounding

#### Database Schema (Neon PostgreSQL Serverless)
- `projects`: Project metadata and client information
- `imported_files`: File processing tracking with status management
- `payroll_data`: Raw payroll and time tracking data
- `employee_costs`: Aggregated monthly employee costs

#### Executive Dashboard (Responsive)
- **Dark Executive Theme**: Professional slate/charcoal (#0f172a) with gold accents (#fbbf24)
- **Responsive Design**: Mobile-first scaling (text-4xl → md:text-5xl → lg:text-6xl)
- **Real-time KPIs**: Live workforce metrics with whole number formatting
- **Interactive Controls**: Process data, refresh analytics, export reports
- **Professional Typography**: Poppins display font, Inter body text

## Current Production Metrics (December 2024)
- **Employees**: 24 active with complete cost data
- **Total Monthly Cost**: $596,000 (all-inclusive, rounded)
- **Average Burden Rate**: 23.7%
- **Data Sources**: 4 files processed (Nov/Dec 2024 SpringAhead + Paychex)
- **Production Status**: Fully operational with responsive design
- **Performance**: Fast loading on mobile/tablet/desktop

## Technical Infrastructure

### Frontend Stack
- **Framework**: Next.js 15.4.6 with React 19.1.0 and TypeScript
- **Styling**: Tailwind CSS 3.4.17 (stable) with custom executive theme
- **UI Components**: Radix UI with shadcn/ui design system
- **Fonts**: Google Fonts (Poppins display, Inter sans-serif)
- **Responsive**: Mobile-first with breakpoint scaling

### Backend & Data
- **Database**: Neon PostgreSQL Serverless with SSL encryption
- **Authentication**: Environment variable protection
- **Performance**: Optimized queries with proper indexing
- **File Processing**: CSV parsing with validation and error handling

### Deployment & DevOps
- **Platform**: Vercel with edge functions for global performance
- **CI/CD**: Automatic deployments with build verification
- **Monitoring**: Production error tracking and performance metrics
- **Environment**: Secure environment variable management

## Recent Technical Achievements
- **Tailwind CSS Stability**: Migrated from v4 alpha to v3.4.17 stable
- **Font System**: Fixed Poppins/Inter loading with proper CSS variables
- **Responsive Design**: Implemented mobile-first executive dashboard
- **Currency Formatting**: Added whole number rounding for clean presentation
- **CSS Architecture**: Resolved conflicts between global styles and components
- **Repository Cleanup**: Fixed GitHub errors by removing duplicate files

## Future Enhancements
- Real-time data connectors (API integrations with SpringAhead/Paychex)
- Advanced analytics with forecasting and trend analysis
- Department-level cost allocation and budgeting tools
- Enhanced mobile experience with progressive web app features
- Advanced reporting templates with custom filtering
- Automated alert system for budget thresholds