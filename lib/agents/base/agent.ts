import { v4 as uuidv4 } from 'uuid';

import type { Agent, AgentConfig, AgentInput, AgentOutput, Tool } from '@/lib/types/agent';

export abstract class BaseAgent implements Agent {
  id: string;
  name: string;
  description: string;
  tools: Tool[];
  maxIterations: number;
  timeout: number;

  constructor(config: AgentConfig) {
    this.id = config.id ?? uuidv4();
    this.name = config.name;
    this.description = config.description;
    this.tools = config.tools ?? [];
    this.maxIterations = config.maxIterations ?? 10;
    this.timeout = config.timeout ?? 30000; // 30 seconds default
  }

  abstract execute(input: AgentInput): Promise<AgentOutput>;

  protected async executeWithTimeout(
    fn: () => Promise<AgentOutput>,
    timeoutMs: number = this.timeout
  ): Promise<AgentOutput> {
    const timeoutPromise = new Promise<AgentOutput>((_, reject) => {
      setTimeout(
        () => reject(new Error(`Agent execution timed out after ${timeoutMs}ms`)),
        timeoutMs
      );
    });

    return Promise.race([fn(), timeoutPromise]);
  }

  protected async executeTool(toolName: string, params: unknown): Promise<unknown> {
    const tool = this.tools.find((t) => t.name === toolName);
    if (!tool) {
      throw new Error(`Tool ${toolName} not found`);
    }

    try {
      // Validate parameters
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const validatedParams = tool.parameters.parse(params);
      return await tool.execute(validatedParams);
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Tool execution failed: ${error.message}`);
      }
      throw error;
    }
  }

  protected createOutput(
    response: string,
    data?: unknown,
    metadata?: Partial<AgentOutput['metadata']>
  ): AgentOutput {
    return {
      response,
      data,
      metadata: {
        ...metadata,
        processingTime: metadata?.processingTime ?? 0,
      },
    };
  }

  protected logDebug(message: string, data?: unknown): void {
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.log(`[${this.name}] ${message}`, data ?? '');
    }
  }
}
