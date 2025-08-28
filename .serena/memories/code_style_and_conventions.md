# Code Style and Conventions

## TypeScript Configuration
- **Target**: ES2017 with strict mode enabled
- **Module System**: ESNext with bundler resolution
- **Path Mapping**: `@/*` points to project root
- **JSX**: Preserve mode for Next.js processing

## Naming Conventions
- **Files**: kebab-case for regular files, PascalCase for React components
- **Components**: PascalCase (e.g., `HomePage`, `EmployeeCost`)
- **Functions**: camelCase (e.g., `testConnection`, `processFiles`)
- **Variables**: camelCase (e.g., `employeeCosts`, `isProcessing`)
- **Constants**: UPPER_SNAKE_CASE for environment variables
- **Interfaces**: PascalCase with descriptive names (e.g., `EmployeeCost`, `FileInfo`)

## Code Organization
- **Imports**: Group by external libraries, internal utilities, components
- **Export Style**: Named exports preferred, default exports for pages/layouts
- **Component Structure**: Props interface, main component, export
- **Database Functions**: Async functions with proper error handling

## Database Patterns
```typescript
// Always use the sql template literal or query() function
const result = await sql`SELECT * FROM employees`;
// OR
const result = await query<EmployeeType>('SELECT * FROM employees WHERE id = $1', [id]);
```

## Error Handling
- **Database**: Comprehensive error logging with query context
- **API Routes**: Standard HTTP status codes with meaningful messages
- **Client Side**: Graceful fallbacks and user-friendly error states

## Comments and Documentation
- **Function Headers**: Brief JSDoc comments for complex functions
- **Database Queries**: Comments explaining business logic
- **Component Props**: TypeScript interfaces serve as documentation
- **Complex Logic**: Inline comments for clarity

## Styling Conventions
- **Tailwind CSS**: Utility-first approach with custom executive theme
- **Component Classes**: Use `cn()` utility for conditional classes
- **Responsive**: Mobile-first design with `md:` and `lg:` breakpoints
- **Colors**: Executive theme with dark slate backgrounds and gold accents
- **Typography**: Responsive scaling with `text-4xl md:text-5xl lg:text-6xl`

## Best Practices
- **Currency Display**: Always use `Math.round()` for whole number presentation
- **Loading States**: Implement loading spinners for async operations
- **Form Handling**: React Hook Form with Zod validation
- **Type Safety**: Prefer TypeScript interfaces over `any` types