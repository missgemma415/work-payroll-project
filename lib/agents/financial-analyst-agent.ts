import { GeminiClient } from '@/lib/gemini/client';
import type { AgentInput, AgentOutput } from '@/lib/types/agent';
import type { EmployeeCost } from '@/lib/types/employee-cost';

import { BaseAgent } from './base/agent';
import { employeeCostCalculatorTool } from './tools/employee-cost-calculator';

export class FinancialAnalystAgent extends BaseAgent {
  private geminiClient: GeminiClient;

  constructor() {
    super({
      id: 'financial-analyst',
      name: 'Financial Analyst Agent',
      description:
        'Analyzes employee costs, identifies optimization opportunities, and provides financial insights',
      tools: [employeeCostCalculatorTool],
      maxIterations: 5,
      timeout: 30000,
    });

    this.geminiClient = new GeminiClient();
  }

  async execute(input: AgentInput): Promise<AgentOutput> {
    const startTime = Date.now();
    this.logDebug('Starting financial analysis', { query: input.query });

    try {
      return await this.executeWithTimeout(async () => {
        // Extract context data
        const employeeCosts = input.context?.['employeeCosts'] as EmployeeCost[] | undefined;
        const toolsUsed: string[] = [];

        // Determine the type of analysis needed
        const analysisType = this.determineAnalysisType(input.query);
        this.logDebug('Analysis type determined', { analysisType });

        let response: string;
        let data: unknown;

        switch (analysisType) {
          case 'cost-calculation': {
            // Use the cost calculator tool
            const calculationParams = this.extractCalculationParams(input.query);
            const result = await this.executeTool('employee-cost-calculator', calculationParams);
            toolsUsed.push('employee-cost-calculator');

            // Generate narrative explanation
            response = this.generateCostNarrative(result);
            data = result;
            break;
          }

          case 'cost-analysis': {
            if (!employeeCosts || employeeCosts.length === 0) {
              response =
                'I need employee cost data to perform this analysis. Please provide employee information.';
              break;
            }

            // Analyze costs using Gemini
            const analysis = await this.geminiClient.analyzeEmployeeCosts(employeeCosts);
            response = this.formatCostAnalysis(analysis);
            data = analysis;
            break;
          }

          case 'general-query': {
            // Handle general financial questions
            response = await this.geminiClient.askQuestion(input.query, input.context);
            break;
          }

          default:
            response = this.handleUnknownQuery(input.query);
        }

        const processingTime = Date.now() - startTime;

        return this.createOutput(response, data, {
          toolsUsed,
          processingTime,
          confidenceScore: 0.85,
        });
      });
    } catch (error) {
      this.logDebug('Error in financial analysis', error);
      return this.createOutput(
        'I encountered an error while analyzing your request. Please try rephrasing your question or provide more specific details.',
        undefined,
        { processingTime: Date.now() - startTime }
      );
    }
  }

  private determineAnalysisType(query: string): string {
    const lowerQuery = query.toLowerCase();

    if (
      lowerQuery.includes('calculate') ||
      lowerQuery.includes('cost of') ||
      lowerQuery.includes('how much')
    ) {
      return 'cost-calculation';
    }

    if (
      lowerQuery.includes('analyze') ||
      lowerQuery.includes('breakdown') ||
      lowerQuery.includes('optimize')
    ) {
      return 'cost-analysis';
    }

    return 'general-query';
  }

  private extractCalculationParams(query: string): unknown {
    // Extract salary information from the query
    const salaryMatch = query.match(/\$?([\d,]+)(?:k)?/);
    const salary = salaryMatch?.[1]
      ? parseFloat(salaryMatch[1].replace(/,/g, '')) * (query.includes('k') ? 1000 : 1)
      : 100000; // Default salary

    return {
      baseSalary: salary,
      utilization: 100,
    };
  }

  private generateCostNarrative(result: unknown): string {
    const costData = result as {
      baseSalary: number;
      monthlySalary: number;
      totalMonthlyCost: number;
      totalAnnualCost: number;
      costMultiplier: number;
      breakdown: {
        salaryPercentage: number;
        benefitsPercentage: number;
        overheadPercentage: number;
      };
      totalBenefitsCost: number;
      totalOverheadCost: number;
    };

    return `Based on your query, here's the employee cost analysis:

**Base Salary**: $${costData.baseSalary.toLocaleString()}/year ($${costData.monthlySalary.toLocaleString()}/month)

**Total Cost Breakdown**:
- Monthly Cost: $${costData.totalMonthlyCost.toLocaleString()}
- Annual Cost: $${costData.totalAnnualCost.toLocaleString()}
- Cost Multiplier: ${costData.costMultiplier.toFixed(2)}x base salary

**Cost Components**:
- Salary: ${costData.breakdown.salaryPercentage.toFixed(1)}%
- Benefits: ${costData.breakdown.benefitsPercentage.toFixed(1)}% ($${costData.totalBenefitsCost.toLocaleString()}/month)
- Overhead: ${costData.breakdown.overheadPercentage.toFixed(1)}% ($${costData.totalOverheadCost.toLocaleString()}/month)

This means for every dollar in salary, the true cost to the company is approximately $${costData.costMultiplier.toFixed(2)}.`;
  }

  private formatCostAnalysis(analysis: {
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
  }): string {
    let response = `## Cost Analysis Summary\n\n${analysis.summary}\n\n`;

    if (analysis.keyFindings.length > 0) {
      response += '### Key Findings\n';
      analysis.keyFindings.forEach((finding: string, index: number) => {
        response += `${index + 1}. ${finding}\n`;
      });
      response += '\n';
    }

    if (analysis.costDrivers.length > 0) {
      response += '### Main Cost Drivers\n';
      analysis.costDrivers.forEach((driver) => {
        response += `- **${driver.category}**: $${driver.amount.toLocaleString()} (${driver.percentage}%)\n`;
      });
      response += '\n';
    }

    if (analysis.recommendations.length > 0) {
      response += '### Recommendations\n';
      analysis.recommendations.forEach((rec: string, index: number) => {
        response += `${index + 1}. ${rec}\n`;
      });
      response += '\n';
    }

    if (analysis.savingsOpportunities.length > 0) {
      response += '### Savings Opportunities\n';
      analysis.savingsOpportunities.forEach((opp) => {
        response += `- **${opp.description}**: Potential savings of $${opp.potentialSavings.toLocaleString()}\n`;
        response += `  *Implementation*: ${opp.implementation}\n`;
      });
    }

    return response;
  }

  private handleUnknownQuery(query: string): string {
    return `I understand you're asking about "${query}". As a Financial Analyst Agent, I can help you with:

1. **Employee Cost Calculations**: Calculate the total cost of employees including benefits and overhead
2. **Cost Analysis**: Analyze your current employee costs and identify optimization opportunities
3. **Financial Planning**: Help with budgeting and cost projections

Please provide more specific details about what you'd like to analyze, or share employee data for a comprehensive analysis.`;
  }
}
