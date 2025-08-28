# Task Completion Workflow

## Standard Completion Process
When any development task is completed, follow these steps in order:

### 1. Code Quality Checks
```bash
npm run lint         # ESLint for code quality and consistency
npm run type-check   # TypeScript compilation and type validation
```
**Must Pass**: Both commands must complete without errors before proceeding.

### 2. Build Verification
```bash
npm run build        # Ensure production build works
```
**Must Pass**: Build must complete successfully to verify no runtime issues.

### 3. Local Testing
```bash
npm run dev          # Start development server
```
**Verify**: 
- Application starts without errors
- All modified functionality works as expected
- No console errors in browser
- Database connections work if applicable

### 4. Database Verification (if applicable)
```bash
# Test database connection
NEON_DATABASE_URL="..." npx tsx -e "import { testConnection } from './lib/database.js'; testConnection().then(ok => console.log('DB:', ok ? '✅' : '❌'))"
```

### 5. API Endpoint Testing (if applicable)
```bash
# Test relevant API endpoints
curl http://localhost:3000/api/health
curl http://localhost:3000/api/employee-costs
curl http://localhost:3000/api/scan-files
```

## Critical Requirements
- **No Lint Errors**: Code must pass ESLint checks
- **No Type Errors**: TypeScript compilation must succeed
- **Successful Build**: Production build must complete
- **Functional Testing**: All affected features must work
- **Database Connectivity**: Database operations must function (if applicable)

## Pre-Commit Checklist
- [ ] Code follows project conventions
- [ ] All imports are properly organized
- [ ] Comments added for complex logic
- [ ] TypeScript types are properly defined
- [ ] Error handling is implemented
- [ ] Currency values are rounded (if applicable)
- [ ] Responsive design principles followed
- [ ] No console errors in development

## Documentation Updates
- Update CLAUDE.md if new commands or processes added
- Update README.md if significant features added
- Add inline comments for complex business logic
- Update type definitions for new data structures

## Deployment Considerations
- Ensure environment variables are properly set
- Verify Vercel deployment settings
- Test production build locally before deployment
- Check that all API endpoints work in production environment