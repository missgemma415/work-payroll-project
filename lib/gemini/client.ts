import { GoogleGenAI } from '@google/genai';

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

export class GeminiClient {
  private ai: GoogleGenAI;
  private modelName: string;

  constructor() {
    const apiKey = process.env['GOOGLE_GEMINI_API_KEY'];
    if (!apiKey) {
      throw new Error('GOOGLE_GEMINI_API_KEY is not configured');
    }

    this.ai = new GoogleGenAI({ apiKey });
    this.modelName = process.env['GOOGLE_GEMINI_MODEL'] ?? 'gemini-2.0-flash-exp-01-18';
  }

  async analyzeEmployeeCosts(costs: EmployeeCost[]): Promise<CostAnalysis> {
    const prompt = `
      Analyze the following employee cost data and provide insights:
      
      Total Employees: ${costs.length}
      Total Monthly Cost: $${costs.reduce((sum, emp) => sum + emp.totalMonthlyCost, 0).toLocaleString()}
      
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
      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: prompt,
      });

      const text = response.text;
      if (!text) {
        throw new Error('No response text received from Gemini');
      }

      // Parse JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as CostAnalysis;
      }

      // Fallback if JSON parsing fails
      return {
        summary: text,
        keyFindings: [],
        costDrivers: [],
        recommendations: [],
        savingsOpportunities: [],
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error analyzing employee costs:', error);
      throw new Error('Failed to analyze employee costs');
    }
  }

  async generateForecastNarrative(forecast: ProjectCostForecast): Promise<string> {
    const prompt = `
      Generate an executive-friendly narrative for this cost forecast:
      
      Project: ${forecast.projectName}
      Current Monthly Cost: $${forecast.currentMonthlyCost.toLocaleString()}
      Current Headcount: ${forecast.currentHeadcount}
      
      Forecast Summary:
      - 3-month projection: $${forecast.forecastedCosts[2]?.value.toLocaleString() ?? 'N/A'}
      - 6-month projection: $${forecast.forecastedCosts[5]?.value.toLocaleString() ?? 'N/A'}
      - 12-month projection: $${forecast.forecastedCosts[11]?.value.toLocaleString() ?? 'N/A'}
      
      Write a clear, concise narrative (2-3 paragraphs) that:
      1. Summarizes the current state
      2. Explains the forecast trend
      3. Highlights any concerns or opportunities
      4. Provides actionable insights
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: prompt,
      });

      const text = response.text;
      if (!text) {
        throw new Error('No response text received from Gemini');
      }
      return text;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error generating forecast narrative:', error);
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
      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: prompt,
      });

      const text = response.text;
      if (!text) {
        throw new Error('No response text received from Gemini');
      }

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as ScenarioOutput;
      }

      // Fallback scenario output
      throw new Error('Invalid scenario analysis response');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error planning scenario:', error);
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
      - Total Monthly Cost: $${data.costs.reduce((sum, emp) => sum + emp.totalMonthlyCost, 0).toLocaleString()}
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
      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: prompt,
      });

      const text = response.text;
      if (!text) {
        throw new Error('No response text received from Gemini');
      }

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as ExecutiveReport;
      }

      throw new Error('Invalid executive report response');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error creating executive report:', error);
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
      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: prompt,
      });

      const text = response.text;
      if (!text) {
        throw new Error('No response text received from Gemini');
      }
      return text;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error processing question:', error);
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
        ([dept, data]) => `- ${dept}: ${data.count} employees, $${data.cost.toLocaleString()}/month`
      )
      .join('\n      ');
  }
}
