'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart } from 'lucide-react';

const moods = [
  { value: 'amazing', emoji: '🤩', label: 'Amazing', color: 'text-green-500' },
  { value: 'great', emoji: '😄', label: 'Great', color: 'text-green-400' },
  { value: 'good', emoji: '😊', label: 'Good', color: 'text-yellow-500' },
  { value: 'okay', emoji: '😐', label: 'Okay', color: 'text-orange-500' },
  { value: 'tough', emoji: '😔', label: 'Tough', color: 'text-red-500' },
];

export default function MoodCheckIn() {
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [hasCheckedIn, setHasCheckedIn] = useState(false);

  const handleMoodSelect = (moodValue: string) => {
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
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            Mood Check-in
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">
            <div className="text-4xl mb-2">
              {moods.find(m => m.value === selectedMood)?.emoji}
            </div>
            <p className="text-sm text-muted-foreground mb-4">
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
          <Heart className="w-5 h-5 text-red-500 fill-red-500" />
          How are you feeling today?
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Your wellbeing matters to us. How's your energy today?
        </p>
        
        <div className="space-y-2">
          {moods.map((mood) => (
            <button
              key={mood.value}
              onClick={() => handleMoodSelect(mood.value)}
              className={`w-full flex items-center gap-3 p-3 rounded-lg border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 ${
                selectedMood === mood.value ? 'border-primary bg-primary/10' : ''
              }`}
            >
              <span className="text-2xl">{mood.emoji}</span>
              <span className="font-medium">{mood.label}</span>
            </button>
          ))}
        </div>
        
        <p className="text-xs text-muted-foreground mt-4 text-center">
          💝 Your mood is anonymous and helps us support the team better
        </p>
      </CardContent>
    </Card>
  );
}