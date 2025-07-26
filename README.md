# Scientia Capital - HR Platform & Analytics Suite

[![Deploy to Cloudflare Pages](https://img.shields.io/badge/Deploy-Cloudflare%20Pages-orange)](https://pages.cloudflare.com/)

Enterprise-grade Human Resources platform with financial forecasting capabilities.

## 🏆 Project Overview

This repository contains the complete Scientia Capital technology stack:

- **HR Platform** - Modern employee wellness and productivity platform
- **Landing Page** - Public marketing website 
- **Analytics Engine** - Financial forecasting with Prophet algorithm

## 📁 Repository Structure

```
prophet-growth-analysis/
├── scientia-app/           # 🎯 Main HR Platform (Next.js 15)
│   ├── app/               # App Router pages & layouts
│   ├── components/        # React components (shadcn/ui)
│   ├── database/          # Cloudflare D1 schema & seed data
│   └── lib/               # Utilities & TypeScript types
├── index.html             # 🌐 Static Landing Page
└── README.md              # This file
```

## 🚀 Quick Start

### HR Platform Development

```bash
cd scientia-app
npm install
npm run dev
```

Visit: `http://localhost:3000`

### Landing Page

The `index.html` file is a standalone landing page deployed at:
- **Production**: [scientiacapital.com](https://scientiacapital.com)

## 🏗️ Tech Stack

### HR Platform (scientia-app/)
- **Frontend**: Next.js 15, React 19, TypeScript
- **UI Library**: shadcn/ui with warm design system
- **Authentication**: Clerk (multi-tenant organizations)
- **Database**: Cloudflare D1 (SQLite edge database)
- **Deployment**: Cloudflare Pages

### Features
- **Employee Dashboard** - Personalized wellness tracking
- **Mood Check-ins** - 5-emoji daily wellness system
- **Task Management** - Priority-based productivity tools
- **Team Pulse** - Real-time team mood & activity insights
- **Kudos System** - Recognition & appreciation platform

## 🎨 Design System

**Warm & Human-Centered Design:**
- **Primary**: Community Orange (`#d17344`)
- **Secondary**: Sage Green (`#87a96b`)
- **Accent**: Trust Blue (`#6b9bd1`)
- **Typography**: Rounded, approachable fonts
- **Language**: Emotional, human-focused copy

## 🔐 Security & Architecture

- **Multi-tenant** with organization-based isolation
- **Row-Level Security** via Cloudflare D1
- **JWT Authentication** with Clerk
- **Edge Computing** for global performance
- **Privacy-First** mood tracking (anonymous options)

## 📊 Database Schema

Complete multi-tenant schema with:
- Organizations & Users (Clerk integration)
- Mood check-ins & Daily priorities
- Kudos & Team pulse analytics
- Activity logs & Audit trails

## 🚀 Deployment

### HR Platform
1. Deploy to Cloudflare Pages
2. Connect Clerk authentication
3. Set up Cloudflare D1 database
4. Configure custom domain

### Landing Page
- Static HTML deployed via Cloudflare Pages
- Custom domain: scientiacapital.com

## 🤝 Development Workflow

1. **Feature Development**: Work in `scientia-app/` directory
2. **Quality Gates**: TypeScript strict mode, ESLint, tests
3. **Git Workflow**: Conventional commits with detailed messages
4. **Deployment**: Automatic via Cloudflare Pages

## 📝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Make changes in `scientia-app/` directory
4. Follow TypeScript strict mode & code quality standards
5. Commit with conventional format
6. Open Pull Request

## 📞 Support

For questions or support:
- **Website**: [scientiacapital.com](https://scientiacapital.com)
- **Platform**: [app.scientiacapital.com](https://app.scientiacapital.com)

---

**Built with ❤️ for human-centered workplace wellness**

*Enterprise-grade technology, startup heart.*