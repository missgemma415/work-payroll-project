'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Users, 
  DollarSign, 
  TrendingUp, 
  Database,
  ChevronRight,
  Home,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface ExecutiveLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const navigationItems: NavItem[] = [
  {
    href: '/',
    label: 'Dashboard',
    icon: LayoutDashboard,
    description: 'Executive overview and command center'
  },
  {
    href: '/workforce',
    label: 'Workforce Analytics',
    icon: Users,
    description: 'Employee cost analysis and forecasting'
  },
  {
    href: '/investment',
    label: 'Investment Analysis', 
    icon: DollarSign,
    description: 'Financial trends and ROI predictions'
  },
  {
    href: '/burden',
    label: 'Burden Analytics',
    icon: TrendingUp,
    description: 'Tax optimization and compliance analysis'
  },
  {
    href: '/data-sources',
    label: 'Data Sources',
    icon: Database,
    description: 'QuickBooks and Paychex integration status'
  }
];

export function ExecutiveLayout({ children, title, subtitle }: ExecutiveLayoutProps): React.JSX.Element {
  const pathname = usePathname();
  
  // Generate breadcrumbs
  const generateBreadcrumbs = () => {
    const currentItem = navigationItems.find(item => item.href === pathname);
    if (pathname === '/') {
      return [{ label: 'Dashboard', href: '/' }];
    }
    return [
      { label: 'Dashboard', href: '/' },
      { label: currentItem?.label || 'Analytics', href: pathname }
    ];
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Executive Navigation Header */}
      <header className="border-b border-slate-700/50 bg-slate-900/95 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo and Brand */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-2 h-10 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full"></div>
                <div>
                  <h1 className="text-xl font-display font-bold text-white tracking-tight">
                    Executive Payroll
                  </h1>
                  <p className="text-xs text-amber-400 font-medium">Analytics Platform</p>
                </div>
              </div>
            </div>

            {/* Navigation Menu */}
            <nav className="hidden lg:flex items-center gap-1">
              {navigationItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={`h-12 px-4 rounded-xl transition-all duration-300 ${
                        isActive 
                          ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white shadow-lg shadow-amber-500/25 hover:from-amber-400 hover:to-amber-500' 
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      <span className="font-medium">{item.label}</span>
                    </Button>
                  </Link>
                );
              })}
            </nav>

            {/* Status Indicators */}
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-3">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-xs font-semibold text-emerald-400">LIVE DATA</span>
                </div>
                <div className="text-right">
                  <p className="text-xs text-slate-400">Last Updated</p>
                  <p className="text-sm font-semibold text-white">
                    {new Date().toLocaleTimeString('en-US', { 
                      hour: '2-digit', 
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Breadcrumbs */}
          <div className="pb-4">
            <div className="flex items-center gap-2 text-sm">
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={crumb.href}>
                  {index > 0 && <ChevronRight className="h-4 w-4 text-slate-500" />}
                  <Link 
                    href={crumb.href}
                    className={`transition-colors ${
                      index === breadcrumbs.length - 1 
                        ? 'text-amber-400 font-semibold' 
                        : 'text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    {crumb.label}
                  </Link>
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Page Header */}
      {(title || subtitle) && (
        <div className="border-b border-slate-700/30 bg-slate-800/50 backdrop-blur-sm">
          <div className="container mx-auto px-4 md:px-8 py-8">
            <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
              <div className="space-y-2">
                {title && (
                  <h1 className="text-[clamp(2rem,6vw,3.5rem)] font-display font-bold text-white tracking-tight leading-tight">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className="text-[clamp(1rem,3vw,1.25rem)] text-slate-300 font-medium max-w-3xl leading-relaxed">
                    {subtitle}
                  </p>
                )}
              </div>
              
              {/* Quick Actions */}
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  Export Report
                </Button>
                <Button 
                  className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-white shadow-lg shadow-amber-500/25"
                >
                  Refresh Data
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 md:px-8 py-8 md:py-12">
        {children}
      </main>

      {/* Mobile Navigation */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50">
        <Card className="m-4 bg-slate-900/95 backdrop-blur-xl border-slate-700">
          <div className="flex items-center justify-around p-4">
            {navigationItems.slice(0, 4).map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              
              return (
                <Link key={item.href} href={item.href} className="flex-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`w-full flex-col h-auto py-3 ${
                      isActive 
                        ? 'text-amber-400 bg-amber-500/10' 
                        : 'text-slate-400 hover:text-slate-300'
                    }`}
                  >
                    <Icon className="h-5 w-5 mb-1" />
                    <span className="text-xs font-medium">{item.label.split(' ')[0]}</span>
                  </Button>
                </Link>
              );
            })}
          </div>
        </Card>
      </div>

      {/* Bottom padding for mobile navigation */}
      <div className="h-24 lg:hidden"></div>
    </div>
  );
}