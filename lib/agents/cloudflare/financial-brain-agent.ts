import { McpAgent } from '@/lib/agents/base/mcp-agent';
import type { Env } from '@/functions/types';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { z } from 'zod';
import { GeminiClient } from '@/lib/gemini/client';
import type { CallToolResult, TextContent } from '@modelcontextprotocol/sdk/types.js';

// Define schemas for our tools
const AnalyzeCostsSchema = z.object({
  employees: z.array(z.object({
    id: z.string(),
    name: z.string(),
    department: z.string(),
    baseSalary: z.number(),
    benefits: z.object({
      health: z.number(),
      retirement: z.number(),
      other: z.number(),
    }).optional(),
  })),
  timeframe: z.enum(['monthly', 'quarterly', 'annual']),
  includeForecasts: z.boolean().optional(),
});

const GenerateInsightsSchema = z.object({
  department: z.string().optional(),
  metric: z.enum(['cost', 'efficiency', 'growth', 'optimization']),
  depth: z.enum(['summary', 'detailed', 'comprehensive']).optional(),
});

const AnswerQuestionSchema = z.object({
  question: z.string().min(1).max(1000),
  context: z.record(z.unknown()).optional(),
});

export class FinancialBrainAgent extends McpAgent<Env> {
  server = new McpServer({
    name: 'financial-brain',
    version: '1.0.0',
  });

  private geminiClient: GeminiClient | null = null;
  private conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }> = [];

  async init() {
    // Initialize Gemini client
    this.geminiClient = new GeminiClient();

    // Register analyze_costs tool
    this.registerTool(
      'analyze_costs',
      'Perform deep analysis of employee costs with AI-powered insights',
      AnalyzeCostsSchema,
      async (params) => {
        const response = await this.analyzeCosts(params);
        return {
          content: [{ type: 'text', text: response }],
        };
      }
    );

    // Register generate_insights tool
    this.registerTool(
      'generate_insights',
      'Generate actionable insights and recommendations for cost optimization',
      GenerateInsightsSchema,
      async (params) => {
        const response = await this.generateInsights(params);
        return {
          content: [{ type: 'text', text: response }],
        };
      }
    );

    // Register answer_questions tool
    this.registerTool(
      'answer_questions',
      'Answer natural language questions about employee costs and financial data',
      AnswerQuestionSchema,
      async (params) => {
        const response = await this.answerQuestions(params);
        return {
          content: [{ type: 'text', text: response }],
        };
      }
    );

    // Register a resource for conversation history
    this.registerResource(
      'conversation-history',
      'mcp://resource/conversation-history',
      async () => {
        return {
          contents: [{
            uri: 'mcp://resource/conversation-history',
            mimeType: 'application/json',
            text: JSON.stringify(this.conversationHistory, null, 2),
          }],
        };
      }
    );
  }

  private async analyzeCosts(params: z.infer<typeof AnalyzeCostsSchema>): Promise<string> {
    const { employees, timeframe, includeForecasts } = params;

    if (!this.geminiClient) {
      throw new Error('Gemini client not initialized');
    }

    // Calculate total costs
    const totalCost = employees.reduce((sum, emp) => {
      const benefits = emp.benefits || { health: 0, retirement: 0, other: 0 };
      const totalBenefits = benefits.health + benefits.retirement + benefits.other;
      return sum + emp.baseSalary + totalBenefits;
    }, 0);

    // Prepare context for Gemini
    const prompt = `
      As a financial analyst, analyze the following employee cost data:
      
      Total Employees: ${employees.length}
      Timeframe: ${timeframe}
      Total Cost: $${totalCost.toLocaleString()}
      
      Department Breakdown:
      ${this.getDepartmentBreakdown(employees)}
      
      Please provide:
      1. Cost analysis summary
      2. Key observations
      3. Potential cost optimization opportunities
      4. Risk factors to consider
      ${includeForecasts ? '5. Forecast for next period based on trends' : ''}
    `;

    try {
      const response = await this.geminiClient.askQuestion(prompt, { employees, timeframe });

      // Store in conversation history
      this.conversationHistory.push({
        role: 'user',
        content: `Analyze costs for ${employees.length} employees (${timeframe})`,
        timestamp: new Date(),
      });
      this.conversationHistory.push({
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      });

      return response;
    } catch (error) {
      console.error('Error analyzing costs:', error);
      return 'Error analyzing costs. Please try again.';
    }
  }

  private async generateInsights(params: z.infer<typeof GenerateInsightsSchema>): Promise<string> {
    const { department, metric, depth = 'detailed' } = params;

    if (!this.geminiClient) {
      throw new Error('Gemini client not initialized');
    }

    const prompt = `
      Generate ${depth} financial insights for:
      ${department ? `Department: ${department}` : 'Entire organization'}
      Focus Metric: ${metric}
      
      Provide actionable recommendations that:
      1. Are specific and measurable
      2. Include implementation steps
      3. Estimate potential impact
      4. Consider risks and dependencies
      5. Suggest KPIs to track progress
    `;

    try {
      const response = await this.geminiClient.askQuestion(prompt, { department, metric, depth });
      return response;
    } catch (error) {
      console.error('Error generating insights:', error);
      return 'Error generating insights. Please try again.';
    }
  }

  private async answerQuestions(params: z.infer<typeof AnswerQuestionSchema>): Promise<string> {
    const { question, context } = params;

    if (!this.geminiClient) {
      throw new Error('Gemini client not initialized');
    }

    // Build conversation context
    const recentHistory = this.conversationHistory
      .slice(-5)
      .map(h => `${h.role}: ${h.content}`)
      .join('\n');

    const prompt = `
      Based on the following conversation history and context, answer this question:
      
      Question: ${question}
      
      Recent Conversation:
      ${recentHistory}
      
      Additional Context:
      ${JSON.stringify(context || {}, null, 2)}
      
      Provide a clear, concise answer that:
      1. Directly addresses the question
      2. Uses specific data when available
      3. Explains any assumptions made
      4. Suggests follow-up questions if relevant
    `;

    try {
      const response = await this.geminiClient.askQuestion(prompt, context);

      // Update conversation history
      this.conversationHistory.push({
        role: 'user',
        content: question,
        timestamp: new Date(),
      });
      this.conversationHistory.push({
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      });

      // Keep history limited to last 20 exchanges
      if (this.conversationHistory.length > 40) {
        this.conversationHistory = this.conversationHistory.slice(-40);
      }

      return response;
    } catch (error) {
      console.error('Error answering question:', error);
      return 'Error processing your question. Please try again.';
    }
  }

  private getDepartmentBreakdown(employees: any[]): string {
    const deptCosts = employees.reduce((acc, emp) => {
      if (!acc[emp.department]) {
        acc[emp.department] = { count: 0, cost: 0 };
      }
      acc[emp.department].count++;
      const benefits = emp.benefits || { health: 0, retirement: 0, other: 0 };
      const totalCost = emp.baseSalary + benefits.health + benefits.retirement + benefits.other;
      acc[emp.department].cost += totalCost;
      return acc;
    }, {} as Record<string, { count: number; cost: number }>);

    return Object.entries(deptCosts)
      .map(([dept, data]) => `- ${dept}: ${data.count} employees, $${data.cost.toLocaleString()}`)
      .join('\n');
  }
}