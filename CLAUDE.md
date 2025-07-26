# CLAUDE.md - Project Guidelines and Instructions

## Core Principles

- **Zero-tolerance policy for TypeScript and ESLint errors going forward!**
- Enterprise-grade code quality standards
- Security-first approach
- Clean, maintainable code

## Project Status (As of January 2025)

### Completed ✅

1. **Authentication System**
   - JWT-based authentication with access/refresh tokens
   - Secure password hashing with bcrypt
   - Role-based access control (owner, admin, member)
   - Auth middleware for protected routes
   - Login, register, logout, and token refresh endpoints

2. **Environment Configuration**
   - Comprehensive env validation with Zod
   - Secure secrets management
   - Feature flags for development

3. **Code Quality**
   - All TypeScript errors resolved
   - All ESLint errors fixed
   - Strict type safety enforced
   - Consistent import ordering

4. **Documentation**
   - ProjectContextEngineering.md created
   - ProjectTasks.md with prioritized tasks
   - Comprehensive type definitions

### In Progress 🚧

1. **Database Integration**
   - Replace in-memory storage with Cloudflare D1
   - Implement proper data persistence

2. **API Protection**
   - Add auth middleware to all API routes
   - Implement rate limiting

3. **Validation**
   - Add Zod schemas to all API endpoints
   - Input sanitization

### Next Steps 📋

1. Build auth context and useAuth hook for frontend
2. Protect all existing API routes with authentication
3. Add comprehensive Zod validation
4. Replace in-memory storage with real database
5. Create test suite

## Development Guidelines

### Code Style

- Use explicit return types on all functions
- Prefer type imports: `import type { ... }`
- Use nullish coalescing (??) over logical OR (||)
- Prefix unused variables with underscore
- No console.log in production code

### Security

- Never expose secrets in code
- Always validate user input
- Use parameterized queries
- Implement proper error handling
- Sanitize all outputs

### Git Workflow

- Always run `npm run lint` before committing
- Write clear, descriptive commit messages
- Never force push to main
- Create feature branches for new work

### Testing

- Write tests for all new features
- Maintain high code coverage
- Test edge cases and error scenarios
- Use proper mocking for external dependencies

## Commands

```bash
# Development
npm run dev          # Start dev server
npm run lint         # Check for ESLint errors
npm run lint:fix     # Auto-fix ESLint errors
npm run type-check   # Run TypeScript checks

# Git workflow
npm run git:sync     # Pull, validate, and push
npm run git:review   # Review staged changes
```

## Environment Variables

Required variables are defined in `.env.local.example`. Copy to `.env.local` and fill in your values.

## Architecture Decisions

- Next.js 15 with App Router for modern React features
- JWT authentication for stateless auth
- Cloudflare D1 for edge database
- Zod for runtime validation
- React Context for state management

Remember: **Quality over speed. Do it right the first time.**
