/**
 * TypeScript Types for CEO Payroll Analysis Platform
 * Clean, project-centric types for data integration and analysis
 */

// ============================================================================
// DATABASE SCHEMA TYPES
// ============================================================================

export interface Organization {
  id: string;
  name: string;
  settings: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

export interface User {
  id: string;
  organization_id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'viewer';
  settings: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

export interface Project {
  id: string;
  project_identifier: string;
  client_name: string;
  project_name: string;
  hourly_rate: number;
  status: 'active' | 'completed' | 'on_hold' | 'cancelled';
  start_date?: Date;
  end_date?: Date;
  budget?: number;
  description?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ImportedFile {
  id: string;
  organization_id: string;
  filename: string;
  file_type: 'springahead' | 'paychex' | 'quickbooks' | 'generic';
  file_size: number;
  records_imported: number;
  import_status: 'pending' | 'processing' | 'completed' | 'failed';
  error_message?: string;
  uploaded_by: string;
  created_at: Date;
  processed_at?: Date;
}

export interface PayrollData {
  id: string;
  organization_id: string;
  imported_file_id?: string;
  source_system: 'springahead' | 'paychex' | 'quickbooks';
  employee_name: string;
  employee_id?: string;
  project_identifier: string;
  date: Date;
  hours_worked?: number;
  hourly_rate?: number;
  gross_pay?: number;
  taxes?: number;
  benefits?: number;
  net_pay?: number;
  raw_data: Record<string, unknown>;
  created_at: Date;
}

export interface EmployeeCost {
  id: string;
  organization_id: string;
  employee_name: string;
  employee_id?: string;
  project_identifier: string;
  period_start: Date;
  period_end: Date;
  total_hours: number;
  total_gross_pay: number;
  total_burden: number;
  total_cost: number;
  cost_per_hour: number;
  created_at: Date;
  updated_at: Date;
}

export interface ActivityLog {
  id: string;
  organization_id: string;
  user_id?: string;
  action: string;
  resource_type: string;
  resource_id: string;
  details: Record<string, unknown>;
  created_at: Date;
}

export interface Migration {
  id: string;
  name: string;
  executed_at: Date;
}

// ============================================================================
// FILE PROCESSING TYPES (extends existing parser types)
// ============================================================================

export interface SpringAheadRecord {
  employee_name: string;
  employee_id?: string;
  date: string;
  project_identifier: string;
  hours: number;
  hourly_rate?: number;
  task_description?: string;
}

export interface PaychexRecord {
  employee_name: string;
  employee_id?: string;
  pay_period_start: string;
  pay_period_end: string;
  gross_pay: number;
  federal_tax: number;
  state_tax: number;
  fica_tax: number;
  medicare_tax: number;
  other_deductions: number;
  benefits_cost: number;
  bonuses: number;
  net_pay: number;
}

export interface QuickBooksRecord {
  employee_name: string;
  employee_id?: string;
  date: string;
  project_identifier: string;
  expense_type: 'travel' | 'supplies' | 'equipment' | 'training' | 'other';
  amount: number;
  description?: string;
  vendor?: string;
  receipt_number?: string;
}

export interface ParsedData {
  springahead?: SpringAheadRecord[];
  paychex?: PaychexRecord[];
  quickbooks?: QuickBooksRecord[];
  raw_data?: unknown[];
  errors?: string[];
}

// ============================================================================
// ANALYSIS & REPORTING TYPES
// ============================================================================

export interface ProjectCostSummary {
  project_identifier: string;
  client_name: string;
  project_name: string;
  hourly_rate: number;
  period_start: Date;
  period_end: Date;
  total_hours: number;
  total_revenue: number;
  total_labor_cost: number;
  total_expenses: number;
  total_cost: number;
  profit_margin: number;
  profit_amount: number;
  employees: EmployeeCostSummary[];
}

export interface EmployeeCostSummary {
  employee_name: string;
  employee_id?: string;
  total_hours: number;
  average_hourly_rate: number;
  total_gross_pay: number;
  total_burden: number;
  total_cost: number;
  cost_per_hour: number;
}

export interface CEODashboardData {
  summary: {
    total_projects: number;
    active_projects: number;
    total_employees: number;
    total_revenue: number;
    total_costs: number;
    profit_margin: number;
  };
  top_projects: ProjectCostSummary[];
  cost_trends: MonthlyTrend[];
  employee_utilization: EmployeeUtilization[];
}

export interface MonthlyTrend {
  month: string;
  year: number;
  revenue: number;
  costs: number;
  profit: number;
  hours: number;
  projects: number;
}

export interface EmployeeUtilization {
  employee_name: string;
  total_hours: number;
  billable_hours: number;
  utilization_rate: number;
  projects: string[];
  average_hourly_cost: number;
}

// ============================================================================
// API TYPES
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination?: {
    page: number;
    per_page: number;
    total: number;
    total_pages: number;
  };
}

export interface FileUploadRequest {
  file_type: 'springahead' | 'paychex' | 'quickbooks' | 'generic';
  organization_id: string;
}

export interface FileUploadResponse extends ApiResponse {
  data?: {
    file_id: string;
    filename: string;
    records_imported: number;
    errors?: string[];
  };
}

export interface CostAnalysisRequest {
  project_identifiers?: string[];
  employee_names?: string[];
  period_start: string;
  period_end: string;
}

export interface ExportRequest {
  format: 'csv' | 'excel' | 'pdf';
  data_type: 'projects' | 'employees' | 'costs' | 'dashboard';
  filters?: {
    project_identifiers?: string[];
    employee_names?: string[];
    period_start?: string;
    period_end?: string;
  };
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

export type FileType = 'springahead' | 'paychex' | 'quickbooks' | 'generic';
export type ImportStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type ProjectStatus = 'active' | 'completed' | 'on_hold' | 'cancelled';
export type UserRole = 'admin' | 'manager' | 'viewer';
export type ExpenseType = 'travel' | 'supplies' | 'equipment' | 'training' | 'other';

export interface DateRange {
  start: Date;
  end: Date;
}

export interface BurdenCalculation {
  employer_fica: number;
  employer_medicare: number;
  employer_futa: number;
  employer_suta: number;
  total_burden: number;
  burden_rate: number;
}

// ============================================================================
// FORM VALIDATION SCHEMAS (for Zod validation)
// ============================================================================

export interface ProjectFormData {
  project_identifier: string;
  client_name: string;
  project_name: string;
  hourly_rate: number;
  status: ProjectStatus;
  start_date?: string;
  end_date?: string;
  budget?: number;
  description?: string;
}

export interface FileUploadFormData {
  file: File;
  file_type: FileType;
}

export interface CostAnalysisFormData {
  project_identifiers: string[];
  period_start: string;
  period_end: string;
}

// ============================================================================
// CHART DATA TYPES (for Recharts)
// ============================================================================

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: unknown;
}

export interface TimeSeriesDataPoint {
  date: string;
  revenue: number;
  costs: number;
  profit: number;
  [key: string]: unknown;
}

export interface ProjectChartData {
  project_identifier: string;
  client_name: string;
  revenue: number;
  costs: number;
  profit: number;
  margin: number;
}

export interface EmployeeChartData {
  employee_name: string;
  hours: number;
  cost: number;
  revenue_generated: number;
  projects: number;
}