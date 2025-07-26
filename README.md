# Scientia Capital HR Platform

[![Deploy to Cloudflare Pages](https://img.shields.io/badge/Deploy-Cloudflare%20Pages-orange)](https://pages.cloudflare.com/)

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
```

## 🚀 Deployment to Cloudflare Pages

### Build Settings

- **Framework preset:** Next.js (Static HTML Export)
- **Build command:** `npm run build`
- **Build output directory:** `out`

### Environment Variables

Add these in Cloudflare Pages dashboard:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`

## 📜 License

This project is proprietary software owned by Scientia Capital.

---

Built with ❤️ for human-centered workplace wellness.
