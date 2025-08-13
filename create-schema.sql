-- CEO Payroll Analysis Platform Database Schema

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
    id SERIAL PRIMARY KEY,
    project_identifier VARCHAR(255) UNIQUE NOT NULL,
    client_name VARCHAR(255),
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Imported files tracking
CREATE TABLE IF NOT EXISTS imported_files (
    id SERIAL PRIMARY KEY,
    filename VARCHAR(255) UNIQUE NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size BIGINT,
    status VARCHAR(50) DEFAULT 'pending',
    records_processed INTEGER DEFAULT 0,
    error_message TEXT,
    processed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Main payroll data table
CREATE TABLE IF NOT EXISTS payroll_data (
    id SERIAL PRIMARY KEY,
    imported_file_id INTEGER REFERENCES imported_files(id),
    source_type VARCHAR(50), -- 'springahead', 'paychex', 'quickbooks'
    
    -- Employee info
    employee_name VARCHAR(255) NOT NULL,
    employee_id VARCHAR(100),
    
    -- Project allocation (SpringAhead)
    project_identifier VARCHAR(255),
    work_date DATE,
    hours_worked DECIMAL(5,2),
    hourly_rate DECIMAL(8,2),
    
    -- Payroll data (Paychex)
    pay_period_start DATE,
    pay_period_end DATE,
    gross_pay DECIMAL(10,2),
    federal_tax DECIMAL(10,2),
    state_tax DECIMAL(10,2),
    fica_tax DECIMAL(10,2),
    medicare_tax DECIMAL(10,2),
    other_deductions DECIMAL(10,2),
    
    -- Employer burden calculations
    employer_fica DECIMAL(10,2),
    employer_medicare DECIMAL(10,2),
    employer_futa DECIMAL(10,2),
    employer_suta DECIMAL(10,2),
    benefits_cost DECIMAL(10,2),
    bonuses DECIMAL(10,2),
    net_pay DECIMAL(10,2),
    
    -- Calculated fields
    total_burden DECIMAL(10,2),
    true_cost DECIMAL(10,2),
    burden_rate DECIMAL(6,4),
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Employee cost aggregations
CREATE TABLE IF NOT EXISTS employee_costs (
    id SERIAL PRIMARY KEY,
    employee_name VARCHAR(255) NOT NULL,
    employee_id VARCHAR(100),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_hours DECIMAL(8,2) DEFAULT 0,
    gross_pay DECIMAL(10,2) DEFAULT 0,
    total_taxes DECIMAL(10,2) DEFAULT 0,
    total_benefits DECIMAL(10,2) DEFAULT 0,
    total_employer_burden DECIMAL(10,2) DEFAULT 0,
    total_true_cost DECIMAL(10,2) DEFAULT 0,
    average_hourly_rate DECIMAL(8,2),
    burden_rate DECIMAL(6,4),
    project_allocations JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(employee_name, period_start, period_end)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_payroll_data_employee ON payroll_data(employee_name);
CREATE INDEX IF NOT EXISTS idx_payroll_data_project ON payroll_data(project_identifier);
CREATE INDEX IF NOT EXISTS idx_payroll_data_date ON payroll_data(work_date, pay_period_start);
CREATE INDEX IF NOT EXISTS idx_employee_costs_period ON employee_costs(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_projects_identifier ON projects(project_identifier);