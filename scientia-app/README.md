# Scientia Capital HR Platform

A modern, warm, and human-centered HR platform built with Next.js 15, Clerk authentication, and Cloudflare D1 database.

## ✨ Features

- **Employee Wellness Dashboard** - Daily mood check-ins and wellbeing tracking
- **Smart Priorities** - Task management with urgency levels and time estimates  
- **Team Pulse** - Real-time team mood and activity insights
- **Kudos Wall** - Appreciation and recognition system with categories
- **Multi-tenant** - Organization-based access with Clerk authentication
- **Warm Design** - Human-centered UI with custom color palette

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your Clerk keys
   ```

3. **Start development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   ```
   http://localhost:3000
   ```

## 🔧 Tech Stack

- **Frontend:** Next.js 15 (App Router), React 19, TypeScript
- **UI Library:** shadcn/ui components, Tailwind CSS
- **Authentication:** Clerk (supports organizations)
- **Database:** Cloudflare D1 (SQLite edge database)
- **Deployment:** Cloudflare Pages
- **Icons:** Lucide React
- **Animations:** Framer Motion

## 🎨 Design System

The platform uses a warm, human-centered design with:

- **Warmth Colors** (`#d17344`) - Primary actions and highlights
- **Sage Green** (`#87a96b`) - Secondary actions and nature elements  
- **Trust Blue** (`#6b9bd1`) - Information and reliability
- **Community Orange** (`#d19c6b`) - Social interactions and community
- **Rounded corners** and **soft shadows** for approachable feel
- **Emotional language** focusing on human connection

## 📊 Database Schema

The platform uses Cloudflare D1 with the following core tables:

- `organizations` - Multi-tenant organization data
- `users` - User profiles with Clerk integration
- `mood_checkins` - Daily wellness tracking
- `daily_priorities` - Task management
- `kudos` - Recognition and appreciation
- `team_pulse_snapshots` - Analytics aggregation

## 🚧 Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production  
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript checking
```

### Code Quality

- **TypeScript Strict Mode** - Zero compilation errors enforced
- **ESLint** - Code quality and consistency
- **Prettier** - Code formatting (via shadcn/ui standards)

## 🏗️ Architecture

### Authentication Flow
1. User signs in via Clerk
2. Organization membership is checked/created
3. User is redirected to dashboard with org context

### Data Access Patterns
- **Multi-tenant isolation** via organization_id filtering
- **Real-time updates** using optimistic UI updates
- **Anonymized mood data** for privacy protection

### Component Structure
```
components/
├── dashboard/           # Main dashboard components
│   ├── WelcomeSection.tsx
│   ├── MoodCheckIn.tsx
│   ├── TodaysPriorities.tsx  
│   ├── TeamPulse.tsx
│   └── KudosWall.tsx
└── ui/                 # Reusable UI components (shadcn/ui)
```

## 🚀 Deployment

### Cloudflare Pages

1. **Connect repository** to Cloudflare Pages
2. **Set build command:** `npm run build`
3. **Set output directory:** `out` (for static export)
4. **Add environment variables** in Cloudflare dashboard

### Environment Variables for Production

```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
DATABASE_URL=your_d1_production_url
```

### Database Setup

1. **Create D1 database:**
   ```bash
   wrangler d1 create scientia-hr-db
   ```

2. **Run migrations:**
   ```bash
   wrangler d1 execute scientia-hr-db --file=database/schema.sql
   wrangler d1 execute scientia-hr-db --file=database/seed.sql
   ```

3. **Update wrangler.toml** with database ID

## 🔐 Security Features

- **Row-Level Security** via organization_id isolation
- **JWT token validation** with Clerk
- **HTTPS only** in production
- **Anonymous mood tracking** option
- **Activity logging** for audit trails

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes following the code quality standards
4. Run tests and type checking
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📜 License

This project is proprietary software owned by Scientia Capital.

---

Built with ❤️ for human-centered workplace wellness.