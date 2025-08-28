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

### AI Operations
- **Chat API**: POST to `/api/chat` - Natural language payroll queries using Claude API
- **Environment**: ANTHROPIC_API_KEY must be set in Vercel and .env.local
- **Model**: claude-3-5-haiku-20241022 (fast, cost-effective for executive Q&A)
- **Features**: Conversation history, SQL generation, executive-focused insights

### Deployment
- **Vercel Deploy**: `vercel --prod`
- **Current Production URL**: https://work-payroll-project-jflwxgi7g-gemmas-projects-a73d186f.vercel.app
- **Environment**: NEON_DATABASE_URL must be set in Vercel

## Architecture

### Tech Stack
- **Frontend**: Next.js 15.4.6, React 19.1.0, TypeScript
- **Styling**: Tailwind CSS 3.4.17 (stable) with custom executive theme
- **Database**: Neon PostgreSQL Serverless
- **AI Integration**: Anthropic Claude API (claude-3-5-haiku-20241022)
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
7. **AI-Powered Chat**: Natural language queries using Anthropic Claude API for instant payroll insights

### Data Flow
1. CSV files placed in `payroll-files-only/` folder
2. API processes and validates data with proper error handling
3. Database stores raw and calculated data
4. Dashboard displays real-time analytics with responsive design
5. Excel export generates executive reports

## Current Status (August 2025)
- ✅ **Database**: 24 employees, $596,000 total monthly cost, 23.7% average burden rate
- ✅ **Processing**: 4 files processed (SpringAhead + Paychex Nov/Dec 2024)
- ✅ **Design**: Fortune 500 executive dashboard with premium responsive styling
- ✅ **Export**: Working Excel export with comprehensive data
- ✅ **AI Integration**: Claude API fully operational with natural language payroll queries
- ✅ **Production**: Deployed and fully operational with AI features
- ✅ **Responsive**: Perfect display on mobile, tablet, and desktop
- ✅ **Currency**: Whole number rounding for clean executive presentation

## Recent Technical Fixes
- **Tailwind CSS**: Downgraded from v4 (alpha) to v3.4.17 (stable) for proper utility class support
- **Font Loading**: Fixed Poppins and Inter font loading with proper variable configuration
- **Responsive Design**: Implemented mobile-first responsive typography and layout
- **Currency Display**: Added Math.round() for whole number presentation
- **CSS Variables**: Resolved conflicts between globals.css and component styling

## MCP Server Configuration

### Installed MCP Servers
The project is configured with 10 powerful MCP (Model Context Protocol) servers for enhanced Claude capabilities:

1. **Fetch MCP** - Web content retrieval and API access
   - Command: `uvx mcp-server-fetch`
   - Usage: "Fetch content from [URL]" or "Get data from [API endpoint]"

2. **Memory MCP** - Persistent conversation memory
   - Command: `npx @modelcontextprotocol/server-memory`
   - Storage: `/Users/gemmahernandez/Desktop/work-payroll-project/.claude/memory/memory.json`
   - Usage: "Remember that [information]" or "What do you remember about [topic]"

3. **Sequential Thinking MCP** - Step-by-step problem solving
   - Command: `npx @modelcontextprotocol/server-sequential-thinking`
   - Usage: "Let's think through this step by step" or "Break down this complex problem"

4. **GitHub MCP** - Repository management and operations
   - Command: `npx @modelcontextprotocol/server-github`
   - Token: Configured with personal access token
   - Usage: "Show my repositories" or "Create an issue in [repo]"

5. **Neon MCP** - Direct database operations
   - Command: `npx mcp-remote https://mcp.neon.tech/mcp`
   - Usage: "Query the database for [data]" or "Show database schema"

6. **Puppeteer MCP** - Chrome browser automation
   - Command: `npx @modelcontextprotocol/server-puppeteer`
   - Usage: "Take a screenshot of [URL]" or "Automate testing of [page]"

7. **Playwright MCP** - Multi-browser automation
   - Command: `npx @playwright/mcp@latest`
   - Usage: "Test across browsers" or "Generate browser automation script"

8. **Desktop Commander** - File system operations
   - Command: `npx @wonderwhy-er/desktop-commander`
   - Restricted to: `/Users/gemmahernandez/Desktop/work-payroll-project`
   - Usage: "List files in directory" or "Batch rename files"

9. **Serena MCP** - Advanced code analysis
   - Command: `uvx --from git+https://github.com/oraios/serena serena start-mcp-server`
   - Usage: "Analyze codebase structure" or "Find code patterns"

10. **Taskmaster AI** - Intelligent task management and project coordination
   - Command: `npx task-master-ai`
   - Configuration: Uses claude-code provider with Opus/Sonnet models
   - Usage: "Create tasks from PRD" or "Show next task to work on"

### Configuration Files
- **Claude Desktop**: `~/Library/Application Support/Claude/claude_desktop_config.json`
- **Claude Code**: `~/.claude.json` (global) + `.claude_mcp.json` (project-specific)
- **Memory Storage**: `.claude/memory/memory.json`

### Testing MCP Servers
Use these commands to test functionality:
- "Fetch the homepage of example.com"
- "Remember that this project analyzes payroll costs"
- "Show my GitHub repositories"
- "Take a screenshot of localhost:3000"
- "List files in the current directory"
- "Analyze the structure of this codebase"

## Important Notes
- Always use empty parameter arrays `[]` with query function for raw SQL
- File processing status is tracked in `imported_files` table
- Burden calculations include FICA, Medicare, FUTA, SUTA, and benefits
- Executive styling uses dark slate gradient theme with gold accents
- All currency values are rounded to whole numbers for executive presentation
- Typography scales responsively: `text-4xl md:text-5xl lg:text-6xl`