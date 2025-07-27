import cors from 'cors';
import express from 'express';

import { FinancialBrainServer } from './financial-brain-server';
import { McpTransportHandler } from './transport-handler';

export function createMcpServer(): express.Application {
  const app = express();
  
  // Middleware
  app.use(express.json());
  app.use(cors({
    origin: '*', // Configure appropriately for production
    exposedHeaders: ['Mcp-Session-Id'],
    allowedHeaders: ['Content-Type', 'mcp-session-id', 'Authorization'],
  }));

  // Create transport handler with Financial Brain Server factory
  const transportHandler = new McpTransportHandler(() => new FinancialBrainServer());

  // Health check endpoint
  app.get('/health', (_req, res) => {
    res.json({
      status: 'ok',
      activeSessions: transportHandler.getActiveSessions(),
      timestamp: new Date().toISOString(),
    });
  });

  // Main MCP endpoint for client-to-server communication
  app.post('/mcp', async (req, res) => {
    try {
      await transportHandler.handleRequest(req, res);
    } catch (error) {
      console.error('MCP request error:', error);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: '2.0',
          error: {
            code: -32603,
            message: 'Internal server error',
          },
          id: null,
        });
      }
    }
  });

  // SSE endpoint for server-to-client notifications
  app.get('/mcp', async (req, res) => {
    try {
      await transportHandler.handleSSE(req, res);
    } catch (error) {
      console.error('MCP SSE error:', error);
      if (!res.headersSent) {
        res.status(500).send('Internal server error');
      }
    }
  });

  // Session termination endpoint
  app.delete('/mcp', async (req, res) => {
    try {
      await transportHandler.handleDelete(req, res);
    } catch (error) {
      console.error('MCP delete error:', error);
      if (!res.headersSent) {
        res.status(500).send('Internal server error');
      }
    }
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    // SIGTERM received, shutting down gracefully
    transportHandler.destroy();
    process.exit(0);
  });

  return app;
}

// Start server if running directly
if (require.main === module) {
  const PORT = process.env['MCP_SERVER_PORT'] ?? 3001;
  const server = createMcpServer();
  
  server.listen(PORT, () => {
    // MCP Financial Brain Server running on specified port
    // Health check endpoint available
    // MCP endpoint ready for connections
  });
}