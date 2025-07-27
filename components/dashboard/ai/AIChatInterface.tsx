'use client';

import { Bot, Loader2, Send, User } from 'lucide-react';
import React, { useState, useRef, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { aiClient } from '@/lib/api/ai-client';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isLoading?: boolean;
}

// Demo responses for static export
function getDemoResponse(query: string): string {
  const lowerQuery = query.toLowerCase();

  if (lowerQuery.includes('120k') || lowerQuery.includes('engineer')) {
    return `Based on a $120,000 annual salary for an engineer:

**Total Cost Breakdown:**
- Base Salary: $120,000/year ($10,000/month)
- Benefits: ~$2,400/month (health, dental, 401k, PTO)
- Overhead: ~$2,100/month (taxes, office, equipment)
- **Total Monthly Cost: $14,500**
- **Total Annual Cost: $174,000**

This represents a **1.45x multiplier** on the base salary, which is typical for tech companies.`;
  }

  if (lowerQuery.includes('multiplier') || lowerQuery.includes('benefits')) {
    return `The typical benefits multiplier ranges from **1.25x to 1.7x** of base salary:

- **1.25-1.35x**: Basic benefits package
- **1.35-1.50x**: Standard tech company benefits
- **1.50-1.70x**: Premium benefits with equity

Factors affecting the multiplier:
- Health insurance quality
- 401k matching percentage
- PTO and parental leave
- Office location and real estate costs
- Professional development budget`;
  }

  if (lowerQuery.includes('optimize') || lowerQuery.includes('cost')) {
    return `Here are key strategies to optimize employee costs:

1. **Remote Work**: Save $500-1,500/month per employee on office space
2. **Benefits Optimization**: Negotiate better group rates, saving 10-15%
3. **Utilization Tracking**: Improve productivity by 5-10%
4. **Retention Programs**: Reduce turnover costs (~150% of annual salary)
5. **Skill Development**: Increase internal promotions, reducing hiring costs

Would you like me to analyze any specific area in more detail?`;
  }

  return `I can help you analyze employee costs and workforce optimization. Try asking me:

- "Calculate the total cost of a $120k engineer"
- "What's the typical benefits multiplier?"
- "How can we optimize our employee costs?"

Note: This is a demo version. In production, I'll have access to your actual employee data for more accurate analysis.`;
}

export default function AIChatInterface(): React.JSX.Element {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        "Hello! I'm your AI Financial Analyst. I can help you analyze employee costs, calculate total compensation, and provide insights on workforce optimization. What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Add loading message
    const loadingMessage: Message = {
      id: `${Date.now()}-loading`,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isLoading: true,
    };
    setMessages((prev) => [...prev, loadingMessage]);

    try {
      // Try to use the real API first
      const data = await aiClient.chat(userMessage.content).catch(() => {
        // Fallback to demo response if API fails
        return {
          response: getDemoResponse(userMessage.content),
          metadata: { model: 'demo', timestamp: new Date().toISOString() },
        };
      });

      // Remove loading message and add response
      setMessages((prev) => {
        const filtered = prev.filter((msg) => !msg.isLoading);
        return [
          ...filtered,
          {
            id: Date.now().toString(),
            role: 'assistant',
            content: data.response,
            timestamp: new Date(),
          },
        ];
      });
    } catch (error) {
      console.error('Chat error:', error);
      // Remove loading message and add error
      setMessages((prev) => {
        const filtered = prev.filter((msg) => !msg.isLoading);
        return [
          ...filtered,
          {
            id: Date.now().toString(),
            role: 'assistant',
            content:
              'I apologize, but I encountered an error processing your request. Please try again.',
            timestamp: new Date(),
          },
        ];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedQuestions = [
    'Calculate the total cost of a $120k engineer',
    "What's the typical benefits multiplier?",
    'How can we optimize our employee costs?',
  ];

  return (
    <Card className="flex h-[600px] flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-primary" />
          AI Financial Analyst
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col p-0">
        {/* Messages */}
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${
                  message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}
              >
                {message.role === 'user' ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
              </div>
              <div className={`flex-1 ${message.role === 'user' ? 'text-right' : ''}`}>
                <div
                  className={`inline-block rounded-lg p-3 ${
                    message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  } ${message.isLoading ? 'min-w-[60px]' : ''}`}
                >
                  {message.isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <p className="whitespace-pre-wrap text-sm">{message.content}</p>
                  )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested questions */}
        {messages.length === 1 && (
          <div className="px-4 pb-2">
            <p className="mb-2 text-sm text-muted-foreground">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={(): void => setInput(question)}
                  className="text-xs"
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleSubmit(e);
          }}
          className="border-t p-4"
        >
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about employee costs, benefits, or workforce optimization..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !input.trim()}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
