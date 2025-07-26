'use client';

import { Heart } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const moods = [
  { value: 'amazing', emoji: '🤩', label: 'Amazing', color: 'text-green-500' },
  { value: 'great', emoji: '😄', label: 'Great', color: 'text-green-400' },
  { value: 'good', emoji: '😊', label: 'Good', color: 'text-yellow-500' },
  { value: 'okay', emoji: '😐', label: 'Okay', color: 'text-orange-500' },
  { value: 'tough', emoji: '😔', label: 'Tough', color: 'text-red-500' },
];

export default function MoodCheckIn(): React.JSX.Element {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);

  const handleMoodSelect = (moodValue: string): void => {
    setSelectedMood(moodValue);
    // Here we would normally save to database
    setTimeout(() => {
      setHasCheckedIn(true);
    }, 500);
  };

  if (hasCheckedIn) {
    return (
      <Card className="card-hover">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 fill-red-500 text-red-500" />
            Mood Check-in
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-4 text-center">
            <div className="mb-2 text-4xl">
              {moods.find((m) => m.value === selectedMood)?.emoji}
            </div>
            <p className="mb-4 text-sm text-muted-foreground">
              Thanks for sharing! We hope your day gets even better.
            </p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setHasCheckedIn(false);
                setSelectedMood(null);
              }}
            >
              Update mood
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5 fill-red-500 text-red-500" />
          How are you feeling today?
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-4 text-sm text-muted-foreground">
          Your wellbeing matters to us. How&apos;s your energy today?
        </p>

        <div className="space-y-2">
          {moods.map((mood) => (
            <button
              key={mood.value}
              onClick={() => handleMoodSelect(mood.value)}
              className={`flex w-full items-center gap-3 rounded-lg border border-border/50 p-3 transition-all duration-200 hover:border-primary/50 hover:bg-primary/5 ${
                selectedMood === mood.value ? 'border-primary bg-primary/10' : ''
              }`}
            >
              <span className="text-2xl">{mood.emoji}</span>
              <span className="font-medium">{mood.label}</span>
            </button>
          ))}
        </div>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          💝 Your mood is anonymous and helps us support the team better
        </p>
      </CardContent>
    </Card>
  );
}
