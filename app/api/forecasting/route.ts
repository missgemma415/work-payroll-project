import { NextResponse } from 'next/server';
import { z } from 'zod';
import type { NextRequest } from 'next/server';

// Zod validation schemas matching FastAPI Pydantic models
const forecastRequestSchema = z.object({
  forecast_horizon_months: z.number().int().min(1).max(24).default(6),
  employees: z.array(z.string()).optional(),
  model_preference: z.enum(['neuralprophet', 'timegpt', 'ensemble']).default('ensemble'),
  include_seasonality: z.boolean().default(true),
  include_confidence_intervals: z.boolean().default(true),
});

const employeeCostForecastSchema = z.object({
  employee_name: z.string(),
  employee_id: z.string().nullable().optional(),
  forecast_period_start: z.string(),
  forecast_period_end: z.string(),
  predicted_total_hours: z.number(),
  predicted_gross_pay: z.number(),
  predicted_total_taxes: z.number(),
  predicted_total_benefits: z.number(),
  predicted_total_employer_burden: z.number(),
  predicted_total_true_cost: z.number(),
  predicted_average_hourly_rate: z.number(),
  predicted_burden_rate: z.number(),
  confidence_interval_lower: z.number(),
  confidence_interval_upper: z.number(),
  model_used: z.string(),
});

const forecastResponseSchema = z.object({
  success: z.boolean(),
  forecast_data: z.array(employeeCostForecastSchema),
  summary: z.record(z.string(), z.any()),
  model_performance: z.record(z.string(), z.number()),
  generated_at: z.string(),
});

// FastAPI microservice configuration
const FASTAPI_URL = process.env.FASTAPI_FORECASTING_URL || 'http://localhost:8000';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse and validate request body with existing pattern
    const body: unknown = await request.json();
    const validatedRequest = forecastRequestSchema.parse(body);

    // Check if FastAPI service is available
    try {
      const healthCheck = await fetch(`${FASTAPI_URL}/health`, {
        method: 'GET',
      });
      
      if (!healthCheck.ok) {
        throw new Error('FastAPI forecasting service unavailable');
      }
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'Neural forecasting service unavailable',
          message: 'Please try again later or contact support',
          fallback_available: true,
        },
        { status: 503 }
      );
    }

    // Call FastAPI microservice
    const forecastResponse = await fetch(`${FASTAPI_URL}/api/forecast/employee-costs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Request-Source': 'next-js-dashboard',
      },
      body: JSON.stringify(validatedRequest),
    });

    if (!forecastResponse.ok) {
      const errorData = await forecastResponse.json().catch(() => ({}));
      
      return NextResponse.json(
        {
          success: false,
          error: 'Neural forecasting failed',
          details: errorData.detail || 'Unknown forecasting error',
          status_code: forecastResponse.status,
        },
        { status: 500 }
      );
    }

    // Validate and transform response
    const rawForecastData = await forecastResponse.json();
    const validatedResponse = forecastResponseSchema.parse(rawForecastData);

    // Round all currency values for executive presentation (matching existing pattern)
    const executiveForecastData = validatedResponse.forecast_data.map(forecast => ({
      ...forecast,
      predicted_gross_pay: Math.round(forecast.predicted_gross_pay),
      predicted_total_taxes: Math.round(forecast.predicted_total_taxes),
      predicted_total_benefits: Math.round(forecast.predicted_total_benefits),
      predicted_total_employer_burden: Math.round(forecast.predicted_total_employer_burden),
      predicted_total_true_cost: Math.round(forecast.predicted_total_true_cost),
      predicted_average_hourly_rate: Math.round(forecast.predicted_average_hourly_rate * 100) / 100,
      confidence_interval_lower: Math.round(forecast.confidence_interval_lower),
      confidence_interval_upper: Math.round(forecast.confidence_interval_upper),
    }));

    // Executive summary with rounded totals
    const executiveSummary = {
      ...validatedResponse.summary,
      total_predicted_monthly_cost: Math.round(validatedResponse.summary.total_predicted_monthly_cost || 0),
      forecast_accuracy_note: 'Predictions based on historical $596K monthly baseline with 23.7% burden rate',
      confidence_level: validatedResponse.model_performance ? 'High' : 'Medium',
    };

    return NextResponse.json({
      success: true,
      forecast_data: executiveForecastData,
      summary: executiveSummary,
      model_performance: validatedResponse.model_performance,
      generated_at: validatedResponse.generated_at,
      executive_insights: {
        baseline_comparison: `Current monthly: $596,000 | Forecasted: $${Math.round(validatedResponse.summary.total_predicted_monthly_cost || 0).toLocaleString()}`,
        workforce_size: `${validatedResponse.summary.total_employees_forecast} employees analyzed`,
        model_used: validatedRequest.model_preference,
        forecast_horizon: `${validatedRequest.forecast_horizon_months} months`,
      },
    });

  } catch (error) {
    console.error('Forecasting API error:', error);

    // Handle Zod validation errors with existing pattern
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: 'Request validation failed',
          details: error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    // Handle other errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown forecasting error';

    return NextResponse.json(
      {
        success: false,
        error: 'Neural forecasting request failed',
        message: errorMessage,
        support_note: 'Executive dashboard forecasting is temporarily unavailable',
      },
      { status: 500 }
    );
  }
}

// GET endpoint for forecast status and available models
export async function GET(): Promise<NextResponse> {
  try {
    // Check FastAPI service status
    const serviceStatus = await fetch(`${FASTAPI_URL}/health`, {
      method: 'GET',
    }).catch(() => null);

    const modelsStatus = await fetch(`${FASTAPI_URL}/api/forecast/models`, {
      method: 'GET',
    }).catch(() => null);

    return NextResponse.json({
      message: 'Neural Forecasting API for Executive Dashboard',
      service_status: serviceStatus?.ok ? 'healthy' : 'unavailable',
      available_models: modelsStatus?.ok ? await modelsStatus.json() : null,
      current_baseline: {
        monthly_cost: 596000,
        employees: 24,
        burden_rate: 23.7,
        last_updated: '2024-12-31',
      },
      forecasting_capabilities: [
        'NeuralProphet pattern analysis',
        'TimeGPT zero-shot forecasting', 
        'Ensemble model predictions',
        'Executive confidence intervals',
        'Mexican market calibration',
      ],
    });

  } catch (error) {
    return NextResponse.json(
      {
        message: 'Neural Forecasting API status check failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}