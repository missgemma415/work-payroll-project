import { NextResponse } from 'next/server';
import { z } from 'zod';
import { claudeClient } from '@/lib/ai/claude-client';
import { query } from '@/lib/database';
import type { CompanyMetrics } from '@/lib/ai/claude-client';

import type { NextRequest } from 'next/server';

// Request/Response schemas with Zod validation
const chatRequestSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(5000, 'Message too long'),
  user_id: z.string().uuid('Invalid user ID format').optional(),
  conversation_history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string()
  })).optional(),
});

const chatResponseSchema = z.object({
  response: z.string(),
  message_id: z.string().uuid(),
  created_at: z.string(),
  usage: z.object({
    input_tokens: z.number(),
    output_tokens: z.number(),
  }).optional(),
});


// Helper function to fetch current company metrics from database
async function fetchCompanyMetrics(): Promise<CompanyMetrics> {
  try {
    // Fetch employee count and total costs
    const metricsResult = await query<{
      employee_count: string;
      total_gross_pay: string;
      total_true_cost: string;
      avg_burden_rate: string;
    }>(`
      SELECT 
        COUNT(DISTINCT employee_name) as employee_count,
        SUM(gross_pay) as total_gross_pay,
        SUM(true_cost) as total_true_cost,
        AVG(burden_rate) as avg_burden_rate
      FROM payroll_data
      WHERE source_type != 'test'
    `, []);

    const metrics = metricsResult[0];
    
    // Calculate monthly average (assuming we have multiple pay periods)
    const monthlyResult = await query<{
      month: string;
      monthly_cost: string;
    }>(`
      SELECT 
        DATE_TRUNC('month', work_date) as month,
        SUM(true_cost) as monthly_cost
      FROM payroll_data
      WHERE source_type != 'test'
      GROUP BY DATE_TRUNC('month', work_date)
      ORDER BY month DESC
      LIMIT 1
    `, []);

    const monthlyData = monthlyResult[0];

    return {
      employeeCount: parseInt(metrics?.employee_count || '0'),
      totalMonthlyCost: parseFloat(monthlyData?.monthly_cost || '0'),
      totalWorkforceCost: parseFloat(metrics?.total_true_cost || '0'),
      averageBurdenRate: parseFloat(metrics?.avg_burden_rate || '0') * 100,
    };
  } catch (error) {
    console.error('Error fetching company metrics:', error);
    // Return default values if database query fails
    return {
      employeeCount: 0,
      totalMonthlyCost: 0,
      totalWorkforceCost: 0,
      averageBurdenRate: 0,
    };
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse and validate request body
    const body: unknown = await request.json();
    const { message, conversation_history = [] } = chatRequestSchema.parse(body);

    // Check if API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        {
          error: 'Claude API key not configured',
          message: 'ANTHROPIC_API_KEY environment variable is required',
        },
        { status: 500 }
      );
    }

    // Fetch current company metrics from database
    const companyData = await fetchCompanyMetrics();

    // Use Claude client to generate response with real data
    const claudeResponse = await claudeClient.chat(message, conversation_history, companyData);

    // Validate response
    const validatedResponse = chatResponseSchema.parse(claudeResponse);

    return NextResponse.json(validatedResponse);
  } catch (error) {
    console.error('Chat API error:', error);

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    // Handle other errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      {
        error: 'Chat request failed',
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve conversation history (placeholder)
export function GET(): NextResponse {
  return NextResponse.json({
    message: 'CEO dashboard chat history will be implemented with full integration',
    conversations: [],
  });
}