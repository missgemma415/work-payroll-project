'use client';

import { Heart } from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useMoodHistory } from '@/lib/context/app-context';
import { useMoodCheckIn } from '@/lib/hooks/use-api';
import type { MoodCheckin } from '@/lib/types/database';

const moods = [
  { value: 'amazing' as const, emoji: '🤩', label: 'Amazing', color: 'text-green-500', score: 5 },
  { value: 'great' as const, emoji: '😄', label: 'Great', color: 'text-green-400', score: 4 },
  { value: 'good' as const, emoji: '😊', label: 'Good', color: 'text-yellow-500', score: 3 },
  { value: 'okay' as const, emoji: '😐', label: 'Okay', color: 'text-orange-500', score: 2 },
  { value: 'tough' as const, emoji: '😔', label: 'Tough', color: 'text-red-500', score: 1 },
];

export default function MoodCheckIn(): React.JSX.Element {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  const { checkIn, isLoading } = useMoodCheckIn();
  const moodHistory = useMoodHistory();
  const { toast } = useToast();

  // Check if already checked in today
  useEffect(() => {
    const today = new Date().toDateString();
    const todaysMood = moodHistory.find(
      (mood) => new Date(mood.created_at).toDateString() === today
    );
    if (todaysMood) {
      setSelectedMood(todaysMood.mood_value);
      setHasCheckedIn(true);
    }
  }, [moodHistory]);

  const handleMoodSelect = async (moodValue: MoodCheckin['mood_value']): Promise<void> => {
    setSelectedMood(moodValue);
    const mood = moods.find((m) => m.value === moodValue);
    if (!mood) return;

    try {
      await checkIn({
        mood_value: moodValue,
        mood_score: mood.score,
      });
      setHasCheckedIn(true);
      toast({
        title: 'Mood recorded!',
        description: "Thanks for sharing how you're feeling today.",
      });
    } catch (error: unknown) {
      toast({
        title: 'Something went wrong',
        description: error instanceof Error ? error.message : 'Please try again later.',
      });
      setSelectedMood(null);
    }
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
              onClick={() => void handleMoodSelect(mood.value)}
              disabled={isLoading}
              className={`flex w-full items-center gap-3 rounded-lg border border-border/50 p-3 transition-all duration-200 hover:border-primary/50 hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-50 ${
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
