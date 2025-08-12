-- Payroll MVP Schema
-- Migration: 002_payroll_schema
-- Date: 2025-01-27

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Track imported files
CREATE TABLE IF NOT EXISTS imported_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename VARCHAR(255) NOT NULL,
    file_type VARCHAR(50) NOT NULL, -- 'springahead', 'paychex', 'quickbooks'
    file_size INTEGER,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    error_message TEXT,
    records_processed INTEGER DEFAULT 0,
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Client projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_identifier VARCHAR(100) UNIQUE NOT NULL,
    client_name VARCHAR(255),
    description TEXT,
    hourly_rate DECIMAL(10,2),
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'on_hold', 'cancelled')),
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Raw payroll data from all sources
CREATE TABLE IF NOT EXISTS payroll_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    imported_file_id UUID NOT NULL,
    source_type VARCHAR(50) NOT NULL, -- 'springahead', 'paychex', 'quickbooks'
    employee_name VARCHAR(255) NOT NULL,
    employee_id VARCHAR(100),
    project_identifier VARCHAR(100),
    
    -- Time tracking (SpringAhead)
    work_date DATE,
    hours_worked DECIMAL(8,2),
    hourly_rate DECIMAL(10,2),
    
    -- Payroll (Paychex)
    pay_period_start DATE,
    pay_period_end DATE,
    gross_pay DECIMAL(12,2),
    federal_tax DECIMAL(12,2),
    state_tax DECIMAL(12,2),
    fica_tax DECIMAL(12,2),
    medicare_tax DECIMAL(12,2),
    other_deductions DECIMAL(12,2),
    employer_fica DECIMAL(12,2),
    employer_medicare DECIMAL(12,2),
    employer_futa DECIMAL(12,2),
    employer_suta DECIMAL(12,2),
    benefits_cost DECIMAL(12,2),
    bonuses DECIMAL(12,2),
    net_pay DECIMAL(12,2),
    
    -- Expenses (QuickBooks)
    expense_amount DECIMAL(12,2),
    expense_category VARCHAR(100),
    expense_description TEXT,
    
    -- Calculated fields
    total_burden DECIMAL(12,2), -- employer taxes + benefits
    true_cost DECIMAL(12,2), -- gross + burden
    burden_rate DECIMAL(5,4), -- percentage
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (imported_file_id) REFERENCES imported_files(id) ON DELETE CASCADE,
    FOREIGN KEY (project_identifier) REFERENCES projects(project_identifier) ON DELETE SET NULL
);

-- Aggregated employee costs by period
CREATE TABLE IF NOT EXISTS employee_costs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    employee_name VARCHAR(255) NOT NULL,
    employee_id VARCHAR(100),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Summary metrics
    total_hours DECIMAL(10,2) DEFAULT 0,
    gross_pay DECIMAL(12,2) DEFAULT 0,
    total_taxes DECIMAL(12,2) DEFAULT 0,
    total_benefits DECIMAL(12,2) DEFAULT 0,
    total_employer_burden DECIMAL(12,2) DEFAULT 0,
    total_true_cost DECIMAL(12,2) DEFAULT 0,
    average_hourly_rate DECIMAL(10,2),
    burden_rate DECIMAL(5,4),
    
    -- Project allocations (JSON)
    project_allocations JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(employee_name, period_start, period_end)
);

-- Project cost summaries by period
CREATE TABLE IF NOT EXISTS project_costs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_identifier VARCHAR(100) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    -- Cost breakdown
    total_hours DECIMAL(10,2) DEFAULT 0,
    labor_cost DECIMAL(12,2) DEFAULT 0,
    burden_cost DECIMAL(12,2) DEFAULT 0,
    direct_expenses DECIMAL(12,2) DEFAULT 0,
    total_cost DECIMAL(12,2) DEFAULT 0,
    
    -- Employee allocations (JSON)
    employee_allocations JSONB DEFAULT '{}',
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (project_identifier) REFERENCES projects(project_identifier) ON DELETE CASCADE,
    UNIQUE(project_identifier, period_start, period_end)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_imported_files_status ON imported_files(status);
CREATE INDEX IF NOT EXISTS idx_imported_files_type ON imported_files(file_type);
CREATE INDEX IF NOT EXISTS idx_imported_files_created ON imported_files(created_at);

CREATE INDEX IF NOT EXISTS idx_projects_identifier ON projects(project_identifier);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

CREATE INDEX IF NOT EXISTS idx_payroll_data_employee ON payroll_data(employee_name);
CREATE INDEX IF NOT EXISTS idx_payroll_data_project ON payroll_data(project_identifier);
CREATE INDEX IF NOT EXISTS idx_payroll_data_source ON payroll_data(source_type);
CREATE INDEX IF NOT EXISTS idx_payroll_data_date ON payroll_data(work_date);
CREATE INDEX IF NOT EXISTS idx_payroll_data_period ON payroll_data(pay_period_start, pay_period_end);

CREATE INDEX IF NOT EXISTS idx_employee_costs_name ON employee_costs(employee_name);
CREATE INDEX IF NOT EXISTS idx_employee_costs_period ON employee_costs(period_start, period_end);

CREATE INDEX IF NOT EXISTS idx_project_costs_project ON project_costs(project_identifier);
CREATE INDEX IF NOT EXISTS idx_project_costs_period ON project_costs(period_start, period_end);

-- Update triggers
CREATE TRIGGER update_imported_files_updated_at 
    BEFORE UPDATE ON imported_files 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at 
    BEFORE UPDATE ON projects 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employee_costs_updated_at 
    BEFORE UPDATE ON employee_costs 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_costs_updated_at 
    BEFORE UPDATE ON project_costs 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Sample projects for testing
INSERT INTO projects (project_identifier, client_name, description, hourly_rate, status) VALUES
('PROJ-001', 'Client Alpha', 'Software Development Project', 150.00, 'active'),
('PROJ-002', 'Client Beta', 'Consulting Services', 200.00, 'active'),
('PROJ-003', 'Client Gamma', 'Data Analysis Project', 125.00, 'active'),
('INTERNAL', 'Internal', 'Internal company activities', 0.00, 'active')
ON CONFLICT (project_identifier) DO NOTHING;