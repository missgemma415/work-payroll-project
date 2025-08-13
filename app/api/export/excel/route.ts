import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

import { query } from '@/lib/database';
import type { 
  EmployeeCostRow, 
  ProjectCostRow,
  PayrollDataDetailRow,
  SummaryStatsRow,
  FileStatsRow 
} from '@/lib/types/database';

import type { NextRequest} from 'next/server';

export async function GET(): Promise<NextResponse> {
  try {
    // Create a new workbook
    const wb = XLSX.utils.book_new();

    // Sheet 1: Employee Summary
    const employeeCosts = await query<EmployeeCostRow & { burden_percentage: number }>(`
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
        burden_rate * 100 as burden_percentage,
        project_allocations
      FROM employee_costs
      ORDER BY total_true_cost DESC
    `, []);

    const employeeData = employeeCosts.map((row) => ({
      'Employee Name': row.employee_name,
      'Employee ID': row.employee_id ?? '',
      'Period Start': row.period_start,
      'Period End': row.period_end,
      'Total Hours': row.total_hours,
      'Gross Pay': row.gross_pay,
      'Total Taxes': row.total_taxes,
      'Benefits Cost': row.total_benefits,
      'Employer Burden': row.total_employer_burden,
      'True Total Cost': row.total_true_cost,
      'Hourly Rate': row.average_hourly_rate,
      'Burden Rate %': row.burden_percentage ? parseFloat(row.burden_percentage.toString()).toFixed(2) : '0.00'
    }));

    const ws1 = XLSX.utils.json_to_sheet(employeeData);
    XLSX.utils.book_append_sheet(wb, ws1, 'Employee Summary');

    // Sheet 2: Project Costs
    const projectCosts = await query<ProjectCostRow & { avg_burden_rate: number | null }>(`
      SELECT 
        p.project_identifier,
        p.client_name,
        COALESCE(SUM(pd.true_cost), 0) as total_cost,
        COALESCE(SUM(pd.hours_worked), 0) as total_hours,
        COUNT(DISTINCT pd.employee_name) as employee_count,
        COALESCE(AVG(pd.burden_rate) * 100, 0) as avg_burden_rate
      FROM projects p
      LEFT JOIN payroll_data pd ON p.project_identifier = pd.project_identifier
      WHERE pd.true_cost IS NOT NULL
      GROUP BY p.project_identifier, p.client_name
      ORDER BY total_cost DESC
    `, []);

    const projectData = projectCosts.map((row) => ({
      'Project ID': row.project_identifier,
      'Client Name': row.client_name ?? row.project_identifier,
      'Total Cost': row.total_cost,
      'Total Hours': row.total_hours,
      'Employee Count': row.employee_count,
      'Avg Burden Rate %': row.avg_burden_rate ? parseFloat(row.avg_burden_rate.toString()).toFixed(2) : '0.00'
    }));

    const ws2 = XLSX.utils.json_to_sheet(projectData);
    XLSX.utils.book_append_sheet(wb, ws2, 'Project Costs');

    // Sheet 3: Detailed Payroll Data
    const detailData = await query<PayrollDataDetailRow & { burden_percentage: number | null; filename: string | null }>(`
      SELECT 
        pd.employee_name,
        pd.project_identifier,
        p.client_name,
        pd.work_date,
        pd.pay_period_start,
        pd.pay_period_end,
        pd.hours_worked,
        pd.hourly_rate,
        pd.gross_pay,
        pd.federal_tax,
        pd.state_tax,
        pd.fica_tax,
        pd.medicare_tax,
        pd.employer_fica,
        pd.employer_medicare,
        pd.employer_futa,
        pd.employer_suta,
        pd.benefits_cost,
        pd.bonuses,
        pd.total_burden,
        pd.true_cost,
        COALESCE(pd.burden_rate * 100, 0) as burden_percentage,
        pd.source_type,
        if_.filename
      FROM payroll_data pd
      LEFT JOIN projects p ON pd.project_identifier = pd.project_identifier
      LEFT JOIN imported_files if_ ON pd.imported_file_id = if_.id
      ORDER BY pd.employee_name, pd.work_date DESC, pd.pay_period_start DESC
    `, []);

    const detailRows = detailData.map((row) => ({
      'Employee Name': row.employee_name,
      'Project ID': row.project_identifier ?? '',
      'Client Name': row.client_name ?? '',
      'Work Date': row.work_date ?? '',
      'Pay Period Start': row.pay_period_start ?? '',
      'Pay Period End': row.pay_period_end ?? '',
      'Hours': row.hours_worked ?? 0,
      'Hourly Rate': row.hourly_rate ?? 0,
      'Gross Pay': row.gross_pay ?? 0,
      'Federal Tax': row.federal_tax ?? 0,
      'State Tax': row.state_tax ?? 0,
      'FICA Tax': row.fica_tax ?? 0,
      'Medicare Tax': row.medicare_tax ?? 0,
      'Employer FICA': row.employer_fica ?? 0,
      'Employer Medicare': row.employer_medicare ?? 0,
      'Employer FUTA': row.employer_futa ?? 0,
      'Employer SUTA': row.employer_suta ?? 0,
      'Benefits Cost': row.benefits_cost ?? 0,
      'Bonuses': row.bonuses ?? 0,
      'Total Burden': row.total_burden ?? 0,
      'True Cost': row.true_cost ?? 0,
      'Burden Rate %': row.burden_percentage ? parseFloat(row.burden_percentage.toString()).toFixed(2) : '0.00',
      'Source Type': row.source_type ?? '',
      'Source File': row.filename ?? ''
    }));

    const ws3 = XLSX.utils.json_to_sheet(detailRows);
    XLSX.utils.book_append_sheet(wb, ws3, 'Detailed Data');

    // Sheet 4: Summary Statistics
    const summaryStats = await query<SummaryStatsRow>(`
      SELECT 
        COUNT(DISTINCT ec.employee_name) as total_employees,
        COALESCE(SUM(ec.total_true_cost), 0) as total_monthly_cost,
        COALESCE(AVG(ec.total_true_cost), 0) as avg_employee_cost,
        COALESCE(AVG(ec.burden_rate) * 100, 0) as avg_burden_rate,
        COALESCE(SUM(ec.total_hours), 0) as total_hours,
        (SELECT COUNT(DISTINCT project_identifier) FROM projects) as total_projects
      FROM employee_costs ec
    `, []);

    const fileStats = await query<FileStatsRow>(`
      SELECT 
        COUNT(*) as total_files,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_files,
        COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_files,
        COALESCE(SUM(records_processed), 0) as total_records
      FROM imported_files
    `, []);

    const summaryData = [
      { 'Metric': 'Total Employees', 'Value': summaryStats[0]?.total_employees ?? 0 },
      { 'Metric': 'Total Monthly Cost', 'Value': summaryStats[0]?.total_monthly_cost ?? 0 },
      { 'Metric': 'Average Employee Cost', 'Value': summaryStats[0]?.avg_employee_cost ?? 0 },
      { 'Metric': 'Average Burden Rate %', 'Value': summaryStats[0]?.avg_burden_rate ? parseFloat(summaryStats[0].avg_burden_rate.toString()).toFixed(2) : '0.00' },
      { 'Metric': 'Total Hours', 'Value': summaryStats[0]?.total_hours ?? 0 },
      { 'Metric': 'Total Projects', 'Value': summaryStats[0]?.total_projects ?? 0 },
      { 'Metric': 'Files Processed', 'Value': fileStats[0]?.completed_files ?? 0 },
      { 'Metric': 'Total Records', 'Value': fileStats[0]?.total_records ?? 0 }
    ];

    const ws4 = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, ws4, 'Summary');

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' }) as Buffer;

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const filename = `CEO_Payroll_Analysis_${timestamp}.xlsx`;

    // Return the Excel file
    return new NextResponse(excelBuffer as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': (excelBuffer).length.toString()
      }
    });

  } catch (error) {
    console.error('Error generating Excel export:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to generate Excel export',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json() as Record<string, unknown>;
    
    // TODO: Implement custom export with filters
    // For now, redirect to GET
    console.warn('Custom export request:', body);
    return NextResponse.redirect(new URL('/api/export/excel', request.url));
    
  } catch {
    return NextResponse.json({
      success: false,
      error: 'Custom export not yet implemented'
    }, { status: 501 });
  }
}