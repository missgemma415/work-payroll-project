import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

import type { Transport } from '@modelcontextprotocol/sdk/shared/transport.js';
import type { Tool } from '@modelcontextprotocol/sdk/types.js';

export interface McpClientConfig {
  name: string;
  version: string;
  serverUrl: string;
}

export class McpClient {
  private client: Client;
  private transport?: StreamableHTTPClientTransport;
  private connected = false;

  constructor(private config: McpClientConfig) {
    this.client = new Client({
      name: config.name,
      version: config.version,
    });
  }

  async connect(): Promise<void> {
    if (this.connected) {
      return;
    }

    try {
      const serverUrl = new URL(this.config.serverUrl);
      this.transport = new StreamableHTTPClientTransport(serverUrl);
      
      await this.client.connect(this.transport as Transport);
      this.connected = true;
      
      // Successfully connected to MCP server
    } catch (_error) {
      // Failed to connect to MCP server
      throw new Error('Failed to connect to MCP server');
    }
  }

  async disconnect(): Promise<void> {
    if (!this.connected || !this.transport) {
      return;
    }

    try {
      await this.transport.close();
      this.connected = false;
      // Successfully disconnected from MCP server
    } catch (_error) {
      // Error disconnecting from MCP server
    }
  }

  async listTools(): Promise<Tool[]> {
    if (!this.connected) {
      throw new Error('Not connected to MCP server');
    }

    try {
      const response = await this.client.listTools();
      return response.tools ?? [];
    } catch (_error) {
      // Error listing tools
      throw new Error('Failed to list tools');
    }
  }

  async callTool(name: string, args: Record<string, unknown>): Promise<{
    content?: Array<{ type: string; text?: string; [key: string]: unknown }>;
    [key: string]: unknown;
  }> {
    if (!this.connected) {
      throw new Error('Not connected to MCP server');
    }

    try {
      const result = await this.client.callTool({
        name,
        arguments: args,
      });
      return result;
    } catch (_error) {
      // Error calling tool
      throw new Error(`Failed to call tool: ${name}`);
    }
  }

  async analyzeCosts(params: {
    employees: Array<{
      id: string;
      name: string;
      department: string;
      baseSalary: number;
      benefits?: {
        health: number;
        retirement: number;
        other: number;
      };
    }>;
    timeframe: 'monthly' | 'quarterly' | 'annual';
    includeForecasts?: boolean;
  }): Promise<string> {
    const result = await this.callTool('analyze_costs', params);
    
    if (result.content?.[0]?.type === 'text' && result.content[0].text) {
      return result.content[0].text;
    }
    
    return 'No response from analysis';
  }

  async generateInsights(params: {
    department?: string;
    metric: 'cost' | 'efficiency' | 'growth' | 'optimization';
    depth?: 'summary' | 'detailed' | 'comprehensive';
  }): Promise<string> {
    const result = await this.callTool('generate_insights', params);
    
    if (result.content?.[0]?.type === 'text' && result.content[0].text) {
      return result.content[0].text;
    }
    
    return 'No insights generated';
  }

  async answerQuestion(params: {
    question: string;
    context?: Record<string, unknown>;
  }): Promise<string> {
    const result = await this.callTool('answer_questions', params);
    
    if (result.content?.[0]?.type === 'text' && result.content[0].text) {
      return result.content[0].text;
    }
    
    return 'No answer provided';
  }

  isConnected(): boolean {
    return this.connected;
  }
}