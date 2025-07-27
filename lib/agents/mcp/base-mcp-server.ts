import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';

import type { z } from 'zod';

export interface McpServerConfig {
  name: string;
  version: string;
  description?: string;
}

export interface McpToolDefinition<T extends z.ZodSchema = z.ZodSchema> {
  name: string;
  title: string;
  description: string;
  inputSchema: T;
  handler: (params: z.infer<T>) => Promise<{
    content: Array<{ type: 'text'; text: string }>;
  }>;
}

export abstract class BaseMcpServer {
  protected server: McpServer;
  protected transport?: StdioServerTransport | StreamableHTTPServerTransport;

  constructor(protected config: McpServerConfig) {
    this.server = new McpServer({
      name: config.name,
      version: config.version,
    });
  }

  // Register a tool with the MCP server
  protected registerTool<T extends z.ZodSchema>(
    tool: McpToolDefinition<T>
  ): void {
    // Use the tool method for proper type handling
    this.server.tool(
      tool.name,
      tool.description,
      async (params: unknown) => {
        // Validate and parse parameters using the schema
        const validatedParams = tool.inputSchema.parse(params) as z.TypeOf<T>;
        return tool.handler(validatedParams);
      }
    );
  }

  // Register multiple tools at once
  protected registerTools(tools: McpToolDefinition<z.ZodSchema>[]): void {
    tools.forEach(tool => this.registerTool(tool));
  }

  // Connect to stdio transport (for CLI usage)
  async connectStdio(): Promise<void> {
    this.transport = new StdioServerTransport();
    await this.server.connect(this.transport);
  }

  // Connect to HTTP transport (for web usage)
  async connectHTTP(options?: {
    sessionIdGenerator?: () => string;
    onsessioninitialized?: (sessionId: string) => void;
    onclose?: () => void;
    enableDnsRebindingProtection?: boolean;
    allowedHosts?: string[];
  }): Promise<StreamableHTTPServerTransport> {
    const transport = new StreamableHTTPServerTransport({
      enableDnsRebindingProtection: options?.enableDnsRebindingProtection ?? true,
      allowedHosts: options?.allowedHosts ?? ['localhost', '127.0.0.1'],
      sessionIdGenerator: options?.sessionIdGenerator ?? (() => crypto.randomUUID()),
      onsessioninitialized: options?.onsessioninitialized ?? ((_sessionId: string) => {}),
    });

    if (options?.onclose) {
      transport.onclose = options.onclose;
    }

    this.transport = transport;
    await this.server.connect(transport);
    
    return transport;
  }

  // Abstract method to be implemented by subclasses
  abstract initialize(): Promise<void>;

  // Get the underlying MCP server instance
  getServer(): McpServer {
    return this.server;
  }

  // Disconnect and cleanup
  async disconnect(): Promise<void> {
    if (this.transport && 'close' in this.transport) {
      await this.transport.close();
    }
  }
}