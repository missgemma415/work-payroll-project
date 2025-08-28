-- QuickBooks Integration Database Schema
-- Extends existing Neon PostgreSQL schema for CEO Payroll Analytics Platform

-- QuickBooks OAuth credentials storage
CREATE TABLE IF NOT EXISTS quickbooks_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    realm_id VARCHAR(255) NOT NULL,  -- QuickBooks Company ID
    access_token TEXT NOT NULL,
    refresh_token TEXT NOT NULL,
    token_expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure only one active credential per realm
    UNIQUE(realm_id, active) WHERE active = true
);

-- QuickBooks company information cache
CREATE TABLE IF NOT EXISTS quickbooks_companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    realm_id VARCHAR(255) UNIQUE NOT NULL,
    company_name VARCHAR(255) NOT NULL,
    legal_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(100),
    country VARCHAR(100),
    qb_created_time TIMESTAMP WITH TIME ZONE,
    qb_last_updated TIMESTAMP WITH TIME ZONE,
    last_sync TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- QuickBooks employee synchronization
CREATE TABLE IF NOT EXISTS quickbooks_employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    realm_id VARCHAR(255) NOT NULL,
    quickbooks_id VARCHAR(255) NOT NULL,
    employee_name VARCHAR(255) NOT NULL,
    active BOOLEAN DEFAULT true,
    hire_date DATE,
    email VARCHAR(255),
    phone VARCHAR(100),
    hourly_rate DECIMAL(10,2),
    salary DECIMAL(12,2),
    last_sync TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Ensure unique employee per realm
    UNIQUE(quickbooks_id, realm_id),
    
    -- Foreign key to credentials
    FOREIGN KEY (realm_id) REFERENCES quickbooks_companies(realm_id)
);

-- QuickBooks payroll items mapping
CREATE TABLE IF NOT EXISTS quickbooks_payroll_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    realm_id VARCHAR(255) NOT NULL,
    quickbooks_id VARCHAR(255) NOT NULL,
    item_name VARCHAR(255) NOT NULL,
    item_type VARCHAR(100), -- Salary, Hourly, Tax, etc.
    expense_account_ref VARCHAR(255),
    liability_account_ref VARCHAR(255),
    active BOOLEAN DEFAULT true,
    last_sync TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(quickbooks_id, realm_id),
    FOREIGN KEY (realm_id) REFERENCES quickbooks_companies(realm_id)
);

-- Sync operations audit log
CREATE TABLE IF NOT EXISTS quickbooks_sync_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    realm_id VARCHAR(255) NOT NULL,
    operation_type VARCHAR(100) NOT NULL, -- employees, payroll_items, company_info
    records_processed INTEGER DEFAULT 0,
    records_successful INTEGER DEFAULT 0,
    records_failed INTEGER DEFAULT 0,
    sync_duration_seconds DECIMAL(10,3),
    error_details JSONB,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    FOREIGN KEY (realm_id) REFERENCES quickbooks_companies(realm_id)
);

-- Integration mapping between QuickBooks and existing payroll_data
CREATE TABLE IF NOT EXISTS quickbooks_payroll_mapping (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    realm_id VARCHAR(255) NOT NULL,
    quickbooks_employee_id VARCHAR(255) NOT NULL,
    local_employee_name VARCHAR(255) NOT NULL, -- Maps to existing employee_costs.employee_name
    mapping_confidence DECIMAL(3,2) DEFAULT 0.95, -- Confidence score for automated matching
    manually_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique mapping per QB employee
    UNIQUE(realm_id, quickbooks_employee_id),
    
    -- Reference to QB employee
    FOREIGN KEY (realm_id, quickbooks_employee_id) 
        REFERENCES quickbooks_employees(realm_id, quickbooks_id)
);

-- Enhanced employee_costs table integration (optional enhancement)
-- Add QuickBooks reference columns to existing table
DO $$ 
BEGIN
    -- Add QuickBooks reference columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'employee_costs' AND column_name = 'quickbooks_realm_id') THEN
        ALTER TABLE employee_costs 
        ADD COLUMN quickbooks_realm_id VARCHAR(255),
        ADD COLUMN quickbooks_employee_id VARCHAR(255),
        ADD COLUMN quickbooks_sync_status VARCHAR(50) DEFAULT 'pending';
        
        -- Create index for QuickBooks lookups
        CREATE INDEX IF NOT EXISTS idx_employee_costs_quickbooks 
        ON employee_costs(quickbooks_realm_id, quickbooks_employee_id);
    END IF;
END $$;

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_qb_credentials_realm_active ON quickbooks_credentials(realm_id, active);
CREATE INDEX IF NOT EXISTS idx_qb_employees_realm_active ON quickbooks_employees(realm_id, active);
CREATE INDEX IF NOT EXISTS idx_qb_employees_name ON quickbooks_employees(employee_name);
CREATE INDEX IF NOT EXISTS idx_qb_sync_log_realm_date ON quickbooks_sync_log(realm_id, completed_at);
CREATE INDEX IF NOT EXISTS idx_qb_mapping_local_name ON quickbooks_payroll_mapping(local_employee_name);

-- Views for executive dashboard integration
CREATE OR REPLACE VIEW quickbooks_employee_summary AS
SELECT 
    qc.company_name,
    qc.realm_id,
    COUNT(qe.id) as total_employees,
    COUNT(CASE WHEN qe.active THEN 1 END) as active_employees,
    AVG(qe.hourly_rate) as avg_hourly_rate,
    AVG(qe.salary) as avg_salary,
    MAX(qe.last_sync) as last_employee_sync
FROM quickbooks_companies qc
LEFT JOIN quickbooks_employees qe ON qc.realm_id = qe.realm_id
GROUP BY qc.company_name, qc.realm_id;

-- View for mapping status (helps with data integration)
CREATE OR REPLACE VIEW quickbooks_mapping_status AS
SELECT 
    qc.company_name,
    qc.realm_id,
    COUNT(qe.id) as quickbooks_employees,
    COUNT(qpm.id) as mapped_employees,
    COUNT(CASE WHEN qpm.manually_verified THEN 1 END) as verified_mappings,
    ROUND(COUNT(qpm.id)::DECIMAL / COUNT(qe.id) * 100, 2) as mapping_percentage
FROM quickbooks_companies qc
LEFT JOIN quickbooks_employees qe ON qc.realm_id = qe.realm_id AND qe.active = true
LEFT JOIN quickbooks_payroll_mapping qpm ON qc.realm_id = qpm.realm_id 
    AND qe.quickbooks_id = qpm.quickbooks_employee_id
GROUP BY qc.company_name, qc.realm_id;

-- Comment documentation
COMMENT ON TABLE quickbooks_credentials IS 'OAuth 2.0 credentials for QuickBooks Online API access';
COMMENT ON TABLE quickbooks_companies IS 'Cached company information from QuickBooks Online';
COMMENT ON TABLE quickbooks_employees IS 'Synchronized employee data from QuickBooks Online';
COMMENT ON TABLE quickbooks_payroll_items IS 'PayrollItems from QuickBooks for burden calculations';
COMMENT ON TABLE quickbooks_sync_log IS 'Audit log for all QuickBooks synchronization operations';
COMMENT ON TABLE quickbooks_payroll_mapping IS 'Mapping between QuickBooks employees and local payroll data';

COMMENT ON VIEW quickbooks_employee_summary IS 'Executive summary of QuickBooks employee data per company';
COMMENT ON VIEW quickbooks_mapping_status IS 'Data integration status between QuickBooks and local payroll';