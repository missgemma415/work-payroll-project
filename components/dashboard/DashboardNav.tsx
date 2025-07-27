'use client';

import { Bell, Heart, Home, Users, Calendar, Settings, User, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Analytics', href: '/analytics', icon: TrendingUp },
  { name: 'Team', href: '/team', icon: Users },
  { name: 'Mood', href: '/mood', icon: Heart },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function DashboardNav(): React.JSX.Element {
  const pathname = usePathname();

  return (
    <nav className="shadow-warm-sm sticky top-0 z-50 bg-white/80 backdrop-blur-md">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-community-500 font-bold text-white">
              S
            </div>
            <span className="hidden font-display text-xl font-semibold sm:block">
              Scientia Capital
            </span>
          </Link>

          {/* Navigation */}
          <div className="hidden items-center space-x-8 md:flex">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-primary/5 hover:text-primary'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            <button className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-primary/5 hover:text-primary">
              <Bell className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="hidden text-right sm:block">
                <p className="text-sm font-medium">Demo User</p>
                <p className="text-xs text-muted-foreground">Scientia Capital</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-primary to-community-500 text-white">
                <User className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile navigation */}
      <div className="border-t border-border/50 bg-white/90 md:hidden">
        <div className="flex justify-around py-2">
          {navigation.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-colors',
                  isActive ? 'text-primary' : 'text-muted-foreground hover:text-primary'
                )}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
