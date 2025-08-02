import { AnthropicClient as BaseAnthropicClient } from '@/lib/ai/clients';

export class AnthropicAnalysisClient {
  private anthropicClient: BaseAnthropicClient;

  constructor() {
    this.anthropicClient = new BaseAnthropicClient();
  }

  async getAnalysis(prompt: string): Promise<string> {
    try {
      return await this.anthropicClient.askQuestion(prompt);
    } catch (_error) {
      throw new Error('Failed to get analysis from Anthropic');
    }
  }
}
