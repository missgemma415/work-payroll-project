/**
 * Employee Cost Analysis Types for CEO Payroll Platform
 */

export interface EmployeeCostAnalysis {
  employee_name: string;
  employee_id?: string;
  total_hours: number;
  total_gross_pay: number;
  total_burden: number;
  total_cost: number;
  cost_per_hour: number;
  projects: string[];
}

export interface ProjectCostBreakdown {
  project_identifier: string;
  client_name: string;
  total_cost: number;
  total_hours: number;
  employee_count: number;
  profit_margin?: number;
}

export interface CostSummary {
  total_employees: number;
  total_monthly_cost: number;
  average_employee_cost: number;
  average_burden_rate: number;
  total_hours: number;
}