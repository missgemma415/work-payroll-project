import { randomUUID } from 'node:crypto';

import type { Request, Response } from 'express';
import type { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { StreamableHTTPServerTransport as StreamableHTTPServerTransportImpl } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isInitializeRequest } from '@modelcontextprotocol/sdk/types.js';

import type { BaseMcpServer } from './base-mcp-server';

export interface TransportSession {
  transport: StreamableHTTPServerTransport;
  server: BaseMcpServer;
  lastActivity: Date;
}

export class McpTransportHandler {
  private sessions: Map<string, TransportSession> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor(
    private serverFactory: () => BaseMcpServer,
    private sessionTimeout = 30 * 60 * 1000 // 30 minutes default
  ) {
    // Cleanup inactive sessions periodically
    this.cleanupInterval = setInterval(() => {
      this.cleanupInactiveSessions();
    }, 5 * 60 * 1000); // Check every 5 minutes
  }

  private cleanupInactiveSessions(): void {
    const now = Date.now();
    for (const [sessionId, session] of this.sessions) {
      if (now - session.lastActivity.getTime() > this.sessionTimeout) {
        void session.transport.close();
        void session.server.disconnect();
        this.sessions.delete(sessionId);
      }
    }
  }

  async handleRequest(req: Request, res: Response): Promise<void> {
    const sessionId = req.headers['mcp-session-id'] as string | undefined;
    let session: TransportSession | undefined;

    if (sessionId && this.sessions.has(sessionId)) {
      // Reuse existing session
      session = this.sessions.get(sessionId)!;
      session.lastActivity = new Date();
    } else if (!sessionId && isInitializeRequest(req.body)) {
      // Create new session for initialization request
      const newSessionId = randomUUID();
      const server = this.serverFactory();
      
      // Initialize the server (register tools, etc.)
      await server.initialize();

      const transport = await server.connectHTTP({
        sessionIdGenerator: () => newSessionId,
        onsessioninitialized: (_sid) => {
          // MCP session initialized
        },
        onclose: () => {
          this.sessions.delete(newSessionId);
          // MCP session closed
        },
        enableDnsRebindingProtection: true,
        allowedHosts: ['localhost', '127.0.0.1'],
      });

      session = {
        transport,
        server,
        lastActivity: new Date(),
      };

      this.sessions.set(newSessionId, session);
    } else {
      // Invalid request
      res.status(400).json({
        jsonrpc: '2.0',
        error: {
          code: -32000,
          message: 'Bad Request: No valid session ID provided or not an initialization request',
        },
        id: null,
      });
      return;
    }

    // Handle the request with the appropriate transport
    await session.transport.handleRequest(req, res, req.body);
  }

  async handleSSE(req: Request, res: Response): Promise<void> {
    const sessionId = req.headers['mcp-session-id'] as string | undefined;
    
    if (!sessionId || !this.sessions.has(sessionId)) {
      res.status(400).send('Invalid or missing session ID');
      return;
    }

    const session = this.sessions.get(sessionId)!;
    session.lastActivity = new Date();
    
    await session.transport.handleRequest(req, res);
  }

  async handleDelete(req: Request, res: Response): Promise<void> {
    const sessionId = req.headers['mcp-session-id'] as string | undefined;
    
    if (!sessionId || !this.sessions.has(sessionId)) {
      res.status(400).send('Invalid or missing session ID');
      return;
    }

    const session = this.sessions.get(sessionId)!;
    await session.transport.handleRequest(req, res);
    
    // Clean up after handling the delete
    void session.transport.close();
    await session.server.disconnect();
    this.sessions.delete(sessionId);
  }

  destroy(): void {
    // Clean up all sessions
    for (const [_, session] of this.sessions) {
      void session.transport.close();
      void session.server.disconnect();
    }
    this.sessions.clear();
    
    // Clear the cleanup interval
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }

  getActiveSessions(): number {
    return this.sessions.size;
  }
}