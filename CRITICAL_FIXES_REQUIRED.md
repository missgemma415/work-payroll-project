# 🚨 CRITICAL FIXES REQUIRED FOR PRODUCTION

This codebase is **NOT PRODUCTION READY**. It's currently a prototype with serious security and scalability issues.

## Immediate Security Fixes (DO THESE FIRST)

### 1. Authentication & Authorization

```typescript
// CURRENT: No auth at all
export async function GET(request: NextRequest) {
  // Anyone can access this!
}

// REQUIRED: Add auth middleware
import { verifyToken } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = await verifyToken(request);
  if (!user) return new Response('Unauthorized', { status: 401 });

  // Check organization access
  if (user.organizationId !== request.query.orgId) {
    return new Response('Forbidden', { status: 403 });
  }
}
```

### 2. Remove In-Memory Storage

```typescript
// CURRENT: This will crash with multiple users!
export const kudosList = generateMockKudos();

// REQUIRED: Use real database
import { db } from '@/lib/db';

export async function GET() {
  const kudos = await db.kudos.findMany({
    where: { organizationId: user.organizationId },
  });
}
```

### 3. Add Input Validation

```typescript
// CURRENT: Vulnerable to injection
const body = (await request.json()) as CreateKudosRequest;

// REQUIRED: Validate everything
import { z } from 'zod';

const CreateKudosSchema = z.object({
  message: z.string().min(1).max(500),
  category: z.enum(['teamwork', 'innovation', 'leadership']),
  to_user_id: z.string().uuid().optional(),
});

const body = CreateKudosSchema.parse(await request.json());
```

### 4. Fix Static Export

```typescript
// next.config.ts
// REMOVE THIS LINE:
output: 'export',

// This prevents API routes from working!
```

## Architecture Fixes

### 1. Service Layer Pattern

```typescript
// /lib/services/kudos.service.ts
export class KudosService {
  constructor(
    private db: Database,
    private cache: CacheService,
    private logger: Logger
  ) {}

  async createKudos(userId: string, data: CreateKudosDto) {
    // Validate permissions
    await this.validateUserCanGiveKudos(userId);

    // Create with transaction
    const kudos = await this.db.transaction(async (tx) => {
      const created = await tx.kudos.create({ ...data, fromUserId: userId });
      await tx.activityLogs.create({ action: 'kudos_created', userId });
      return created;
    });

    // Invalidate cache
    await this.cache.invalidate(`kudos:${kudos.organizationId}`);

    // Log for monitoring
    this.logger.info('Kudos created', { kudosId: kudos.id, userId });

    return kudos;
  }
}
```

### 2. Repository Pattern

```typescript
// /lib/repositories/kudos.repository.ts
export class KudosRepository {
  async findByOrganization(orgId: string, options: PaginationOptions) {
    return this.db.kudos.findMany({
      where: { organizationId: orgId },
      include: { fromUser: true, toUser: true },
      skip: options.offset,
      take: options.limit,
      orderBy: { createdAt: 'desc' },
    });
  }
}
```

## Testing Requirements

### 1. Unit Tests (Jest)

```typescript
// /lib/services/__tests__/kudos.service.test.ts
describe('KudosService', () => {
  it('should enforce rate limits', async () => {
    // User can only give 10 kudos per day
    for (let i = 0; i < 10; i++) {
      await service.createKudos(userId, mockData);
    }

    await expect(service.createKudos(userId, mockData)).rejects.toThrow('Rate limit exceeded');
  });
});
```

### 2. Integration Tests

```typescript
// /tests/api/kudos.test.ts
describe('POST /api/kudos', () => {
  it('requires authentication', async () => {
    const res = await request(app).post('/api/kudos').send({ message: 'Great job!' });

    expect(res.status).toBe(401);
  });
});
```

## DevOps Requirements

### 1. Environment Configuration

```env
# .env.local
DATABASE_URL=postgresql://user:pass@localhost:5432/scientia
REDIS_URL=redis://localhost:6379
JWT_SECRET=generate-a-real-secret-here
SENTRY_DSN=your-sentry-dsn
```

### 2. Docker Setup

```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
RUN npm ci --production
EXPOSE 3000
CMD ["npm", "start"]
```

### 3. GitHub Actions CI/CD

```yaml
# .github/workflows/ci.yml
name: CI/CD
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm test -- --coverage
      - run: npm run test:e2e
```

## Monitoring & Observability

### 1. Structured Logging

```typescript
import { createLogger } from '@/lib/logger';

const logger = createLogger('kudos-service');

logger.info('Kudos created', {
  kudosId: kudos.id,
  userId: user.id,
  organizationId: org.id,
  category: kudos.category,
  timestamp: new Date().toISOString(),
});
```

### 2. Error Tracking

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  integrations: [new Sentry.Integrations.Http({ tracing: true })],
  tracesSampleRate: 1.0,
});
```

### 3. Metrics

```typescript
import { metrics } from '@/lib/metrics';

// Track API latency
const timer = metrics.histogram('api_latency_seconds', {
  help: 'API latency in seconds',
  labelNames: ['method', 'route', 'status'],
});

const end = timer.startTimer();
// ... handle request
end({ method: 'POST', route: '/api/kudos', status: 200 });
```

## Multi-Tenancy Requirements

### 1. Tenant Isolation Middleware

```typescript
export async function tenantMiddleware(request: NextRequest) {
  const user = await getCurrentUser(request);

  // Set tenant context for all queries
  AsyncLocalStorage.run({ tenantId: user.organizationId }, () => {
    // All DB queries will automatically filter by tenant
  });
}
```

### 2. Row-Level Security

```sql
-- Enable RLS on all tables
ALTER TABLE kudos ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their organization's data
CREATE POLICY tenant_isolation ON kudos
  FOR ALL
  USING (organization_id = current_setting('app.current_tenant')::uuid);
```

## Data Privacy & Compliance

### 1. GDPR Compliance

```typescript
// /app/api/users/[id]/export/route.ts
export async function GET(request: NextRequest) {
  const userId = request.params.id;

  // Export all user data
  const userData = await exportUserData(userId);

  return new Response(JSON.stringify(userData), {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="user-data-${userId}.json"`,
    },
  });
}
```

### 2. Audit Logging

```typescript
// Every data mutation must be logged
await auditLog.create({
  userId: user.id,
  action: 'DELETE_PRIORITY',
  resourceType: 'priority',
  resourceId: priorityId,
  metadata: { reason: 'User requested deletion' },
  ipAddress: request.ip,
  userAgent: request.headers['user-agent'],
});
```

## Performance & Scalability

### 1. Caching Strategy

```typescript
// Use Redis for caching
const cachedKudos = await redis.get(`kudos:${orgId}:${page}`);
if (cachedKudos) return JSON.parse(cachedKudos);

const kudos = await db.kudos.findMany({ ... });
await redis.setex(`kudos:${orgId}:${page}`, 300, JSON.stringify(kudos));
```

### 2. Database Optimization

```sql
-- Add proper indexes
CREATE INDEX idx_kudos_org_created ON kudos(organization_id, created_at DESC);
CREATE INDEX idx_priorities_user_completed ON priorities(user_id, completed);
CREATE INDEX idx_mood_checkins_user_date ON mood_checkins(user_id, created_at);
```

## Next Steps Priority Order

1. **TODAY**: Remove static export from next.config.ts
2. **TODAY**: Implement basic JWT authentication
3. **THIS WEEK**: Replace in-memory arrays with PostgreSQL
4. **THIS WEEK**: Add Zod validation to all API endpoints
5. **THIS WEEK**: Write at least 20 critical tests
6. **NEXT SPRINT**: Add Redis caching
7. **NEXT SPRINT**: Implement proper service layer
8. **MONTH 1**: Add monitoring and logging
9. **MONTH 1**: Create CI/CD pipeline
10. **MONTH 2**: Add GDPR compliance features

---

**⚠️ DO NOT DEPLOY TO PRODUCTION UNTIL AT LEAST ITEMS 1-5 ARE COMPLETE**
