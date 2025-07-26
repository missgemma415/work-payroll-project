'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Target, Plus, Clock, Zap } from 'lucide-react';

interface Priority {
  id: string;
  text: string;
  completed: boolean;
  timeEstimate?: string;
  urgency: 'low' | 'medium' | 'high';
}

const initialPriorities: Priority[] = [
  {
    id: '1',
    text: 'Review Q1 team performance reports',
    completed: false,
    timeEstimate: '45 min',
    urgency: 'high'
  },
  {
    id: '2', 
    text: 'Prepare for 2pm client meeting',
    completed: false,
    timeEstimate: '30 min',
    urgency: 'high'
  },
  {
    id: '3',
    text: 'Update employee handbook section 4',
    completed: true,
    timeEstimate: '1 hour',
    urgency: 'medium'
  }
];

export default function TodaysPriorities() {
  const [priorities, setPriorities] = useState<Priority[]>(initialPriorities);
  const [newPriorityText, setNewPriorityText] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const togglePriority = (id: string) => {
    setPriorities(prev => 
      prev.map(priority => 
        priority.id === id 
          ? { ...priority, completed: !priority.completed }
          : priority
      )
    );
  };

  const addPriority = () => {
    if (newPriorityText.trim()) {
      const newPriority: Priority = {
        id: Date.now().toString(),
        text: newPriorityText,
        completed: false,
        urgency: 'medium'
      };
      setPriorities(prev => [...prev, newPriority]);
      setNewPriorityText('');
      setIsAdding(false);
    }
  };

  const getUrgencyColor = (urgency: Priority['urgency']) => {
    switch (urgency) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };

  const completedCount = priorities.filter(p => p.completed).length;
  const totalCount = priorities.length;

  return (
    <Card className="card-hover">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Today's Priorities
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            {completedCount}/{totalCount} complete
          </div>
        </div>
        <div className="w-full bg-secondary/20 rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {priorities.map((priority) => (
            <div
              key={priority.id}
              className={`flex items-center gap-3 p-3 rounded-lg border border-border/50 transition-all duration-200 ${
                priority.completed ? 'bg-muted/30 opacity-60' : 'hover:bg-muted/20'
              }`}
            >
              <Checkbox
                checked={priority.completed}
                onCheckedChange={() => togglePriority(priority.id)}
                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
              />
              
              <div className="flex-1 min-w-0">
                <p className={`font-medium ${
                  priority.completed ? 'line-through text-muted-foreground' : 'text-foreground'
                }`}>
                  {priority.text}
                </p>
                {priority.timeEstimate && (
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {priority.timeEstimate}
                    </span>
                    <span className={`text-xs flex items-center gap-1 ${getUrgencyColor(priority.urgency)}`}>
                      <Zap className="w-3 h-3" />
                      {priority.urgency} priority
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {isAdding ? (
            <div className="flex items-center gap-2 p-3 border border-dashed border-primary/50 rounded-lg">
              <Input
                value={newPriorityText}
                onChange={(e) => setNewPriorityText(e.target.value)}
                placeholder="What needs to get done today?"
                className="border-0 bg-transparent focus-visible:ring-0 text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') addPriority();
                  if (e.key === 'Escape') {
                    setIsAdding(false);
                    setNewPriorityText('');
                  }
                }}
                autoFocus
              />
              <Button size="sm" onClick={addPriority} disabled={!newPriorityText.trim()}>
                Add
              </Button>
            </div>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAdding(true)}
              className="w-full border-2 border-dashed border-border/50 hover:border-primary/50 hover:bg-primary/5 text-muted-foreground hover:text-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add priority
            </Button>
          )}
        </div>

        {completedCount > 0 && (
          <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-700 font-medium">
              🎉 Great work! You've completed {completedCount} task{completedCount > 1 ? 's' : ''} today.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}