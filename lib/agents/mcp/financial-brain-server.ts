import { z } from 'zod';

import { GeminiClient } from '@/lib/gemini/client';

import { BaseMcpServer } from './base-mcp-server';

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

export class FinancialBrainServer extends BaseMcpServer {
  private geminiClient!: GeminiClient;
  private conversationHistory: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }> = [];

  constructor() {
    super({
      name: 'financial-brain',
      version: '1.0.0',
      description: 'AI-powered financial analyst for employee cost analysis',
    });
  }

  initialize(): Promise<void> {
    // Initialize Gemini client
    this.geminiClient = new GeminiClient();

    // Register our MCP tools
    this.registerTools([
      {
        name: 'analyze_costs',
        title: 'Analyze Employee Costs',
        description: 'Perform deep analysis of employee costs with AI-powered insights',
        inputSchema: AnalyzeCostsSchema,
        handler: this.analyzeCosts.bind(this),
      },
      {
        name: 'generate_insights',
        title: 'Generate Financial Insights',
        description: 'Generate actionable insights and recommendations for cost optimization',
        inputSchema: GenerateInsightsSchema,
        handler: this.generateInsights.bind(this),
      },
      {
        name: 'answer_questions',
        title: 'Answer Financial Questions',
        description: 'Answer natural language questions about employee costs and financial data',
        inputSchema: AnswerQuestionSchema,
        handler: this.answerQuestions.bind(this),
      },
    ]);
    
    return Promise.resolve();
  }

  private async analyzeCosts(params: z.infer<typeof AnalyzeCostsSchema>): Promise<{
    content: Array<{ type: 'text'; text: string }>;
  }> {
    const { employees, timeframe, includeForecasts } = params;

    // Calculate total costs
    const totalCost = employees.reduce((sum, emp) => {
      const benefits = emp.benefits ?? { health: 0, retirement: 0, other: 0 };
      const totalBenefits = benefits.health + benefits.retirement + benefits.other;
      return sum + emp.baseSalary + totalBenefits;
    }, 0);

    // Prepare data for Gemini
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

      return {
        content: [{ type: 'text' as const, text: response }],
      };
    } catch (_error) {
      // Error analyzing costs
      return {
        content: [{
          type: 'text' as const,
          text: 'Error analyzing costs. Please try again.',
        }],
      };
    }
  }

  private async generateInsights(params: z.infer<typeof GenerateInsightsSchema>): Promise<{
    content: Array<{ type: 'text'; text: string }>;
  }> {
    const { department, metric, depth = 'detailed' } = params;

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

      return {
        content: [{ type: 'text' as const, text: response }],
      };
    } catch (_error) {
      // Error generating insights
      return {
        content: [{
          type: 'text' as const,
          text: 'Error generating insights. Please try again.',
        }],
      };
    }
  }

  private async answerQuestions(params: z.infer<typeof AnswerQuestionSchema>): Promise<{
    content: Array<{ type: 'text'; text: string }>;
  }> {
    const { question, context } = params;

    // Build conversation context
    const recentHistory = this.conversationHistory
      .slice(-5)
      .map(h => `${h.role}: ${h.content}`)
      .join('\n');

    try {
      const contextWithHistory = {
        ...context,
        recentHistory,
        instructions: `
          Provide a clear, concise answer that:
          1. Directly addresses the question
          2. Uses specific data when available
          3. Explains any assumptions made
          4. Suggests follow-up questions if relevant
        `
      };
      
      const response = await this.geminiClient.askQuestion(question, contextWithHistory);

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

      return {
        content: [{ type: 'text' as const, text: response }],
      };
    } catch (_error) {
      // Error answering question
      return {
        content: [{
          type: 'text' as const,
          text: 'Error processing your question. Please try again.',
        }],
      };
    }
  }

  private getDepartmentBreakdown(employees: Array<{
    id: string;
    name: string;
    department: string;
    baseSalary: number;
    benefits?: {
      health: number;
      retirement: number;
      other: number;
    } | undefined;
  }>): string {
    const deptCosts = employees.reduce((acc, emp) => {
      acc[emp.department] ??= { count: 0, cost: 0 };
      const deptData = acc[emp.department];
      if (deptData) {
        deptData.count++;
        const benefits = emp.benefits ?? { health: 0, retirement: 0, other: 0 };
        const totalCost = emp.baseSalary + benefits.health + benefits.retirement + benefits.other;
        deptData.cost += totalCost;
      }
      return acc;
    }, {} as Record<string, { count: number; cost: number }>);

    return Object.entries(deptCosts)
      .map(([dept, data]) => `- ${dept}: ${data.count} employees, $${data.cost.toLocaleString()}`)
      .join('\n');
  }
}