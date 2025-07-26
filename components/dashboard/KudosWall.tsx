'use client';

import { formatDistanceToNow } from 'date-fns';
import { Heart, Plus, Award, Sparkles, ThumbsUp } from 'lucide-react';
import React, { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';

interface Kudo {
  id: string;
  fromName: string;
  fromAvatar: string;
  toName: string;
  toAvatar: string;
  message: string;
  category: 'teamwork' | 'innovation' | 'leadership' | 'helpfulness' | 'excellence';
  timestamp: Date;
  likes: number;
  isLiked: boolean;
}

const initialKudos: Kudo[] = [
  {
    id: '1',
    fromName: 'Sarah Chen',
    fromAvatar: 'SC',
    toName: 'Marcus Johnson',
    toAvatar: 'MJ',
    message:
      'Amazing work on the client presentation! Your attention to detail really made the difference.',
    category: 'excellence',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    likes: 8,
    isLiked: false,
  },
  {
    id: '2',
    fromName: 'David Kim',
    fromAvatar: 'DK',
    toName: 'Elena Rodriguez',
    toAvatar: 'ER',
    message:
      'Thank you for helping me with the database migration. You saved me hours of debugging!',
    category: 'helpfulness',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    likes: 12,
    isLiked: true,
  },
  {
    id: '3',
    fromName: 'Anna Petrova',
    fromAvatar: 'AP',
    toName: 'Team',
    toAvatar: '👥',
    message: 'Kudos to everyone for the successful product launch! Our teamwork was incredible.',
    category: 'teamwork',
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    likes: 24,
    isLiked: false,
  },
];

const categoryConfig = {
  teamwork: { icon: '🤝', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  innovation: { icon: '💡', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  leadership: { icon: '🎯', color: 'bg-green-100 text-green-800 border-green-200' },
  helpfulness: { icon: '🤲', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  excellence: { icon: '⭐', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
};

export default function KudosWall(): React.JSX.Element {
  const [kudos, setKudos] = useState<Kudo[]>(initialKudos);
  const [isGiving, setIsGiving] = useState(false);
  const [newKudo, setNewKudo] = useState({
    to: '',
    message: '',
    category: 'excellence' as Kudo['category'],
  });

  const toggleLike = (id: string): void => {
    setKudos((prev) =>
      prev.map((kudo) =>
        kudo.id === id
          ? {
              ...kudo,
              isLiked: !kudo.isLiked,
              likes: kudo.isLiked ? kudo.likes - 1 : kudo.likes + 1,
            }
          : kudo
      )
    );
  };

  const submitKudo = (): void => {
    if (newKudo.to && newKudo.message) {
      const kudo: Kudo = {
        id: Date.now().toString(),
        fromName: 'You', // In real app, this would be current user
        fromAvatar: 'ME',
        toName: newKudo.to,
        toAvatar: newKudo.to
          .split(' ')
          .map((n) => n[0])
          .join('')
          .toUpperCase(),
        message: newKudo.message,
        category: newKudo.category,
        timestamp: new Date(),
        likes: 0,
        isLiked: false,
      };
      setKudos((prev) => [kudo, ...prev]);
      setNewKudo({ to: '', message: '', category: 'excellence' });
      setIsGiving(false);
    }
  };

  return (
    <Card className="card-hover">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 fill-red-500 text-red-500" />
            Kudos Wall
          </CardTitle>
          <Button
            size="sm"
            onClick={() => setIsGiving(true)}
            className="hover:from-primary-dark bg-gradient-to-r from-primary to-community-500 hover:to-community-600"
          >
            <Plus className="mr-1 h-4 w-4" />
            Give Kudos
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Give Kudos Form */}
        {isGiving && (
          <div className="mb-6 rounded-lg border border-primary/20 bg-primary/5 p-4">
            <h4 className="mb-3 flex items-center gap-2 font-medium">
              <Sparkles className="h-4 w-4 text-primary" />
              Give Someone Kudos
            </h4>

            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium">To:</label>
                <input
                  type="text"
                  value={newKudo.to}
                  onChange={(e) => setNewKudo((prev) => ({ ...prev, to: e.target.value }))}
                  placeholder="Team member name or 'Team'"
                  className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Category:</label>
                <select
                  value={newKudo.category}
                  onChange={(e) =>
                    setNewKudo((prev) => ({
                      ...prev,
                      category: e.target.value as Kudo['category'],
                    }))
                  }
                  className="w-full rounded-md border border-border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="excellence">Excellence</option>
                  <option value="teamwork">Teamwork</option>
                  <option value="innovation">Innovation</option>
                  <option value="leadership">Leadership</option>
                  <option value="helpfulness">Helpfulness</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">Message:</label>
                <Textarea
                  value={newKudo.message}
                  onChange={(e) => setNewKudo((prev) => ({ ...prev, message: e.target.value }))}
                  placeholder="What did they do that deserves recognition?"
                  className="min-h-[80px] text-sm"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={submitKudo} disabled={!newKudo.to || !newKudo.message} size="sm">
                  <Award className="mr-1 h-4 w-4" />
                  Send Kudos
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsGiving(false);
                    setNewKudo({ to: '', message: '', category: 'excellence' });
                  }}
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Kudos Feed */}
        <div className="space-y-4">
          {kudos.map((kudo) => {
            const categoryInfo = categoryConfig[kudo.category];

            return (
              <div
                key={kudo.id}
                className="rounded-lg border border-border/50 p-4 transition-colors hover:bg-muted/20"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-community-500 text-xs font-semibold text-white">
                    {kudo.fromAvatar}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium">{kudo.fromName}</span>
                      <span className="text-xs text-muted-foreground">→</span>
                      <span className="text-sm font-medium">{kudo.toName}</span>
                      <Badge className={`border text-xs ${categoryInfo.color}`}>
                        {categoryInfo.icon} {kudo.category}
                      </Badge>
                    </div>

                    <p className="mb-3 text-sm text-foreground">{kudo.message}</p>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(kudo.timestamp, { addSuffix: true })}
                      </span>

                      <button
                        onClick={() => toggleLike(kudo.id)}
                        className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs transition-colors ${
                          kudo.isLiked
                            ? 'bg-red-100 text-red-600 hover:bg-red-200'
                            : 'text-muted-foreground hover:bg-muted/50'
                        }`}
                      >
                        <ThumbsUp className={`h-3 w-3 ${kudo.isLiked ? 'fill-current' : ''}`} />
                        {kudo.likes}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {kudos.length === 0 && (
          <div className="py-8 text-center text-muted-foreground">
            <Heart className="mx-auto mb-3 h-12 w-12 opacity-50" />
            <p className="mb-1 font-medium">No kudos yet</p>
            <p className="text-sm">Be the first to recognize someone&apos;s great work!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
