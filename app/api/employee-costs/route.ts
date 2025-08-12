import { NextResponse } from 'next/server';

import { query } from '@/lib/database/connection';

import type { NextRequest} from 'next/server';

export async function GET() {
  try {
    // Get employee costs with latest period data
    const result = await query(`
      SELECT 
        employee_name,
        employee_id,
        period_start,
        period_end,
        total_hours,
        gross_pay,
        total_taxes,
        total_benefits,
        total_employer_burden,
        total_true_cost,
        average_hourly_rate,
        burden_rate,
        project_allocations
      FROM employee_costs
      ORDER BY total_true_cost DESC, employee_name ASC
    `);

    // Get summary statistics
    const summaryResult = await query(`
      SELECT 
        COUNT(DISTINCT employee_name) as total_employees,
        SUM(total_true_cost) as total_cost,
        AVG(total_true_cost) as average_cost,
        AVG(burden_rate) as average_burden_rate,
        SUM(total_hours) as total_hours
      FROM employee_costs
    `);

    // Get project breakdown
    const projectResult = await query(`
      SELECT 
        p.project_identifier,
        p.client_name,
        SUM(pd.true_cost) as total_cost,
        SUM(pd.hours_worked) as total_hours,
        COUNT(DISTINCT pd.employee_name) as employee_count
      FROM projects p
      LEFT JOIN payroll_data pd ON p.project_identifier = pd.project_identifier
      WHERE pd.true_cost IS NOT NULL
      GROUP BY p.project_identifier, p.client_name
      ORDER BY total_cost DESC
    `);

    return NextResponse.json({
      success: true,
      employee_costs: result,
      summary: summaryResult[0] || {
        total_employees: 0,
        total_cost: 0,
        average_cost: 0,
        average_burden_rate: 0,
        total_hours: 0
      },
      project_breakdown: projectResult
    });

  } catch (error) {
    console.error('Error fetching employee costs:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch employee costs',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { employee_name, period_start, period_end } = await request.json();

    // Get detailed cost breakdown for specific employee and period
    const detailResult = await query(`
      SELECT 
        pd.*,
        p.client_name,
        if_.filename as source_file
      FROM payroll_data pd
      LEFT JOIN projects p ON pd.project_identifier = p.project_identifier
      LEFT JOIN imported_files if_ ON pd.imported_file_id = if_.id
      WHERE pd.employee_name = $1
        AND (
          pd.work_date BETWEEN $2 AND $3
          OR pd.pay_period_start::date BETWEEN $2 AND $3
        )
      ORDER BY COALESCE(pd.work_date, pd.pay_period_start::date) DESC
    `, [employee_name, period_start, period_end]);

    return NextResponse.json({
      success: true,
      employee_name,
      period: { start: period_start, end: period_end },
      detail_records: detailResult
    });

  } catch (error) {
    console.error('Error fetching employee cost details:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch employee cost details'
    }, { status: 500 });
  }
}