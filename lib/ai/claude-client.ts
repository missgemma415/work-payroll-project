/**
 * Claude API Client for CEO Payroll Analytics Platform
 * Handles natural language processing and query generation using Anthropic's Claude API
 */

import Anthropic from '@anthropic-ai/sdk';

// Initialize Claude client with environment variable
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  response: string;
  message_id: string;
  created_at: string;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
}

export interface QueryAnalysisResponse {
  intent: string;
  sql_query?: string;
  natural_response: string;
  requires_data: boolean;
  confidence: number;
}

class ClaudeClient {
  private readonly model = 'claude-3-5-haiku-20241022';
  private readonly maxTokens = 4000;

  /**
   * Generate a chat response for payroll analytics queries
   */
  async chat(message: string, conversationHistory: ChatMessage[] = []): Promise<ChatResponse> {
    try {
      const messages: ChatMessage[] = [
        ...conversationHistory,
        { role: 'user', content: message }
      ];

      const response = await anthropic.messages.create({
        model: this.model,
        max_tokens: this.maxTokens,
        messages: messages.map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        system: this.getSystemPrompt()
      });

      const responseText = response.content[0]?.type === 'text' 
        ? response.content[0].text 
        : 'I apologize, but I couldn\'t generate a proper response.';

      return {
        response: responseText,
        message_id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        usage: {
          input_tokens: response.usage.input_tokens,
          output_tokens: response.usage.output_tokens
        }
      };
    } catch (error) {
      console.error('Claude API Error:', error);
      throw new Error(`Claude API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Analyze natural language query and generate SQL if needed
   */
  async analyzeQuery(query: string): Promise<QueryAnalysisResponse> {
    try {
      const response = await anthropic.messages.create({
        model: this.model,
        max_tokens: 2000,
        messages: [{
          role: 'user',
          content: `Analyze this payroll query: "${query}"`
        }],
        system: this.getQueryAnalysisPrompt()
      });

      const responseText = response.content[0]?.type === 'text' 
        ? response.content[0].text 
        : '{}';

      try {
        const analysis = JSON.parse(responseText);
        return {
          intent: analysis.intent || 'unknown',
          sql_query: analysis.sql_query,
          natural_response: analysis.natural_response || 'I can help you with payroll analytics.',
          requires_data: analysis.requires_data || false,
          confidence: analysis.confidence || 0.5
        };
      } catch (parseError) {
        return {
          intent: 'general_chat',
          natural_response: responseText,
          requires_data: false,
          confidence: 0.8
        };
      }
    } catch (error) {
      console.error('Query analysis error:', error);
      return {
        intent: 'error',
        natural_response: 'I encountered an error analyzing your query. Please try rephrasing.',
        requires_data: false,
        confidence: 0.0
      };
    }
  }

  /**
   * Generate SQL query from natural language
   */
  async generateSQL(naturalQuery: string): Promise<string | null> {
    try {
      const response = await anthropic.messages.create({
        model: this.model,
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `Convert this to SQL: "${naturalQuery}"`
        }],
        system: this.getSQLGenerationPrompt()
      });

      const responseText = response.content[0]?.type === 'text' 
        ? response.content[0].text 
        : null;

      // Extract SQL from response if it contains SQL code
      const sqlMatch = responseText?.match(/```sql\s*([\s\S]*?)\s*```/);
      return sqlMatch ? sqlMatch[1].trim() : responseText?.trim() || null;
    } catch (error) {
      console.error('SQL generation error:', error);
      return null;
    }
  }

  /**
   * System prompt for general chat functionality
   */
  private getSystemPrompt(): string {
    return `You are an AI assistant for a CEO Payroll Analytics Platform. You help Fortune 500 executives analyze workforce costs, payroll data, and make strategic decisions.

Key capabilities:
- Analyze employee costs, burden rates, and total payroll expenses
- Provide insights on hiring costs, department budgets, and forecasting
- Answer questions about SpringAhead time tracking and Paychex payroll data
- Generate executive summaries and board-ready insights

Current data includes:
- 24 employees with $596,000 total monthly cost
- Average burden rate of 23.7% (taxes, benefits, overhead)
- Integration with SpringAhead (time tracking) and Paychex (payroll)

Respond professionally with executive-level insights. Keep responses concise but informative.`;
  }

  /**
   * System prompt for query analysis
   */
  private getQueryAnalysisPrompt(): string {
    return `Analyze payroll analytics queries and return JSON with this structure:
{
  "intent": "cost_analysis|employee_info|forecasting|general_chat",
  "sql_query": "SELECT statement if data query needed",
  "natural_response": "Natural language response",
  "requires_data": true/false,
  "confidence": 0.0-1.0
}

Database schema:
- employee_costs: employee_name, total_hours, gross_pay, employer_taxes, benefits, total_true_cost, burden_rate
- imported_files: filename, type, status, records_processed
- payroll_data: raw payroll and time tracking data

Focus on executive-level insights for CEO dashboard.`;
  }

  /**
   * System prompt for SQL generation
   */
  private getSQLGenerationPrompt(): string {
    return `Convert natural language to PostgreSQL queries for payroll analytics.

Database schema:
- employee_costs (employee_name VARCHAR, total_hours NUMERIC, gross_pay NUMERIC, employer_taxes NUMERIC, benefits NUMERIC, total_true_cost NUMERIC, burden_rate NUMERIC)
- imported_files (filename VARCHAR, type VARCHAR, status VARCHAR, records_processed INTEGER, processed_date TIMESTAMP)
- payroll_data (employee_name VARCHAR, pay_period DATE, hours NUMERIC, gross_pay NUMERIC, various other payroll fields)

Guidelines:
- Only generate SELECT queries (no INSERT, UPDATE, DELETE)
- Use proper PostgreSQL syntax
- Format currency as rounded numbers
- Include ORDER BY for better presentation
- Return raw SQL only, wrapped in \`\`\`sql\`\`\` tags`;
  }
}

// Export singleton instance
export const claudeClient = new ClaudeClient();
export default claudeClient;