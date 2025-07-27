import { Agent } from 'agents';
import type { 
  Tool,
  Resource,
  CallToolResult
} from '@modelcontextprotocol/sdk/types.js';
import { 
  ListToolsRequestSchema, 
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema
} from '@modelcontextprotocol/sdk/types.js';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { z } from 'zod';

export interface McpToolDefinition<T extends z.ZodSchema = z.ZodSchema> {
  name: string;
  description: string;
  inputSchema: T;
  handler: (params: z.infer<T>) => Promise<CallToolResult>;
}

export interface McpResourceDefinition {
  name: string;
  uri: string;
  handler: (uri: string) => Promise<{
    contents: Array<{
      uri: string;
      mimeType: string;
      text: string;
    }>;
  }>;
}

/**
 * Base class for MCP-enabled Cloudflare Agents
 * Extends the Cloudflare Agent class with MCP server capabilities
 */
export abstract class McpAgent<Env = Record<string, unknown>> extends Agent<Env> {
  /**
   * MCP Server instance for handling Model Context Protocol
   * Must be initialized by subclasses
   */
  abstract server: Server;

  /**
   * Storage for registered tools
   */
  protected tools: Map<string, McpToolDefinition> = new Map();

  /**
   * Storage for registered resources
   */
  protected resources: Map<string, McpResourceDefinition> = new Map();

  /**
   * Initialize the agent with MCP capabilities
   * Subclasses should override this to register their tools and resources
   */
  abstract init(): Promise<void>;

  /**
   * Called when the agent is initialized
   * Sets up MCP request handlers
   */
  override async onStart() {
    // Initialize the agent's tools and resources
    await this.init();

    // Set up MCP request handlers
    this.setupMcpHandlers();
  }

  /**
   * Set up the standard MCP request handlers
   */
  protected setupMcpHandlers(): void {
    // Handle tool listing requests
    this.server.setRequestHandler(ListToolsRequestSchema, () => {
      const tools: Tool[] = Array.from(this.tools.values()).map(tool => ({
        name: tool.name,
        description: tool.description,
        inputSchema: this.zodToJsonSchema(tool.inputSchema as z.ZodSchema),
      }));

      return { tools };
    });

    // Handle tool execution requests
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      const tool = this.tools.get(name);

      if (!tool) {
        throw new Error(`Tool not found: ${name}`);
      }

      try {
        // Validate and execute the tool
        const validatedArgs = tool.inputSchema.parse(args) as z.infer<typeof tool.inputSchema>;
        const result = await tool.handler(validatedArgs);
        return result;
      } catch (_error) {
        if (_error instanceof z.ZodError) {
          throw new Error(`Invalid arguments for tool ${name}: ${_error.message}`);
        }
        throw _error;
      }
    });

    // Handle resource listing requests
    this.server.setRequestHandler(ListResourcesRequestSchema, () => {
      const resources: Resource[] = Array.from(this.resources.values()).map(resource => ({
        uri: resource.uri,
        name: resource.name,
        mimeType: 'application/json',
      }));

      return { resources };
    });

    // Handle resource reading requests
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const { uri } = request.params;
      
      // Find resource by URI
      const resource = Array.from(this.resources.values()).find(r => r.uri === uri);

      if (!resource) {
        throw new Error(`Resource not found: ${uri}`);
      }

      return await resource.handler(uri);
    });
  }

  /**
   * Register a tool with the MCP server
   * This is a helper method for use in the init() method
   */
  protected registerTool<T extends z.ZodSchema>(
    name: string,
    description: string,
    inputSchema: T,
    handler: (params: z.infer<T>) => Promise<CallToolResult>
  ): void {
    const tool: McpToolDefinition<T> = {
      name,
      description,
      inputSchema,
      handler,
    };

    this.tools.set(name, tool as unknown as McpToolDefinition);
  }

  /**
   * Register a resource with the MCP server
   * This is a helper method for use in the init() method
   */
  protected registerResource(
    name: string,
    uri: string,
    handler: (uri: string) => Promise<{
      contents: Array<{
        uri: string;
        mimeType: string;
        text: string;
      }>;
    }>
  ): void {
    const resource: McpResourceDefinition = {
      name,
      uri,
      handler,
    };

    this.resources.set(uri, resource);
  }

  /**
   * Convert Zod schema to JSON Schema format
   * This is a simplified implementation - you may want to use a library like zod-to-json-schema
   */
  protected zodToJsonSchema(schema: z.ZodSchema): Record<string, unknown> {
    // For now, we'll use a basic conversion
    // In production, consider using the zod-to-json-schema package
    if (schema instanceof z.ZodObject) {
      const shape = schema.shape as Record<string, z.ZodSchema>;
      const properties: Record<string, unknown> = {};
      const required: string[] = [];

      for (const [key, value] of Object.entries(shape)) {
        const zodValue = value as z.ZodSchema;
        properties[key] = this.zodTypeToJsonSchema(zodValue);
        if (!(zodValue instanceof z.ZodOptional)) {
          required.push(key);
        }
      }

      return {
        type: 'object',
        properties,
        required: required.length > 0 ? required : undefined,
      };
    }

    return this.zodTypeToJsonSchema(schema);
  }

  /**
   * Convert individual Zod types to JSON Schema
   */
  protected zodTypeToJsonSchema(schema: z.ZodSchema): Record<string, unknown> {
    if (schema instanceof z.ZodString) {
      return { type: 'string' };
    } else if (schema instanceof z.ZodNumber) {
      return { type: 'number' };
    } else if (schema instanceof z.ZodBoolean) {
      return { type: 'boolean' };
    } else if (schema instanceof z.ZodArray) {
      const elementSchema = (schema as unknown as { element: z.ZodSchema }).element;
      return {
        type: 'array',
        items: this.zodTypeToJsonSchema(elementSchema),
      };
    } else if (schema instanceof z.ZodEnum) {
      const options = (schema as unknown as { options: readonly string[] }).options;
      return {
        type: 'string',
        enum: options,
      };
    } else if (schema instanceof z.ZodOptional) {
      const unwrapped = (schema as unknown as { unwrap: () => z.ZodSchema }).unwrap();
      return this.zodTypeToJsonSchema(unwrapped);
    } else if (schema instanceof z.ZodObject) {
      return this.zodToJsonSchema(schema);
    }

    // Fallback for unsupported types
    return { type: 'object' };
  }

  /**
   * Handle incoming WebSocket messages
   * Can be overridden by subclasses for custom message handling
   */
  override onMessage(connection: unknown, message: string): void {
    try {
      // Parse the message as JSON-RPC
      const parsed = JSON.parse(message) as { id?: string | null };
      
      // TODO: The MCP server SDK doesn't expose a handleRequest method directly
      // This needs to be implemented based on the specific transport mechanism
      // For now, we'll just echo back an error
      console.warn('Direct message handling not implemented. Use MCP transport instead.');
      
      (connection as { send: (data: string) => void }).send(JSON.stringify({
        jsonrpc: '2.0',
        error: {
          code: -32601,
          message: 'Method not found - use MCP transport endpoints',
        },
        id: parsed.id ?? null,
      }));
    } catch (_error) {
      console.error('Error handling message:', _error);
      // Send error response
      (connection as { send: (data: string) => void }).send(JSON.stringify({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'Internal error',
          data: _error instanceof Error ? _error.message : 'Unknown error',
        },
        id: null,
      }));
    }
  }
}