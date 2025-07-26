'use client';

import { Users, TrendingUp, Activity, Coffee, Zap } from 'lucide-react';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TeamMoodData {
  emoji: string;
  percentage: number;
  count: number;
}

interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  status: 'online' | 'away' | 'offline';
  lastActive: string;
  mood?: 'amazing' | 'great' | 'good' | 'okay' | 'tough';
}

const moodDistribution: TeamMoodData[] = [
  { emoji: '🤩', percentage: 25, count: 5 },
  { emoji: '😄', percentage: 35, count: 7 },
  { emoji: '😊', percentage: 30, count: 6 },
  { emoji: '😐', percentage: 10, count: 2 },
  { emoji: '😔', percentage: 0, count: 0 },
];

const teamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    avatar: 'SC',
    status: 'online',
    lastActive: 'now',
    mood: 'great',
  },
  {
    id: '2',
    name: 'Marcus Johnson',
    avatar: 'MJ',
    status: 'online',
    lastActive: '5m ago',
    mood: 'amazing',
  },
  {
    id: '3',
    name: 'Elena Rodriguez',
    avatar: 'ER',
    status: 'away',
    lastActive: '1h ago',
    mood: 'good',
  },
  {
    id: '4',
    name: 'David Kim',
    avatar: 'DK',
    status: 'online',
    lastActive: '2m ago',
    mood: 'great',
  },
  {
    id: '5',
    name: 'Anna Petrova',
    avatar: 'AP',
    status: 'offline',
    lastActive: '3h ago',
    mood: 'okay',
  },
];

const getMoodEmoji = (mood?: TeamMember['mood']): string => {
  switch (mood) {
    case 'amazing':
      return '🤩';
    case 'great':
      return '😄';
    case 'good':
      return '😊';
    case 'okay':
      return '😐';
    case 'tough':
      return '😔';
    default:
      return '❓';
  }
};

const getStatusColor = (status: TeamMember['status']): string => {
  switch (status) {
    case 'online':
      return 'bg-green-500';
    case 'away':
      return 'bg-yellow-500';
    case 'offline':
      return 'bg-gray-400';
    default:
      return 'bg-gray-400';
  }
};

export default function TeamPulse(): React.JSX.Element {
  const totalMembers = teamMembers.length;
  const onlineMembers = teamMembers.filter((m) => m.status === 'online').length;
  const averageMoodScore = moodDistribution.reduce(
    (acc, mood, index) => acc + ((5 - index) * mood.percentage) / 100,
    0
  );

  return (
    <Card className="card-hover">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Team Pulse
        </CardTitle>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Activity className="h-4 w-4" />
            {onlineMembers}/{totalMembers} online
          </div>
          <div className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            {averageMoodScore.toFixed(1)}/5.0 mood
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mood Distribution */}
        <div>
          <h4 className="mb-3 flex items-center gap-2 font-medium">
            <Zap className="h-4 w-4 text-yellow-500" />
            Team Mood Today
          </h4>
          <div className="grid grid-cols-5 gap-2">
            {moodDistribution.map((mood, index) => (
              <div key={index} className="text-center">
                <div className="mb-1 text-2xl">{mood.emoji}</div>
                <div className="text-xs text-muted-foreground">{mood.percentage}%</div>
                <div className="text-xs font-medium">{mood.count}</div>
              </div>
            ))}
          </div>

          {/* Mood Progress Bar */}
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary/20">
            <div className="flex h-full">
              {moodDistribution.map((mood, index) => (
                <div
                  key={index}
                  className={`h-full ${
                    index === 0
                      ? 'bg-green-500'
                      : index === 1
                        ? 'bg-green-400'
                        : index === 2
                          ? 'bg-yellow-500'
                          : index === 3
                            ? 'bg-orange-500'
                            : 'bg-red-500'
                  }`}
                  style={{ width: `${mood.percentage}%` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Team Members */}
        <div>
          <h4 className="mb-3 flex items-center gap-2 font-medium">
            <Coffee className="h-4 w-4 text-amber-600" />
            Team Activity
          </h4>
          <div className="space-y-2">
            {teamMembers.slice(0, 5).map((member) => (
              <div
                key={member.id}
                className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-muted/20"
              >
                <div className="relative">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-community-500 text-xs font-semibold text-white">
                    {member.avatar}
                  </div>
                  <div
                    className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${getStatusColor(member.status)}`}
                  />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-medium">{member.name}</p>
                    {member.mood && <span className="text-sm">{getMoodEmoji(member.mood)}</span>}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {member.status === 'online' ? 'Active' : 'Last seen'} {member.lastActive}
                  </p>
                </div>

                <Badge
                  variant={member.status === 'online' ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  {member.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 border-t border-border/50 pt-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {Math.round(averageMoodScore * 20)}%
            </div>
            <div className="text-xs text-muted-foreground">Team Wellness</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{onlineMembers}</div>
            <div className="text-xs text-muted-foreground">Active Now</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {moodDistribution.filter((m) => m.percentage > 0).length}
            </div>
            <div className="text-xs text-muted-foreground">Mood Variety</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
