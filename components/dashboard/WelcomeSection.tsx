'use client';

import { Calendar, MapPin, Thermometer } from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { formatDate, getGreeting } from '@/lib/utils';

interface WelcomeSectionProps {
  user: {
    firstName?: string;
    lastName?: string;
    email?: string;
  } | null;
}

export default function WelcomeSection({ user }: WelcomeSectionProps): React.JSX.Element {
  const greeting = getGreeting();
  const today = formatDate(new Date());

  return (
    <Card className="shadow-warm-lg overflow-hidden border-0 bg-gradient-to-br from-warmth-100 via-sage-100 to-trust-100">
      <CardContent className="p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="mb-6 md:mb-0">
            <div className="mb-2 flex items-center gap-2">
              <span className="animate-bounce-gentle text-3xl">{greeting.emoji}</span>
              <h1 className="font-display text-3xl font-bold text-foreground md:text-4xl">
                {greeting.text}, {user?.firstName ?? 'there'}!
              </h1>
            </div>
            <p className="mb-4 text-lg text-muted-foreground">
              Welcome to your work home. Ready to make today amazing?
            </p>

            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {today}
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                San Francisco, CA
              </div>
              <div className="flex items-center gap-2">
                <Thermometer className="h-4 w-4" />
                72°F - Perfect day! ☀️
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="font-display text-6xl font-bold text-primary/20 md:text-8xl">
              {new Date().getDate()}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
