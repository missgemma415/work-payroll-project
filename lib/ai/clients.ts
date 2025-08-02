import { Anthropic } from '@anthropic-ai/sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface AIClient {
  askQuestion(question: string, context?: Record<string, unknown>): Promise<string>;
}

export class GeminiClient implements AIClient {
  private client: GoogleGenerativeAI;
  private modelName: string;

  constructor() {
    const apiKey: string = process.env['GOOGLE_GEMINI_API_KEY'] as string;
    if (!apiKey) {
      throw new Error('GOOGLE_GEMINI_API_KEY is not configured');
    }
    this.client = new GoogleGenerativeAI(apiKey);
    this.modelName = process.env['GOOGLE_GEMINI_MODEL'] ?? 'gemini-1.5-flash-latest';
  }

  async askQuestion(question: string, context?: Record<string, unknown>): Promise<string> {
    const model = this.client.getGenerativeModel({ model: this.modelName });
    const prompt: string = context
      ? `${question}

Context:
${JSON.stringify(context, null, 2)}`
      : question;
    const result: Awaited<ReturnType<typeof model.generateContent>> =
      await model.generateContent(prompt);
    const response: Awaited<typeof result.response> = result.response;
    const text: string = response.text();
    if (!text) {
      throw new Error('No response text received from Gemini');
    }
    return text;
  }
}

export class AnthropicClient implements AIClient {
  private client: Anthropic;
  private modelName: string;

  constructor() {
    const apiKey: string = process.env['ANTHROPIC_API_KEY'] as string;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY is not configured');
    }
    this.client = new Anthropic({ apiKey: apiKey });
    this.modelName = process.env['ANTHROPIC_MODEL'] ?? 'claude-3-opus-20240229';
  }

  async askQuestion(question: string, context?: Record<string, unknown>): Promise<string> {
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [
      { role: 'user', content: question },
    ];

    if (context) {
      messages.push({ role: 'user', content: `Context: ${JSON.stringify(context, null, 2)}` });
    }

    const result: Awaited<ReturnType<typeof this.client.messages.create>> =
      await this.client.messages.create({
        model: this.modelName,
        max_tokens: 1024,
        messages: messages,
      });

    const firstContent = result.content[0];
    if (firstContent && firstContent.type === 'text') {
      return firstContent.text;
    }
    throw new Error('Unexpected response format from Anthropic API');
  }
}

export class ForecastClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = process.env['FORECAST_API_URL'] ?? 'http://127.0.0.1:8000';
  }

  async getProphetForecast(data: { ds: string[]; y: number[] }): Promise<Record<string, unknown>> {
    const response = await fetch(`${this.baseUrl}/prophet-forecast`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json() as Promise<Record<string, unknown>>;
  }

  async getNeuralProphetForecast(data: {
    ds: string[];
    y: number[];
    seasonality_mode?: string;
    learning_rate?: number;
  }): Promise<Record<string, unknown>> {
    const response = await fetch(`${this.baseUrl}/neural-prophet-forecast`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json() as Promise<Record<string, unknown>>;
  }
}
