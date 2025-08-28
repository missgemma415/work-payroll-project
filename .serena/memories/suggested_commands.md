# Essential Development Commands

## Development Workflow
```bash
npm run dev          # Start development server (localhost:3000)
npm run build        # Build for production
npm run start        # Start production build
npm run lint         # Run ESLint for code quality
npm run type-check   # Run TypeScript type checking (tsc --noEmit)
```

## Database Operations
```bash
# Test database connection (replace with actual URL)
NEON_DATABASE_URL="postgresql://..." npx tsx -e "import { testConnection } from './lib/database.js'; testConnection().then(ok => console.log('DB Connection:', ok ? '✅ Success' : '❌ Failed'))"

# Run database scripts
npx tsx setup-database.js           # Database setup
npx tsx scripts/check-database.js   # Database validation
```

## File Processing & API Testing
```bash
# Test API endpoints
curl http://localhost:3000/api/health
curl http://localhost:3000/api/scan-files
curl http://localhost:3000/api/employee-costs
curl -X POST http://localhost:3000/api/process-files
```

## Deployment
```bash
vercel --prod        # Deploy to production
vercel dev           # Local development with Vercel
```

## Development Utilities
```bash
# macOS specific commands (Darwin system)
open .               # Open current directory in Finder  
open http://localhost:3000  # Open in browser
ls -la              # List files with details
find . -name "*.ts" -not -path "./node_modules/*"  # Find TypeScript files
grep -r "searchterm" --include="*.ts" --include="*.tsx" .  # Search in code

# Git operations
git status
git add .
git commit -m "message"
git push
```

## Task Management (with Taskmaster AI)
```bash
task-master init                    # Initialize project
task-master parse-prd scripts/prd.txt  # Parse requirements
task-master list                    # List all tasks
task-master next                    # Show next task
task-master add-task --prompt="..."  # Add new task
```