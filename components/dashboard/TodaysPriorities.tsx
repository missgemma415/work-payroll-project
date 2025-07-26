'use client';

import { Target, Plus, Clock, Zap } from 'lucide-react';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

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
    urgency: 'high',
  },
  {
    id: '2',
    text: 'Prepare for 2pm client meeting',
    completed: false,
    timeEstimate: '30 min',
    urgency: 'high',
  },
  {
    id: '3',
    text: 'Update employee handbook section 4',
    completed: true,
    timeEstimate: '1 hour',
    urgency: 'medium',
  },
];

export default function TodaysPriorities(): React.JSX.Element {
  const [priorities, setPriorities] = useState<Priority[]>(initialPriorities);
  const [newPriorityText, setNewPriorityText] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const togglePriority = (id: string): void => {
    setPriorities((prev) =>
      prev.map((priority) =>
        priority.id === id ? { ...priority, completed: !priority.completed } : priority
      )
    );
  };

  const addPriority = (): void => {
    if (newPriorityText.trim()) {
      const newPriority: Priority = {
        id: Date.now().toString(),
        text: newPriorityText,
        completed: false,
        urgency: 'medium',
      };
      setPriorities((prev) => [...prev, newPriority]);
      setNewPriorityText('');
      setIsAdding(false);
    }
  };

  const getUrgencyColor = (urgency: Priority['urgency']): string => {
    switch (urgency) {
      case 'high':
        return 'text-red-500';
      case 'medium':
        return 'text-yellow-500';
      case 'low':
        return 'text-green-500';
      default:
        return 'text-gray-500';
    }
  };

  const completedCount = priorities.filter((p) => p.completed).length;
  const totalCount = priorities.length;

  return (
    <Card className="card-hover">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Today&apos;s Priorities
          </CardTitle>
          <div className="text-sm text-muted-foreground">
            {completedCount}/{totalCount} complete
          </div>
        </div>
        <div className="h-2 w-full rounded-full bg-secondary/20">
          <div
            className="h-2 rounded-full bg-primary transition-all duration-300"
            style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {priorities.map((priority) => (
            <div
              key={priority.id}
              className={`flex items-center gap-3 rounded-lg border border-border/50 p-3 transition-all duration-200 ${
                priority.completed ? 'bg-muted/30 opacity-60' : 'hover:bg-muted/20'
              }`}
            >
              <Checkbox
                checked={priority.completed}
                onCheckedChange={() => togglePriority(priority.id)}
                className="data-[state=checked]:border-primary data-[state=checked]:bg-primary"
              />

              <div className="min-w-0 flex-1">
                <p
                  className={`font-medium ${
                    priority.completed ? 'text-muted-foreground line-through' : 'text-foreground'
                  }`}
                >
                  {priority.text}
                </p>
                {priority.timeEstimate && (
                  <div className="mt-1 flex items-center gap-4">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {priority.timeEstimate}
                    </span>
                    <span
                      className={`flex items-center gap-1 text-xs ${getUrgencyColor(priority.urgency)}`}
                    >
                      <Zap className="h-3 w-3" />
                      {priority.urgency} priority
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isAdding ? (
            <div className="flex items-center gap-2 rounded-lg border border-dashed border-primary/50 p-3">
              <Input
                value={newPriorityText}
                onChange={(e) => setNewPriorityText(e.target.value)}
                placeholder="What needs to get done today?"
                className="border-0 bg-transparent text-sm focus-visible:ring-0"
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
              className="w-full border-2 border-dashed border-border/50 text-muted-foreground hover:border-primary/50 hover:bg-primary/5 hover:text-primary"
            >
              <Plus className="mr-2 h-4 w-4" />
              Add priority
            </Button>
          )}
        </div>

        {completedCount > 0 && (
          <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-3">
            <p className="text-sm font-medium text-green-700">
              🎉 Great work! You&apos;ve completed {completedCount} task
              {completedCount > 1 ? 's' : ''} today.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
