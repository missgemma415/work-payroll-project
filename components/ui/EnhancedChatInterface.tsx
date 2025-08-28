'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { 
  Send, 
  Mic, 
  MicOff, 
  Loader2, 
  TrendingUp, 
  Users, 
  DollarSign,
  FileText,
  Database,
  Building2,
  RefreshCw,
  ChevronRight
} from 'lucide-react';
import { ForecastVisualization } from './ForecastVisualization';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    source?: 'database' | 'quickbooks' | 'paychex' | 'forecast';
    dataType?: string;
    visualData?: any;
  };
}

export interface ChatContext {
  activeMetric?: 'workforce' | 'investment' | 'burden' | 'data-sources';
  selectedEmployee?: string;
  selectedPeriod?: { start: string; end: string };
  currentView?: string;
}

interface EnhancedChatInterfaceProps {
  className?: string;
  context?: ChatContext;
  onRequestVisualization?: (data: any) => void;
  onRequestForecast?: (params: any) => void;
}

export function EnhancedChatInterface({ 
  className = '', 
  context,
  onRequestVisualization,
  onRequestForecast 
}: EnhancedChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [activeDataSource, setActiveDataSource] = useState<'all' | 'database' | 'quickbooks' | 'paychex'>('all');
  const [recognition, setRecognition] = useState<any>(null);
  const [suggestedQueries, setSuggestedQueries] = useState<string[]>([]);
  const [showVisualization, setShowVisualization] = useState(false);
  const [visualizationData, setVisualizationData] = useState<any>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Generate context-aware suggested queries
  useEffect(() => {
    if (context?.activeMetric) {
      const queries = generateSuggestedQueries(context.activeMetric);
      setSuggestedQueries(queries);
    }
  }, [context]);

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Load conversation history
  useEffect(() => {
    const saved = localStorage.getItem('enhanced-payroll-chat-history');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const messagesWithDates = parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(messagesWithDates);
      } catch (error) {
        console.error('Failed to load chat history:', error);
      }
    }

    // Add welcome message if no history
    if (!saved) {
      const welcomeMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'system',
        content: 'Welcome! I can help you analyze payroll data from your database, QuickBooks, and Paychex. I also provide forecasting and visualization capabilities. How can I assist you today?',
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, []);

  // Save conversation history
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('enhanced-payroll-chat-history', JSON.stringify(messages));
    }
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
      const speechRecognition = new SpeechRecognition();
      
      speechRecognition.continuous = false;
      speechRecognition.interimResults = false;
      speechRecognition.lang = 'en-US';
      
      speechRecognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(prev => prev + transcript);
        setIsRecording(false);
      };
      
      speechRecognition.onerror = () => {
        setIsRecording(false);
      };
      
      speechRecognition.onend = () => {
        setIsRecording(false);
      };
      
      setRecognition(speechRecognition);
    }
  }, []);

  const generateSuggestedQueries = (metric: string): string[] => {
    switch (metric) {
      case 'workforce':
        return [
          'Show me the top 5 highest paid employees',
          'What\'s the average salary across all departments?',
          'Compare this month\'s headcount to last month',
          'Pull latest employee data from QuickBooks'
        ];
      case 'investment':
        return [
          'Break down monthly costs by department',
          'What\'s our burn rate trend over the last 6 months?',
          'Forecast next quarter\'s payroll expenses',
          'Show me overtime costs from Paychex'
        ];
      case 'burden':
        return [
          'Explain the components of our burden rate',
          'How does our burden rate compare to industry average?',
          'Project burden rate changes for next year',
          'Which benefits contribute most to burden?'
        ];
      default:
        return [
          'What\'s our total monthly payroll cost?',
          'Show me workforce analytics',
          'Generate a cost forecast',
          'Sync latest data from QuickBooks'
        ];
    }
  };

  const handleSend = async (overrideMessage?: string) => {
    const messageToSend = overrideMessage || inputValue.trim();
    if (!messageToSend || isLoading) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: messageToSend,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      // Enhanced API call with context and data source preferences
      const response = await fetch('/api/chat/enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageToSend,
          context: context,
          dataSource: activeDataSource,
          conversation_history: messages.slice(-10),
          requestVisualization: messageToSend.toLowerCase().includes('show') || 
                               messageToSend.toLowerCase().includes('chart') ||
                               messageToSend.toLowerCase().includes('graph'),
          requestForecast: messageToSend.toLowerCase().includes('forecast') ||
                          messageToSend.toLowerCase().includes('predict') ||
                          messageToSend.toLowerCase().includes('project')
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Handle different response types
      if (data.visualData && onRequestVisualization) {
        onRequestVisualization(data.visualData);
      }

      if (data.forecastData) {
        // Generate mock forecast data for visualization
        const mockForecastData = [
          { month: 'Aug 2024', actual: 2341000, conservative: 2341000, moderate: 2341000, aggressive: 2341000 },
          { month: 'Sep 2024', forecast: 2423000, conservative: 2398000, moderate: 2423000, aggressive: 2448000 },
          { month: 'Oct 2024', forecast: 2512000, conservative: 2475000, moderate: 2512000, aggressive: 2567000 },
          { month: 'Nov 2024', forecast: 2598000, conservative: 2548000, moderate: 2598000, aggressive: 2678000 },
          { month: 'Dec 2024', forecast: 2687000, conservative: 2625000, moderate: 2687000, aggressive: 2795000 },
          { month: 'Jan 2025', forecast: 2782000, conservative: 2708000, moderate: 2782000, aggressive: 2918000 },
          { month: 'Feb 2025', forecast: 2883000, conservative: 2796000, moderate: 2883000, aggressive: 3047000 },
        ];
        
        setVisualizationData(mockForecastData);
        setShowVisualization(true);
        
        if (onRequestForecast) {
          onRequestForecast(data.forecastData);
        }
      }

      const assistantMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        metadata: {
          source: data.dataSource,
          dataType: data.dataType,
          visualData: data.visualData
        }
      };

      setMessages(prev => [...prev, assistantMessage]);

      // If real-time data was fetched, show a system message
      if (data.realTimeUpdate) {
        const systemMessage: ChatMessage = {
          id: crypto.randomUUID(),
          role: 'system',
          content: `✓ Real-time data fetched from ${data.dataSource}`,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, systemMessage]);
      }

    } catch (error) {
      console.error('Chat error:', error);
      
      const errorMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again or check your data connections.',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleRecording = () => {
    if (!recognition) {
      alert('Speech recognition is not supported. Please use Chrome.');
      return;
    }

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      recognition.start();
      setIsRecording(true);
    }
  };

  const handleSuggestedQuery = (query: string) => {
    handleSend(query);
  };

  const formatTimestamp = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  return (
    <Card className={`flex flex-col h-full bg-gradient-to-b from-slate-900 to-slate-950 border-slate-700 ${className}`}>
      {/* Visualization Overlay */}
      {showVisualization && visualizationData && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-10 p-6 overflow-auto">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-white">Forecast Analysis</h3>
            <Button
              onClick={() => setShowVisualization(false)}
              variant="ghost"
              size="sm"
              className="text-slate-400 hover:text-white"
            >
              ✕ Close
            </Button>
          </div>
          <ForecastVisualization data={visualizationData} />
        </div>
      )}
      {/* Enhanced Header with Data Source Selector */}
      <div className="p-4 border-b border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-white">Executive AI Assistant</h2>
            {context?.activeMetric && (
              <div className="px-3 py-1 bg-blue-500/20 rounded-full text-sm text-blue-400">
                Analyzing: {context.activeMetric}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Database className={`h-4 w-4 ${activeDataSource === 'database' ? 'text-green-400' : 'text-slate-500'}`} />
            <Building2 className={`h-4 w-4 ${activeDataSource === 'quickbooks' ? 'text-green-400' : 'text-slate-500'}`} />
            <FileText className={`h-4 w-4 ${activeDataSource === 'paychex' ? 'text-green-400' : 'text-slate-500'}`} />
          </div>
        </div>

        {/* Data Source Selector */}
        <div className="flex gap-2">
          <Button
            size="sm"
            variant={activeDataSource === 'all' ? 'default' : 'ghost'}
            onClick={() => setActiveDataSource('all')}
            className="text-xs"
          >
            All Sources
          </Button>
          <Button
            size="sm"
            variant={activeDataSource === 'database' ? 'default' : 'ghost'}
            onClick={() => setActiveDataSource('database')}
            className="text-xs"
          >
            Database
          </Button>
          <Button
            size="sm"
            variant={activeDataSource === 'quickbooks' ? 'default' : 'ghost'}
            onClick={() => setActiveDataSource('quickbooks')}
            className="text-xs"
          >
            QuickBooks
          </Button>
          <Button
            size="sm"
            variant={activeDataSource === 'paychex' ? 'default' : 'ghost'}
            onClick={() => setActiveDataSource('paychex')}
            className="text-xs"
          >
            Paychex
          </Button>
        </div>
      </div>

      {/* Suggested Queries */}
      {suggestedQueries.length > 0 && messages.length <= 1 && (
        <div className="px-4 py-3 border-b border-slate-800">
          <div className="text-xs text-slate-400 mb-2">Suggested queries:</div>
          <div className="flex flex-wrap gap-2">
            {suggestedQueries.map((query, index) => (
              <Button
                key={index}
                size="sm"
                variant="outline"
                onClick={() => handleSuggestedQuery(query)}
                className="text-xs border-slate-700 hover:bg-slate-800 hover:border-blue-500 transition-all"
              >
                <ChevronRight className="h-3 w-3 mr-1" />
                {query}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-4 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : message.role === 'system'
                  ? 'bg-slate-800 text-slate-300 text-sm'
                  : 'bg-slate-800 text-slate-100'
              }`}
            >
              {message.metadata?.source && (
                <div className="flex items-center gap-2 mb-2 text-xs opacity-75">
                  <Database className="h-3 w-3" />
                  Source: {message.metadata.source}
                </div>
              )}
              <div className="whitespace-pre-wrap">{message.content}</div>
              <div className="text-xs opacity-50 mt-2">
                {formatTimestamp(message.timestamp)}
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 rounded-lg p-4">
              <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex gap-2">
          <Textarea
            ref={textareaRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about payroll, request forecasts, or sync data..."
            className="flex-1 min-h-[50px] max-h-[150px] bg-slate-800 border-slate-600 text-white placeholder-slate-400 resize-none"
            disabled={isLoading}
          />
          
          <div className="flex flex-col gap-2">
            <Button
              onClick={toggleRecording}
              size="icon"
              variant={isRecording ? 'destructive' : 'secondary'}
              className="h-10 w-10"
              disabled={isLoading}
            >
              {isRecording ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
            
            <Button
              onClick={() => handleSend()}
              size="icon"
              className="h-10 w-10 bg-blue-600 hover:bg-blue-700"
              disabled={isLoading || !inputValue.trim()}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 mt-3">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleSend('Sync latest QuickBooks data')}
            className="text-xs text-slate-400 hover:text-white"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Sync QuickBooks
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleSend('Generate 6-month forecast')}
            className="text-xs text-slate-400 hover:text-white"
          >
            <TrendingUp className="h-3 w-3 mr-1" />
            Forecast
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleSend('Show cost breakdown')}
            className="text-xs text-slate-400 hover:text-white"
          >
            <DollarSign className="h-3 w-3 mr-1" />
            Breakdown
          </Button>
        </div>
      </div>
    </Card>
  );
}