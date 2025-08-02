import { GeminiClient as BaseGeminiClient } from '@/lib/ai/clients';
import type {
  EmployeeCost,
  ProjectCostForecast,
  ScenarioInput,
  ScenarioOutput,
} from '@/lib/types/employee-cost';

export interface CostAnalysis {
  summary: string;
  keyFindings: string[];
  costDrivers: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  recommendations: string[];
  savingsOpportunities: Array<{
    description: string;
    potentialSavings: number;
    implementation: string;
  }>;
}

export interface ExecutiveReport {
  title: string;
  executiveSummary: string;
  sections: Array<{
    title: string;
    content: string;
    charts?: Array<{
      type: 'line' | 'bar' | 'pie';
      data: unknown;
      title: string;
    }>;
  }>;
  keyMetrics: Array<{
    label: string;
    value: string | number;
    change?: number;
    trend?: 'up' | 'down' | 'stable';
  }>;
  recommendations: string[];
  nextSteps: string[];
}

export class FinancialAnalysisClient {
  private geminiClient: BaseGeminiClient;

  constructor() {
    this.geminiClient = new BaseGeminiClient();
  }

  async analyzeEmployeeCosts(costs: EmployeeCost[]): Promise<CostAnalysis> {
    const prompt = `
      Analyze the following employee cost data and provide insights:
      
      Total Employees: ${costs.length}
      Total Monthly Cost: ${costs.reduce((sum, emp) => sum + emp.totalMonthlyCost, 0).toLocaleString()}
      
      Department Breakdown:
      ${this.getDepartmentBreakdown(costs)}
      
      Please provide:
      1. Executive summary of the cost structure
      2. Key findings (top 3-5 insights)
      3. Main cost drivers
      4. Recommendations for optimization
      5. Specific savings opportunities
      
      Format the response as JSON with the structure:
      {
        "summary": "...",
        "keyFindings": ["...", "..."],
        "costDrivers": [{"category": "...", "amount": 0, "percentage": 0}],
        "recommendations": ["...", "..."],
        "savingsOpportunities": [{"description": "...", "potentialSavings": 0, "implementation": "..."}]
      }
    `;

    try {
      const responseText = await this.geminiClient.askQuestion(prompt);
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as CostAnalysis;
      }
      return {
        summary: responseText,
        keyFindings: [],
        costDrivers: [],
        recommendations: [],
        savingsOpportunities: [],
      };
    } catch (_error) {
      throw new Error('Failed to analyze employee costs');
    }
  }

  async generateForecastNarrative(forecast: ProjectCostForecast): Promise<string> {
    const prompt = `
      Generate an executive-friendly narrative for this cost forecast:
      
      Project: ${forecast.projectName}
      Current Monthly Cost: ${forecast.currentMonthlyCost.toLocaleString()}
      Current Headcount: ${forecast.currentHeadcount}
      
      Forecast Summary:
      - 3-month projection: ${forecast.forecastedCosts[2]?.value.toLocaleString() ?? 'N/A'}
      - 6-month projection: ${forecast.forecastedCosts[5]?.value.toLocaleString() ?? 'N/A'}
      - 12-month projection: ${forecast.forecastedCosts[11]?.value.toLocaleString() ?? 'N/A'}
      
      Write a clear, concise narrative (2-3 paragraphs) that:
      1. Summarizes the current state
      2. Explains the forecast trend
      3. Highlights any concerns or opportunities
      4. Provides actionable insights
    `;

    try {
      return await this.geminiClient.askQuestion(prompt);
    } catch (_error) {
      throw new Error('Failed to generate forecast narrative');
    }
  }

  async planScenario(scenario: ScenarioInput): Promise<ScenarioOutput> {
    const prompt = `
      Analyze this workforce scenario and provide comprehensive insights:
      
      Scenario: ${scenario.name}
      Description: ${scenario.description}
      
      Changes:
      ${scenario.hiring ? `Hiring: ${scenario.hiring.length} new employees` : ''}
      ${scenario.terminations ? `Terminations: ${scenario.terminations.length} employees` : ''}
      ${scenario.salaryAdjustments ? `Salary adjustments: ${scenario.salaryAdjustments.length} employees` : ''}
      
      Provide a detailed analysis including:
      1. Financial impact (monthly and annual)
      2. ROI projection
      3. Break-even timeline
      4. Key recommendations
      5. Potential risks
      
      Consider factors like:
      - Ramp-up time for new hires
      - Productivity impact
      - Market conditions
      - Team dynamics
      
      Format as JSON with complete ScenarioOutput structure.
    `;

    try {
      const responseText = await this.geminiClient.askQuestion(prompt);
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as ScenarioOutput;
      }
      throw new Error('Invalid scenario analysis response');
    } catch (_error) {
      throw new Error('Failed to plan scenario');
    }
  }

  async createExecutiveReport(data: {
    costs: EmployeeCost[];
    forecasts: ProjectCostForecast[];
    scenarios?: ScenarioOutput[];
  }): Promise<ExecutiveReport> {
    const prompt = `
      Create a comprehensive executive report for C-suite presentation:
      
      Current State:
      - Total Employees: ${data.costs.length}
      - Total Monthly Cost: ${data.costs.reduce((sum, emp) => sum + emp.totalMonthlyCost, 0).toLocaleString()}
      - Projects: ${data.forecasts.length}
      
      Generate a professional report with:
      1. Executive Summary (2-3 paragraphs)
      2. Key Metrics with trends
      3. Department/Project Analysis
      4. Future Projections
      5. Strategic Recommendations
      6. Next Steps
      
      Make it board-ready with clear, actionable insights.
      Format as JSON matching ExecutiveReport structure.
    `;

    try {
      const responseText = await this.geminiClient.askQuestion(prompt);
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as ExecutiveReport;
      }
      throw new Error('Invalid executive report response');
    } catch (_error) {
      throw new Error('Failed to create executive report');
    }
  }

  async askQuestion(question: string, context?: Record<string, unknown>): Promise<string> {
    const prompt = `
      You are an AI financial analyst specializing in employee cost management and workforce planning.
      
      User Question: ${question}
      
      ${context ? `Context: ${JSON.stringify(context, null, 2)}` : ''}
      
      Provide a clear, concise, and actionable response. Focus on:
      - Direct answer to the question
      - Relevant financial insights
      - Practical recommendations
      - Potential risks or considerations
      
      Keep the response professional but conversational, suitable for executives.
    `;

    try {
      return await this.geminiClient.askQuestion(prompt, context);
    } catch (_error) {
      throw new Error('Failed to process question');
    }
  }

  private getDepartmentBreakdown(costs: EmployeeCost[]): string {
    const deptCosts = costs.reduce(
      (acc, emp) => {
        const dept = emp.employee.department;
        acc[dept] ??= { count: 0, cost: 0 };
        acc[dept].count++;
        acc[dept].cost += emp.totalMonthlyCost;
        return acc;
      },
      {} as Record<string, { count: number; cost: number }>
    );

    return Object.entries(deptCosts)
      .map(
        ([dept, data]) => `- ${dept}: ${data.count} employees, ${data.cost.toLocaleString()}/month`
      )
      .join('\n      ');
  }
}
