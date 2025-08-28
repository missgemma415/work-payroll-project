'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, X, Minimize2 } from 'lucide-react';
import { ChatInterface } from './ChatInterface';

interface FloatingChatButtonProps {
  className?: string;
}

export function FloatingChatButton({ className = '' }: FloatingChatButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);

  // Check for unread messages on mount
  useEffect(() => {
    const checkUnreadMessages = () => {
      try {
        const lastRead = localStorage.getItem('payroll-chat-last-read');
        const chatHistory = localStorage.getItem('payroll-chat-history');
        
        if (chatHistory && lastRead) {
          const messages = JSON.parse(chatHistory);
          const lastReadTime = new Date(lastRead);
          const unreadMessages = messages.filter((msg: { timestamp: string; role: string }) => 
            new Date(msg.timestamp) > lastReadTime && msg.role === 'assistant'
          );
          setUnreadCount(unreadMessages.length);
        }
      } catch (error) {
        console.error('Error checking unread messages:', error);
      }
    };

    checkUnreadMessages();
    // Check periodically for new messages
    const interval = setInterval(checkUnreadMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleChat = () => {
    // If chat is minimized, expand it instead of closing
    if (isOpen && isMinimized) {
      setIsMinimized(false);
      return;
    }
    
    setIsOpen(!isOpen);
    setIsMinimized(false); // Reset minimize state when toggling
    if (!isOpen) {
      // Mark messages as read when opening chat
      localStorage.setItem('payroll-chat-last-read', new Date().toISOString());
      setUnreadCount(0);
    }
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };
  
  const handleClose = () => {
    setIsOpen(false);
    setIsMinimized(false);
  };

  return (
    <>
      {/* Floating Action Button */}
      <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
        <Button
          onClick={handleToggleChat}
          size="lg"
          className="group relative h-16 w-16 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 border-2 border-blue-500/20"
          title="AI Assistant"
        >
          <MessageCircle className="h-8 w-8 text-white transition-transform duration-300 group-hover:scale-110" />
          
          {/* Unread Message Badge */}
          {unreadCount > 0 && (
            <div className="absolute -top-2 -right-2 h-6 w-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
              {unreadCount > 9 ? '9+' : unreadCount}
            </div>
          )}
          
          {/* Pulse Animation */}
          <div className="absolute inset-0 rounded-full bg-blue-400 animate-ping opacity-20"></div>
        </Button>
      </div>

      {/* Chat Modal Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 flex items-end justify-end p-4 md:p-6">
          {/* Background Overlay */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={handleToggleChat}
          />
          
          {/* Chat Container */}
          <div className={`relative bg-slate-900 rounded-2xl shadow-2xl border border-slate-700 transition-all duration-300 transform ${
            isMinimized 
              ? 'w-80 h-16 cursor-pointer' 
              : 'w-full max-w-2xl h-[70vh] md:h-[600px]'
          }`}
          onClick={isMinimized ? () => setIsMinimized(false) : undefined}>
            
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <h2 className="text-lg font-semibold text-white">AI Assistant</h2>
                {!isMinimized && (
                  <div className="text-sm text-slate-400">Executive Payroll Intelligence</div>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMinimize();
                  }}
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 text-slate-400 hover:text-white"
                  title={isMinimized ? 'Expand' : 'Minimize'}
                >
                  <Minimize2 className="h-4 w-4" />
                </Button>
                
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClose();
                  }}
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 text-slate-400 hover:text-white"
                  title="Close"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Chat Interface */}
            {!isMinimized && (
              <div className="h-full">
                <ChatInterface className="h-full border-none rounded-none bg-transparent" />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}