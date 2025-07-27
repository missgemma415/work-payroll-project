import { getAuthToken } from '@/lib/context/auth-context';

const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? '';

interface ChatResponse {
  response: string;
  metadata: {
    model: string;
    timestamp: string;
  };
}

interface AnalyzeResponse {
  analysis: string;
  summary: {
    totalEmployees: number;
    totalAnnualCost: number;
    averageSalary: number;
    departments: number;
  };
  timestamp: string;
}

class AIClient {
  private async fetchWithAuth(endpoint: string, options: RequestInit = {}): Promise<Response> {
    const token = getAuthToken();

    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = (await response.json().catch(() => ({ error: 'Request failed' }))) as {
        error?: string;
      };
      throw new Error(error.error ?? `HTTP ${response.status}`);
    }

    return response;
  }

  async chat(query: string, context?: Record<string, unknown>): Promise<ChatResponse> {
    const response = await this.fetchWithAuth('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ query, context }),
    });

    return response.json() as Promise<ChatResponse>;
  }

  async analyze(
    employees: Array<{
      id: string;
      name: string;
      department: string;
      salary: number;
    }>,
    analysisType: 'cost-breakdown' | 'optimization' | 'department-analysis' | 'forecast'
  ): Promise<AnalyzeResponse> {
    const response = await this.fetchWithAuth('/ai/analyze', {
      method: 'POST',
      body: JSON.stringify({ employees, analysisType }),
    });

    return response.json() as Promise<AnalyzeResponse>;
  }

  async health(): Promise<{ status: string; timestamp: string }> {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    return response.json() as Promise<{ status: string; timestamp: string }>;
  }
}

export const aiClient = new AIClient();
