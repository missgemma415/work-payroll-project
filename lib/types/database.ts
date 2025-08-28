/**
 * Database Result Types for CEO Payroll Analysis
 * Properly typed database query results
 */

// Database query result types
export interface EmployeeCostRow {
  employee_name: string;
  employee_id: string | null;
  period_start: string;
  period_end: string;
  total_hours: number;
  gross_pay: number;
  total_taxes: number;
  total_benefits: number;
  total_employer_burden: number;
  total_true_cost: number;
  average_hourly_rate: number;
  burden_rate: number;
  project_allocations: Record<string, number> | null;
}

export interface EmployeeCostSummaryRow {
  total_employees: number;
  total_cost: number;
  average_cost: number;
  average_burden_rate: number;
  total_hours: number;
}

export interface ProjectCostRow {
  project_identifier: string;
  client_name: string | null;
  total_cost: number;
  total_hours: number;
  employee_count: number;
  avg_burden_rate: number | null;
}

export interface PayrollDataDetailRow {
  employee_name: string;
  project_identifier: string | null;
  client_name: string | null;
  work_date: string | null;
  pay_period_start: string | null;
  pay_period_end: string | null;
  hours_worked: number | null;
  hourly_rate: number | null;
  gross_pay: number | null;
  federal_tax: number | null;
  state_tax: number | null;
  fica_tax: number | null;
  medicare_tax: number | null;
  employer_fica: number | null;
  employer_medicare: number | null;
  employer_futa: number | null;
  employer_suta: number | null;
  benefits_cost: number | null;
  bonuses: number | null;
  total_burden: number | null;
  true_cost: number | null;
  burden_rate: number | null;
  source_type: string | null;
  filename: string | null;
}

export interface ImportedFileRow {
  filename: string;
  file_type: string;
  status: string;
  records_processed: number | null;
  error_message: string | null;
  processed_at: string | null;
  created_at: string;
}

export interface ProcessingSummaryRow {
  total_files: number;
  completed_files: number;
  failed_files: number;
  processing_files: number;
  total_records: number;
}

export interface FileStatsRow {
  total_files: number;
  completed_files: number;
  failed_files: number;
  total_records: number;
}

export interface SummaryStatsRow {
  total_employees: number;
  total_monthly_cost: number;
  avg_employee_cost: number;
  avg_burden_rate: number;
  total_hours: number;
  total_projects: number;
}

// Core entity types for repository pattern
export interface User {
  id: string;
  email: string;
  name: string;
  organization_id?: string;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: string;
  name: string;
  domain?: string;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  title?: string;
  messages?: unknown[];
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  name: string;
  employee_id?: string;
  organization_id?: string;
  created_at: string;
  updated_at: string;
}

// Generic database result type
export type DatabaseRow = Record<string, string | number | boolean | null>;