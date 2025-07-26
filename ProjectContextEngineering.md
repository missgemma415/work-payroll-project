# Project Context Engineering

## Overview
The Scientia Capital HR Platform is a modern, human-centered employee wellness and engagement application designed to foster better workplace culture through daily check-ins, task management, peer recognition, and team analytics.

## Technical Architecture

### Tech Stack
- **Frontend Framework**: Next.js 15 (App Router)
- **UI Components**: Custom components built with shadcn/ui
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React Context API (planned)
- **Data Fetching**: React Query (planned)
- **Database**: Cloudflare D1 (SQLite at the edge)
- **Deployment**: Cloudflare Pages
- **Type Safety**: TypeScript with strict mode
- **Code Quality**: ESLint, Prettier, Husky hooks

### Architecture Decisions

#### 1. Next.js App Router
- Chosen for server components and improved performance
- Better data fetching patterns with async components
- Built-in layouts and error handling
- Seamless integration with edge runtime

#### 2. Component Architecture
```
components/
├── dashboard/       # Feature-specific components
│   ├── MoodCheckIn.tsx
│   ├── TodaysPriorities.tsx
│   ├── KudosWall.tsx
│   └── TeamPulse.tsx
└── ui/             # Reusable UI primitives
    ├── button.tsx
    ├── card.tsx
    └── ...
```

#### 3. Database Design
- Multi-tenant architecture with organization-based isolation
- Optimized for edge performance with Cloudflare D1
- Comprehensive indexing for common queries
- JSON fields for flexible metadata storage

#### 4. State Management Strategy
```typescript
// Global state for user/organization context
interface AppState {
  user: User | null;
  organization: Organization | null;
  preferences: UserPreferences;
}

// Feature-specific state managed locally
interface DashboardState {
  moodHistory: MoodCheckIn[];
  priorities: DailyPriority[];
  kudos: Kudos[];
}
```

### Development Phases

#### Phase 1: Local Development (Current)
- Mock API routes with static data
- Local state management
- Focus on UI/UX refinement
- No external dependencies

#### Phase 2: Backend Integration
- Cloudflare D1 database setup
- API routes with real database
- Authentication system
- Data validation and security

#### Phase 3: Production Features
- Real-time updates
- Email notifications
- Advanced analytics
- Mobile responsiveness

### API Design

#### RESTful Endpoints
```
GET    /api/moods          # Get mood history
POST   /api/moods          # Submit mood check-in
GET    /api/priorities     # Get user priorities
POST   /api/priorities     # Create priority
PATCH  /api/priorities/:id # Update priority
DELETE /api/priorities/:id # Delete priority
GET    /api/kudos          # Get kudos feed
POST   /api/kudos          # Give kudos
POST   /api/kudos/:id/like # Like kudos
GET    /api/team-pulse     # Get team analytics
```

#### Response Format
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    pagination?: PaginationMeta;
  };
}
```

### Security Considerations
- Input validation with Zod schemas
- SQL injection prevention via parameterized queries
- XSS protection through React's built-in escaping
- CSRF protection via SameSite cookies
- Rate limiting on API endpoints

### Performance Optimization
- Static generation for marketing pages
- Dynamic rendering for dashboard
- Image optimization with Next.js Image
- Code splitting and lazy loading
- Edge caching with Cloudflare

### Testing Strategy
- Unit tests for utilities and hooks
- Integration tests for API routes
- Component testing with React Testing Library
- E2E tests for critical user flows
- Performance monitoring with Web Vitals

### Deployment Pipeline
1. Local development with hot reload
2. Pre-commit hooks for code quality
3. PR checks with TypeScript and ESLint
4. Staging deployment on branch push
5. Production deployment on main merge

### Future Considerations
- WebSocket support for real-time features
- Progressive Web App capabilities
- Internationalization support
- Advanced analytics and reporting
- AI-powered insights and recommendations