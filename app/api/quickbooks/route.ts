import { NextResponse } from 'next/server';
import { z } from 'zod';
import type { NextRequest } from 'next/server';

// Zod validation schemas matching QuickBooks FastAPI Pydantic models
const authRequestSchema = z.object({
  state: z.string().optional(),
});

const syncResponseSchema = z.object({
  success: z.boolean(),
  records_processed: z.number(),
  errors: z.array(z.string()).default([]),
  summary: z.record(z.string(), z.any()),
  sync_duration: z.number(),
  last_sync: z.string(),
});

// Employee sync schema for future use
// const employeeSyncSchema = z.object({
//   quickbooks_id: z.string(),
//   employee_name: z.string(),
//   active: z.boolean(),
//   hire_date: z.string().nullable().optional(),
//   email: z.string().nullable().optional(),
//   phone: z.string().nullable().optional(),
//   hourly_rate: z.number().nullable().optional(),
//   salary: z.number().nullable().optional(),
//   last_sync: z.string(),
// });

// QuickBooks service configuration
const QUICKBOOKS_SERVICE_URL = process.env.QUICKBOOKS_SERVICE_URL || 'http://localhost:8001';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const realmId = searchParams.get('realm_id');

    // Check QuickBooks service health
    try {
      const healthCheck = await fetch(`${QUICKBOOKS_SERVICE_URL}/health`, {
        method: 'GET',
      });
      
      if (!healthCheck.ok) {
        return NextResponse.json(
          {
            success: false,
            error: 'QuickBooks integration service unavailable',
            message: 'Please try again later',
          },
          { status: 503 }
        );
      }
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: 'QuickBooks service connection failed',
          message: 'Integration service is temporarily unavailable',
        },
        { status: 503 }
      );
    }

    // Handle different GET actions
    switch (action) {
      case 'employees':
        if (!realmId) {
          return NextResponse.json(
            { success: false, error: 'realm_id parameter required' },
            { status: 400 }
          );
        }
        
        const employeesResponse = await fetch(`${QUICKBOOKS_SERVICE_URL}/api/employees/${realmId}`, {
          method: 'GET',
          headers: { 'X-Request-Source': 'next-js-dashboard' },
        });

        if (!employeesResponse.ok) {
          const errorData = await employeesResponse.json().catch(() => ({}));
          return NextResponse.json(
            {
              success: false,
              error: 'Failed to fetch QuickBooks employees',
              details: errorData.detail || 'Unknown error',
            },
            { status: employeesResponse.status }
          );
        }

        const employeesData = await employeesResponse.json();
        
        return NextResponse.json({
          success: true,
          employees: employeesData.employees,
          summary: {
            total_employees: employeesData.total_count,
            active_employees: employeesData.active_count,
            last_sync: employeesData.last_sync,
            integration_status: 'connected'
          }
        });

      case 'company_info':
        if (!realmId) {
          return NextResponse.json(
            { success: false, error: 'realm_id parameter required' },
            { status: 400 }
          );
        }

        const companyResponse = await fetch(`${QUICKBOOKS_SERVICE_URL}/api/companies/${realmId}/info`, {
          method: 'GET',
          headers: { 'X-Request-Source': 'next-js-dashboard' },
        });

        if (!companyResponse.ok) {
          const errorData = await companyResponse.json().catch(() => ({}));
          return NextResponse.json(
            {
              success: false,
              error: 'Failed to fetch company information',
              details: errorData.detail || 'Unknown error',
            },
            { status: companyResponse.status }
          );
        }

        return NextResponse.json(await companyResponse.json());

      default:
        // Return QuickBooks integration status
        return NextResponse.json({
          message: 'QuickBooks Online Integration API',
          service_status: 'healthy',
          integration_capabilities: [
            'OAuth 2.0 authentication',
            'Employee data synchronization',
            'Company information retrieval',
            'Payroll item mapping',
            'Real-time data sync',
          ],
          current_integration: {
            sdk: 'python-quickbooks v0.9.12',
            oauth: 'intuit-oauth v1.2.6',
            last_updated: '2025-08-28',
          },
          fortune_500_features: [
            'Enterprise-grade OAuth security',
            'Rate limit compliance (500 req/min)',
            'Automated token refresh',
            'Audit logging and monitoring',
            'PostgreSQL data persistence',
          ],
        });
    }

  } catch (error) {
    console.error('QuickBooks API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'QuickBooks integration request failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'initialize_auth':
        // Initialize OAuth flow
        const authBody = await request.json();
        const validatedAuth = authRequestSchema.parse(authBody);

        const authResponse = await fetch(`${QUICKBOOKS_SERVICE_URL}/api/auth/initialize`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Request-Source': 'next-js-dashboard',
          },
          body: JSON.stringify(validatedAuth),
        });

        if (!authResponse.ok) {
          const errorData = await authResponse.json().catch(() => ({}));
          return NextResponse.json(
            {
              success: false,
              error: 'OAuth initialization failed',
              details: errorData.detail || 'Unknown error',
            },
            { status: authResponse.status }
          );
        }

        return NextResponse.json(await authResponse.json());

      case 'sync_employees':
        // Sync employee data from QuickBooks
        const realmId = searchParams.get('realm_id');
        if (!realmId) {
          return NextResponse.json(
            { success: false, error: 'realm_id parameter required' },
            { status: 400 }
          );
        }

        const syncResponse = await fetch(`${QUICKBOOKS_SERVICE_URL}/api/sync/employees/${realmId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Request-Source': 'next-js-dashboard',
          },
        });

        if (!syncResponse.ok) {
          const errorData = await syncResponse.json().catch(() => ({}));
          return NextResponse.json(
            {
              success: false,
              error: 'Employee synchronization failed',
              details: errorData.detail || 'Unknown error',
              status_code: syncResponse.status,
            },
            { status: 500 }
          );
        }

        const syncData = await syncResponse.json();
        const validatedSync = syncResponseSchema.parse(syncData);

        // Format response for executive dashboard
        return NextResponse.json({
          success: validatedSync.success,
          sync_results: {
            employees_processed: validatedSync.records_processed,
            sync_duration: `${validatedSync.sync_duration.toFixed(2)} seconds`,
            success_rate: validatedSync.errors.length === 0 ? '100%' : 
              `${Math.round((1 - validatedSync.errors.length / validatedSync.records_processed) * 100)}%`,
            last_sync: validatedSync.last_sync,
          },
          summary: validatedSync.summary,
          errors: validatedSync.errors.length > 0 ? validatedSync.errors : undefined,
          executive_insights: {
            integration_status: validatedSync.success ? 'Operational' : 'Requires Attention',
            data_freshness: 'Real-time',
            next_scheduled_sync: 'On-demand',
          },
        });

      case 'oauth_callback':
        // Handle OAuth callback
        const callbackBody = await request.json();
        const { code, realm_id, state } = callbackBody;

        if (!code || !realm_id) {
          return NextResponse.json(
            { success: false, error: 'OAuth callback parameters missing' },
            { status: 400 }
          );
        }

        const callbackResponse = await fetch(`${QUICKBOOKS_SERVICE_URL}/api/auth/callback`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Request-Source': 'next-js-dashboard',
          },
          body: JSON.stringify({
            code,
            realm_id,
            state: state || 'payroll-analytics',
          }),
        });

        if (!callbackResponse.ok) {
          const errorData = await callbackResponse.json().catch(() => ({}));
          return NextResponse.json(
            {
              success: false,
              error: 'OAuth callback processing failed',
              details: errorData.detail || 'Unknown error',
            },
            { status: callbackResponse.status }
          );
        }

        const callbackData = await callbackResponse.json();
        
        return NextResponse.json({
          success: true,
          message: 'QuickBooks integration completed successfully',
          integration_details: {
            realm_id: callbackData.realm_id,
            expires_at: callbackData.expires_at,
            status: 'Connected',
            next_steps: [
              'Employee data synchronization available',
              'Real-time payroll analytics enabled',
              'Executive dashboard integration active',
            ],
          },
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action parameter' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('QuickBooks POST error:', error);

    // Handle Zod validation errors
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

    return NextResponse.json(
      {
        success: false,
        error: 'QuickBooks integration request failed',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}