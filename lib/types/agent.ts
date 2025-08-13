import type { z } from 'zod';

// Base types for agent system
export interface Tool {
  name: string;
  description: string;
  parameters: z.ZodSchema;
  execute: (params: unknown) => Promise<unknown>;
}

export interface AgentInput {
  query: string;
  context?: Record<string, unknown>;
  sessionId?: string;
  userId?: string;
}

export interface AgentOutput {
  response: string;
  data?: unknown;
  metadata?: {
    toolsUsed?: string[];
    confidenceScore?: number;
    processingTime?: number;
    suggestions?: string[];
  };
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  tools: Tool[];
  maxIterations?: number;
  timeout?: number;
  execute: (input: AgentInput) => Promise<AgentOutput>;
}

export interface AgentConfig {
  id: string;
  name: string;
  description: string;
  tools?: Tool[];
  maxIterations?: number;
  timeout?: number;
}

// Agent types for our system
export type AgentType =
  | 'financial-analyst'
  | 'forecasting'
  | 'scenario-planning'
  | 'reporting'
  | 'orchestrator';

// Tool types
export type ToolType =
  | 'employee-cost-calculator'
  | 'forecast-generator'
  | 'scenario-analyzer'
  | 'report-builder'
  | 'data-fetcher';
