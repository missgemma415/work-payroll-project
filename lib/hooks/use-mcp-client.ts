import { useState, useEffect, useCallback, useRef } from 'react';

import { McpClient } from '@/lib/agents/mcp/client';

export interface UseMcpClientOptions {
  serverUrl?: string;
  autoConnect?: boolean;
}

export interface UseMcpClientReturn {
  client: McpClient | null;
  connected: boolean;
  connecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  analyzeCosts: (params: Parameters<McpClient['analyzeCosts']>[0]) => Promise<string>;
  generateInsights: (params: Parameters<McpClient['generateInsights']>[0]) => Promise<string>;
  answerQuestion: (params: Parameters<McpClient['answerQuestion']>[0]) => Promise<string>;
}

export function useMcpClient(options: UseMcpClientOptions = {}): UseMcpClientReturn {
  const {
    serverUrl = process.env['NEXT_PUBLIC_MCP_SERVER_URL'] ?? 'http://localhost:3001/mcp',
    autoConnect = true,
  } = options;

  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const clientRef = useRef<McpClient | null>(null);

  // Initialize client
  useEffect(() => {
    clientRef.current ??= new McpClient({
      name: 'prophet-growth-web',
      version: '1.0.0',
      serverUrl,
    });
  }, [serverUrl]);

  // Connect function
  const connect = useCallback(async () => {
    if (!clientRef.current || connecting || connected) {
      return;
    }

    setConnecting(true);
    setError(null);

    try {
      await clientRef.current.connect();
      setConnected(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect');
      console.error('MCP connection error:', err);
    } finally {
      setConnecting(false);
    }
  }, [connecting, connected]);

  // Disconnect function
  const disconnect = useCallback(async () => {
    if (!clientRef.current || !connected) {
      return;
    }

    try {
      await clientRef.current.disconnect();
      setConnected(false);
    } catch (err) {
      console.error('MCP disconnect error:', err);
    }
  }, [connected]);

  // Auto-connect on mount
  useEffect(() => {
    if (autoConnect) {
      void connect();
    }

    // Cleanup on unmount
    return () => {
      if (clientRef.current && connected) {
        void clientRef.current.disconnect();
      }
    };
  }, [autoConnect]); // eslint-disable-line react-hooks/exhaustive-deps

  // Wrapped methods that ensure connection
  const analyzeCosts = useCallback(async (params: Parameters<McpClient['analyzeCosts']>[0]) => {
    if (!clientRef.current) {
      throw new Error('MCP client not initialized');
    }
    
    if (!connected) {
      await connect();
    }
    
    return clientRef.current.analyzeCosts(params);
  }, [connected, connect]);

  const generateInsights = useCallback(async (params: Parameters<McpClient['generateInsights']>[0]) => {
    if (!clientRef.current) {
      throw new Error('MCP client not initialized');
    }
    
    if (!connected) {
      await connect();
    }
    
    return clientRef.current.generateInsights(params);
  }, [connected, connect]);

  const answerQuestion = useCallback(async (params: Parameters<McpClient['answerQuestion']>[0]) => {
    if (!clientRef.current) {
      throw new Error('MCP client not initialized');
    }
    
    if (!connected) {
      await connect();
    }
    
    return clientRef.current.answerQuestion(params);
  }, [connected, connect]);

  return {
    client: clientRef.current,
    connected,
    connecting,
    error,
    connect,
    disconnect,
    analyzeCosts,
    generateInsights,
    answerQuestion,
  };
}