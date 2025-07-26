'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Heart, Plus, Award, Sparkles, ThumbsUp } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

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
    message: 'Amazing work on the client presentation! Your attention to detail really made the difference.',
    category: 'excellence',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    likes: 8,
    isLiked: false
  },
  {
    id: '2',
    fromName: 'David Kim',
    fromAvatar: 'DK', 
    toName: 'Elena Rodriguez',
    toAvatar: 'ER',
    message: 'Thank you for helping me with the database migration. You saved me hours of debugging!',
    category: 'helpfulness',
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
    likes: 12,
    isLiked: true
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
    isLiked: false
  }
];

const categoryConfig = {
  teamwork: { icon: '🤝', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  innovation: { icon: '💡', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  leadership: { icon: '🎯', color: 'bg-green-100 text-green-800 border-green-200' },
  helpfulness: { icon: '🤲', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  excellence: { icon: '⭐', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' }
};

export default function KudosWall() {
  const [kudos, setKudos] = useState<Kudo[]>(initialKudos);
  const [isGiving, setIsGiving] = useState(false);
  const [newKudo, setNewKudo] = useState({
    to: '',
    message: '',
    category: 'excellence' as Kudo['category']
  });

  const toggleLike = (id: string) => {
    setKudos(prev => prev.map(kudo => 
      kudo.id === id 
        ? { 
            ...kudo, 
            isLiked: !kudo.isLiked,
            likes: kudo.isLiked ? kudo.likes - 1 : kudo.likes + 1
          }
        : kudo
    ));
  };

  const submitKudo = () => {
    if (newKudo.to && newKudo.message) {
      const kudo: Kudo = {
        id: Date.now().toString(),
        fromName: 'You', // In real app, this would be current user
        fromAvatar: 'ME',
        toName: newKudo.to,
        toAvatar: newKudo.to.split(' ').map(n => n[0]).join('').toUpperCase(),
        message: newKudo.message,
        category: newKudo.category,
        timestamp: new Date(),
        likes: 0,
        isLiked: false
      };
      setKudos(prev => [kudo, ...prev]);
      setNewKudo({ to: '', message: '', category: 'excellence' });
      setIsGiving(false);
    }
  };

  return (
    <Card className="card-hover">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
            Kudos Wall
          </CardTitle>
          <Button
            size="sm"
            onClick={() => setIsGiving(true)}
            className="bg-gradient-to-r from-primary to-community-500 hover:from-primary-dark hover:to-community-600"
          >
            <Plus className="w-4 h-4 mr-1" />
            Give Kudos
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Give Kudos Form */}
        {isGiving && (
          <div className="mb-6 p-4 border border-primary/20 bg-primary/5 rounded-lg">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Give Someone Kudos
            </h4>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-1 block">To:</label>
                <input
                  type="text"
                  value={newKudo.to}
                  onChange={(e) => setNewKudo(prev => ({ ...prev, to: e.target.value }))}
                  placeholder="Team member name or 'Team'"
                  className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Category:</label>
                <select
                  value={newKudo.category}
                  onChange={(e) => setNewKudo(prev => ({ ...prev, category: e.target.value as Kudo['category'] }))}
                  className="w-full px-3 py-2 border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="excellence">Excellence</option>
                  <option value="teamwork">Teamwork</option>
                  <option value="innovation">Innovation</option>
                  <option value="leadership">Leadership</option>
                  <option value="helpfulness">Helpfulness</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1 block">Message:</label>
                <Textarea
                  value={newKudo.message}
                  onChange={(e) => setNewKudo(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="What did they do that deserves recognition?"
                  className="min-h-[80px] text-sm"
                />
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={submitKudo}
                  disabled={!newKudo.to || !newKudo.message}
                  size="sm"
                >
                  <Award className="w-4 h-4 mr-1" />
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
                className="p-4 border border-border/50 rounded-lg hover:bg-muted/20 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-community-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                    {kudo.fromAvatar}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                      <span className="font-medium text-sm">{kudo.fromName}</span>
                      <span className="text-xs text-muted-foreground">→</span>
                      <span className="font-medium text-sm">{kudo.toName}</span>
                      <Badge className={`text-xs border ${categoryInfo.color}`}>
                        {categoryInfo.icon} {kudo.category}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-foreground mb-3">{kudo.message}</p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(kudo.timestamp, { addSuffix: true })}
                      </span>
                      
                      <button
                        onClick={() => toggleLike(kudo.id)}
                        className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs transition-colors ${
                          kudo.isLiked
                            ? 'bg-red-100 text-red-600 hover:bg-red-200'
                            : 'text-muted-foreground hover:bg-muted/50'
                        }`}
                      >
                        <ThumbsUp className={`w-3 h-3 ${kudo.isLiked ? 'fill-current' : ''}`} />
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
          <div className="text-center py-8 text-muted-foreground">
            <Heart className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium mb-1">No kudos yet</p>
            <p className="text-sm">Be the first to recognize someone's great work!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}