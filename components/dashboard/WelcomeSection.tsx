'use client';

import { Card, CardContent } from '@/components/ui/card';
import { formatDate, getGreeting } from '@/lib/utils';
import { Calendar, MapPin, Thermometer } from 'lucide-react';

interface WelcomeSectionProps {
  user: {
    firstName?: string;
    lastName?: string;
    email?: string;
  } | null;
}

export default function WelcomeSection({ user }: WelcomeSectionProps) {
  const greeting = getGreeting();
  const today = formatDate(new Date());
  
  return (
    <Card className="overflow-hidden bg-gradient-to-br from-warmth-100 via-sage-100 to-trust-100 border-0 shadow-warm-lg">
      <CardContent className="p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-6 md:mb-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-3xl animate-bounce-gentle">{greeting.emoji}</span>
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                {greeting.text}, {user?.firstName || 'there'}!
              </h1>
            </div>
            <p className="text-lg text-muted-foreground mb-4">
              Welcome to your work home. Ready to make today amazing?
            </p>
            
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {today}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                San Francisco, CA
              </div>
              <div className="flex items-center gap-2">
                <Thermometer className="w-4 h-4" />
                72°F - Perfect day! ☀️
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-6xl md:text-8xl font-bold text-primary/20 font-display">
              {new Date().getDate()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}