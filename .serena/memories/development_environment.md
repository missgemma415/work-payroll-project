# Development Environment

## System Information
- **Operating System**: macOS (Darwin)
- **Node.js**: Latest LTS version
- **Package Manager**: npm (with package-lock.json)
- **Runtime**: tsx for TypeScript execution

## macOS Specific Commands
```bash
# File operations
open .                    # Open current directory in Finder
open -a "Cursor" .        # Open project in Cursor IDE
open http://localhost:3000 # Open development server in browser

# System utilities
ls -la                    # List files with permissions
find . -name "*.ts" -not -path "./node_modules/*"  # Find TypeScript files
grep -r "pattern" --include="*.ts" --include="*.tsx" . # Search in code
pbcopy < file.txt         # Copy file contents to clipboard
```

## Environment Variables
Required in `.env.local`:
```
NEON_DATABASE_URL=postgresql://neondb_owner:npg_...@ep-...neon.tech/neondb?sslmode=require
```

## MCP Server Integration
The project uses multiple MCP (Model Context Protocol) servers:
- **Serena**: Advanced code analysis and manipulation
- **Taskmaster AI**: AI-powered task management 
- **GitHub**: Repository operations
- **Memory**: Persistent conversation memory
- **Desktop Commander**: File system operations
- **Neon**: Direct database operations
- **Puppeteer/Playwright**: Browser automation

## IDE Configuration
- **Primary IDE**: Cursor with MCP integration
- **Configuration**: `.claude_mcp.json` for MCP server setup
- **Extensions**: ESLint, Prettier, TypeScript support

## Database Setup
- **Provider**: Neon PostgreSQL Serverless
- **Connection**: Environment variable based
- **Schema**: Defined in `create-schema.sql`
- **Migrations**: Available in `migrations/` directory

## Development Workflow
1. Start with `npm run dev`
2. Make changes with hot reload
3. Test with curl commands for API endpoints
4. Verify with lint and type-check
5. Build and deploy via Vercel

## File Processing
- **Input Directory**: `payroll-files-only/`
- **Supported Formats**: CSV files (SpringAhead, Paychex)
- **Processing**: Via `/api/process-files` endpoint
- **Export**: Excel generation via `/api/export/excel`