import { NextResponse } from 'next/server';
import { z } from 'zod';
import { claudeClient } from '@/lib/ai/claude-client';
import { query } from '@/lib/database';
// Enhanced chat API with MCP integration
import type { NextRequest } from 'next/server';

// Enhanced request schema with context and data source
const enhancedChatRequestSchema = z.object({
  message: z.string().min(1).max(5000),
  context: z.object({
    activeMetric: z.enum(['workforce', 'investment', 'burden', 'data-sources']).optional(),
    selectedEmployee: z.string().optional(),
    selectedPeriod: z.object({
      start: z.string(),
      end: z.string()
    }).optional(),
    currentView: z.string().optional()
  }).optional(),
  dataSource: z.enum(['all', 'database', 'quickbooks', 'paychex']).default('all'),
  conversation_history: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string()
  })).optional(),
  requestVisualization: z.boolean().optional(),
  requestForecast: z.boolean().optional()
});

// Helper function to fetch real-time QuickBooks data
async function fetchQuickBooksData(): Promise<unknown> {
  try {
    const response = await fetch('http://localhost:8001/api/employees/default', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      console.warn('QuickBooks service unavailable');
      return null;
    }

    const data = await response.json();
    return {
      source: 'quickbooks',
      employeeCount: data.employees?.length || 0,
      lastSync: data.last_sync,
      data: data.employees
    };
  } catch (error) {
    console.error('Error fetching QuickBooks data:', error);
    return null;
  }
}

// Helper function to fetch Paychex data (simulated for now)
async function fetchPaychexData(context?: any): Promise<any> {
  try {
    // Query latest Paychex data from database
    const paychexData = await query(`
      SELECT 
        COUNT(DISTINCT employee_name) as employee_count,
        SUM(gross_pay) as total_gross,
        SUM(true_cost) as total_cost,
        MAX(pay_period_end) as latest_period
      FROM payroll_data
      WHERE source_type = 'paychex'
        AND pay_period_end >= CURRENT_DATE - INTERVAL '30 days'
    `, []);

    const firstRecord = paychexData[0] as { employee_count?: number; total_gross?: number; total_cost?: number; latest_period?: string } || {};
    return {
      source: 'paychex',
      employeeCount: firstRecord.employee_count || 0,
      totalGross: firstRecord.total_gross || 0,
      totalCost: firstRecord.total_cost || 0,
      latestPeriod: firstRecord.latest_period
    };
  } catch (error) {
    console.error('Error fetching Paychex data:', error);
    return null;
  }
}

// Helper function to generate forecasts
async function generateForecast(params: any): Promise<any> {
  try {
    const response = await fetch('http://localhost:8000/api/forecast/employee-costs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        horizon: params.horizon || 6,
        frequency: params.frequency || 'monthly',
        include_confidence_intervals: true
      })
    });

    if (!response.ok) {
      console.warn('Forecasting service unavailable');
      return null;
    }

    const forecastData = await response.json();
    return {
      source: 'forecast',
      predictions: forecastData.predictions,
      confidence: forecastData.confidence_intervals,
      metrics: forecastData.metrics
    };
  } catch (error) {
    console.error('Error generating forecast:', error);
    return null;
  }
}

// Enhanced company metrics with context
async function fetchEnhancedMetrics(context?: any, dataSource: string = 'all'): Promise<any> {
  const metrics: any = {
    database: null,
    quickbooks: null,
    paychex: null,
    combined: {}
  };

  // Fetch from database
  if (dataSource === 'all' || dataSource === 'database') {
    try {
      const dbMetrics = await query(`
        SELECT 
          COUNT(DISTINCT employee_name) as employee_count,
          SUM(gross_pay) as total_gross_pay,
          SUM(true_cost) as total_true_cost,
          AVG(burden_rate) as avg_burden_rate
        FROM payroll_data
        WHERE source_type != 'test'
      `, []);

      const monthlyMetrics = await query(`
        SELECT 
          DATE_TRUNC('month', COALESCE(work_date, pay_period_end)) as month,
          SUM(true_cost) as monthly_cost,
          COUNT(DISTINCT employee_name) as employee_count
        FROM payroll_data
        WHERE source_type != 'test'
        GROUP BY DATE_TRUNC('month', COALESCE(work_date, pay_period_end))
        ORDER BY month DESC
        LIMIT 6
      `, []);

      metrics.database = {
        employeeCount: parseInt(dbMetrics[0]?.employee_count || '0'),
        totalCost: parseFloat(dbMetrics[0]?.total_true_cost || '0'),
        avgBurdenRate: parseFloat(dbMetrics[0]?.avg_burden_rate || '0'),
        monthlyTrend: monthlyMetrics
      };
    } catch (error) {
      console.error('Database metrics error:', error);
    }
  }

  // Fetch from QuickBooks
  if (dataSource === 'all' || dataSource === 'quickbooks') {
    metrics.quickbooks = await fetchQuickBooksData(context);
  }

  // Fetch from Paychex
  if (dataSource === 'all' || dataSource === 'paychex') {
    metrics.paychex = await fetchPaychexData(context);
  }

  // Combine metrics
  metrics.combined = {
    totalEmployees: (metrics.database?.employeeCount || 0) + 
                   (metrics.quickbooks?.employeeCount || 0),
    totalCost: metrics.database?.totalCost || 0,
    avgBurdenRate: metrics.database?.avgBurdenRate || 0,
    dataSources: {
      database: metrics.database !== null,
      quickbooks: metrics.quickbooks !== null,
      paychex: metrics.paychex !== null
    }
  };

  return metrics;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const validatedData = enhancedChatRequestSchema.parse(body);

    // Fetch metrics based on context and data source
    const metrics = await fetchEnhancedMetrics(
      validatedData.context, 
      validatedData.dataSource
    );

    // Generate forecast if requested
    let forecastData = null;
    if (validatedData.requestForecast) {
      forecastData = await generateForecast({
        horizon: 6,
        frequency: 'monthly'
      });
    }

    // Prepare visualization data if requested
    let visualData = null;
    if (validatedData.requestVisualization && metrics.database?.monthlyTrend) {
      visualData = {
        type: 'line',
        data: metrics.database.monthlyTrend.map((item: any) => ({
          month: new Date(item.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          cost: Math.round(item.monthly_cost),
          employees: item.employee_count
        }))
      };
    }

    // Build enhanced context for Claude
    const enhancedContext = `
You are an executive AI assistant with real-time access to multiple payroll data sources.

CURRENT CONTEXT:
- Active View: ${validatedData.context?.activeMetric || 'Dashboard'}
- Selected Employee: ${validatedData.context?.selectedEmployee || 'None'}
- Data Source: ${validatedData.dataSource}

REAL-TIME METRICS:
${JSON.stringify(metrics, null, 2)}

${forecastData ? `FORECAST DATA:\n${JSON.stringify(forecastData, null, 2)}` : ''}

CAPABILITIES:
- Access to live database with ${metrics.database?.employeeCount || 0} employees
- QuickBooks integration: ${metrics.quickbooks ? 'Connected' : 'Unavailable'}
- Paychex data: ${metrics.paychex ? 'Available' : 'Limited'}
- Forecasting service: ${forecastData ? 'Active' : 'Available on request'}
- Visualization: ${visualData ? 'Data prepared' : 'Available on request'}

When responding:
1. Use real-time data from the specified source
2. If QuickBooks or Paychex data is requested but unavailable, mention this
3. Provide specific numbers and calculations
4. Suggest visualizations when appropriate
5. Recommend forecasts for future-looking questions
6. Be concise but thorough for executive audiences
`;

    // Generate response with Claude
    const response = await claudeClient.generateResponse(
      validatedData.message,
      {
        employeeCount: metrics.combined.totalEmployees,
        totalMonthlyCost: metrics.database?.monthlyTrend?.[0]?.monthly_cost || 0,
        totalWorkforceCost: metrics.combined.totalCost,
        averageBurdenRate: metrics.combined.avgBurdenRate * 100
      },
      validatedData.conversation_history,
      enhancedContext
    );

    return NextResponse.json({
      response: response.content,
      message_id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      dataSource: validatedData.dataSource,
      dataType: validatedData.context?.activeMetric,
      visualData: visualData,
      forecastData: forecastData ? {
        summary: `Forecast generated for next 6 months`,
        data: forecastData
      } : null,
      realTimeUpdate: metrics.quickbooks !== null || metrics.paychex !== null,
      usage: response.usage
    });

  } catch (error) {
    console.error('Enhanced chat error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json({
        error: 'Invalid request',
        details: error.errors
      }, { status: 400 });
    }

    return NextResponse.json({
      error: 'Failed to process chat request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}