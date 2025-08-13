-- Prophet Growth Analysis Platform Database Schema
-- Neon PostgreSQL Database
-- Migration: 001_initial_schema

-- Enable UUID extension for primary keys
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations table for multi-tenant support
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    subscription_tier VARCHAR(50) DEFAULT 'starter' CHECK (subscription_tier IN ('starter', 'professional', 'enterprise')),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users table with Clerk auth integration
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_id VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    organization_id UUID NOT NULL,
    role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    department VARCHAR(100),
    position VARCHAR(100),
    hire_date DATE,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    timezone VARCHAR(100) DEFAULT 'UTC',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Employees table for financial analysis and workforce planning
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    department VARCHAR(100) NOT NULL,
    position VARCHAR(100) NOT NULL,
    salary DECIMAL(12,2) NOT NULL DEFAULT 0,
    benefits DECIMAL(12,2) NOT NULL DEFAULT 0,
    start_date DATE NOT NULL,
    end_date DATE,
    employment_type VARCHAR(50) NOT NULL DEFAULT 'full_time' CHECK (employment_type IN ('full_time', 'part_time', 'contractor', 'intern')),
    location VARCHAR(255),
    manager_id UUID,
    cost_center VARCHAR(100),
    tags JSONB DEFAULT '[]',
    metadata JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (manager_id) REFERENCES employees(id) ON DELETE SET NULL
);

-- Conversations table for AI chat history
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    user_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    messages JSONB DEFAULT '[]',
    context JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Cost analyses table for financial intelligence
CREATE TABLE IF NOT EXISTS cost_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    user_id UUID NOT NULL,
    analysis_type VARCHAR(50) NOT NULL CHECK (analysis_type IN ('employee_cost', 'department_cost', 'project_cost', 'forecast')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    data_source VARCHAR(50) DEFAULT 'manual' CHECK (data_source IN ('manual', 'imported', 'api', 'calculated')),
    parameters JSONB DEFAULT '{}',
    results JSONB DEFAULT '{}',
    total_cost DECIMAL(15,2) DEFAULT 0,
    cost_breakdown JSONB DEFAULT '{}',
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    confidence_score DECIMAL(3,2),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Forecasts table for predictive analytics
CREATE TABLE IF NOT EXISTS forecasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    user_id UUID NOT NULL,
    forecast_type VARCHAR(50) NOT NULL CHECK (forecast_type IN ('employee_growth', 'cost_projection', 'headcount', 'budget')),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    input_data JSONB DEFAULT '{}',
    model_type VARCHAR(50) NOT NULL DEFAULT 'prophet' CHECK (model_type IN ('prophet', 'linear', 'arima', 'custom')),
    model_parameters JSONB DEFAULT '{}',
    forecast_horizon INTEGER NOT NULL, -- days
    forecast_data JSONB DEFAULT '{}',
    confidence_intervals JSONB DEFAULT '{}',
    accuracy_metrics JSONB,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Legacy tables for existing HR features (mood, priorities, kudos)
CREATE TABLE IF NOT EXISTS mood_checkins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    organization_id UUID NOT NULL,
    mood_value VARCHAR(20) NOT NULL CHECK (mood_value IN ('amazing', 'great', 'good', 'okay', 'tough')),
    mood_score INTEGER NOT NULL CHECK (mood_score BETWEEN 1 AND 5),
    notes TEXT,
    is_anonymous BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS daily_priorities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    organization_id UUID NOT NULL,
    text TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    urgency VARCHAR(10) DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high')),
    estimated_time INTEGER, -- in minutes
    completed_at TIMESTAMPTZ,
    due_date DATE,
    category VARCHAR(100),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS kudos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    from_user_id UUID NOT NULL,
    to_user_id UUID, -- NULL for team-wide kudos
    organization_id UUID NOT NULL,
    message TEXT NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('teamwork', 'innovation', 'leadership', 'helpfulness', 'excellence')),
    is_public BOOLEAN DEFAULT TRUE,
    likes_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS kudos_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kudos_id UUID NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (kudos_id) REFERENCES kudos(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(kudos_id, user_id)
);

CREATE TABLE IF NOT EXISTS team_pulse_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL,
    date DATE NOT NULL,
    active_users_count INTEGER DEFAULT 0,
    average_mood_score DECIMAL(3,2) DEFAULT 0,
    mood_distribution JSONB DEFAULT '{}', -- {"amazing": 5, "great": 10, ...}
    total_priorities_completed INTEGER DEFAULT 0,
    total_kudos_given INTEGER DEFAULT 0,
    engagement_score DECIMAL(5,2) DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    UNIQUE(organization_id, date)
);

-- Activity logs for audit and analytics
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    organization_id UUID NOT NULL,
    action_type VARCHAR(100) NOT NULL, -- 'mood_checkin', 'priority_added', 'kudos_given', etc.
    resource_type VARCHAR(50), -- 'mood', 'priority', 'kudos', etc.
    resource_id UUID,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

CREATE INDEX IF NOT EXISTS idx_employees_organization_id ON employees(organization_id);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_employees_manager_id ON employees(manager_id);
CREATE INDEX IF NOT EXISTS idx_employees_start_date ON employees(start_date);

CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_organization_id ON conversations(organization_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);

CREATE INDEX IF NOT EXISTS idx_cost_analyses_organization_id ON cost_analyses(organization_id);
CREATE INDEX IF NOT EXISTS idx_cost_analyses_user_id ON cost_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_cost_analyses_analysis_type ON cost_analyses(analysis_type);
CREATE INDEX IF NOT EXISTS idx_cost_analyses_period ON cost_analyses(period_start, period_end);

CREATE INDEX IF NOT EXISTS idx_forecasts_organization_id ON forecasts(organization_id);
CREATE INDEX IF NOT EXISTS idx_forecasts_user_id ON forecasts(user_id);
CREATE INDEX IF NOT EXISTS idx_forecasts_forecast_type ON forecasts(forecast_type);
CREATE INDEX IF NOT EXISTS idx_forecasts_status ON forecasts(status);

CREATE INDEX IF NOT EXISTS idx_mood_checkins_user_id ON mood_checkins(user_id);
CREATE INDEX IF NOT EXISTS idx_mood_checkins_organization_id ON mood_checkins(organization_id);
CREATE INDEX IF NOT EXISTS idx_mood_checkins_created_at ON mood_checkins(created_at);

CREATE INDEX IF NOT EXISTS idx_priorities_user_id ON daily_priorities(user_id);
CREATE INDEX IF NOT EXISTS idx_priorities_organization_id ON daily_priorities(organization_id);
CREATE INDEX IF NOT EXISTS idx_priorities_completed ON daily_priorities(completed);
CREATE INDEX IF NOT EXISTS idx_priorities_due_date ON daily_priorities(due_date);

CREATE INDEX IF NOT EXISTS idx_kudos_from_user_id ON kudos(from_user_id);
CREATE INDEX IF NOT EXISTS idx_kudos_to_user_id ON kudos(to_user_id);
CREATE INDEX IF NOT EXISTS idx_kudos_organization_id ON kudos(organization_id);
CREATE INDEX IF NOT EXISTS idx_kudos_created_at ON kudos(created_at);

CREATE INDEX IF NOT EXISTS idx_team_pulse_organization_date ON team_pulse_snapshots(organization_id, date);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_organization_id ON activity_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action_type ON activity_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);

-- Functions for automatic timestamp updates
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updating timestamps
CREATE TRIGGER update_organizations_updated_at 
    BEFORE UPDATE ON organizations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at 
    BEFORE UPDATE ON employees 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at 
    BEFORE UPDATE ON conversations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cost_analyses_updated_at 
    BEFORE UPDATE ON cost_analyses 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_forecasts_updated_at 
    BEFORE UPDATE ON forecasts 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_priorities_updated_at 
    BEFORE UPDATE ON daily_priorities 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Function to update kudos likes count
CREATE OR REPLACE FUNCTION update_kudos_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE kudos SET likes_count = likes_count + 1 WHERE id = NEW.kudos_id;
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE kudos SET likes_count = likes_count - 1 WHERE id = OLD.kudos_id;
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Triggers for kudos likes count
CREATE TRIGGER update_kudos_likes_count_insert
    AFTER INSERT ON kudos_likes
    FOR EACH ROW 
    EXECUTE FUNCTION update_kudos_likes_count();

CREATE TRIGGER update_kudos_likes_count_delete
    AFTER DELETE ON kudos_likes
    FOR EACH ROW 
    EXECUTE FUNCTION update_kudos_likes_count();

-- Views for common queries
CREATE OR REPLACE VIEW active_employees_with_costs AS
SELECT 
    e.*,
    (e.salary + e.benefits) as total_compensation,
    ROUND((e.salary + e.benefits) / 12, 2) as monthly_cost,
    ROUND((e.salary + e.benefits), 2) as annual_cost,
    CASE 
        WHEN e.employment_type = 'full_time' THEN ROUND((e.salary + e.benefits) / (52 * 40), 2)
        WHEN e.employment_type = 'part_time' THEN ROUND((e.salary + e.benefits) / (52 * 20), 2)
        ELSE ROUND((e.salary + e.benefits) / (52 * 40), 2)
    END as cost_per_hour
FROM employees e
WHERE e.status = 'active' AND (e.end_date IS NULL OR e.end_date > CURRENT_DATE);

CREATE OR REPLACE VIEW department_cost_summary AS
SELECT 
    e.organization_id,
    e.department,
    COUNT(*) as employee_count,
    SUM(e.salary + e.benefits) as total_cost,
    AVG(e.salary + e.benefits) as average_cost,
    MIN(e.salary + e.benefits) as min_cost,
    MAX(e.salary + e.benefits) as max_cost
FROM employees e
WHERE e.status = 'active' AND (e.end_date IS NULL OR e.end_date > CURRENT_DATE)
GROUP BY e.organization_id, e.department;

-- Sample data for development (only insert if tables are empty)
DO $$
BEGIN
    -- Insert sample organization if none exists
    IF NOT EXISTS (SELECT 1 FROM organizations LIMIT 1) THEN
        INSERT INTO organizations (id, name, slug, subscription_tier, settings) VALUES
        ('550e8400-e29b-41d4-a716-446655440000', 'Acme Corporation', 'acme-corp', 'professional', '{"features": ["analytics", "forecasting"], "limits": {"employees": 500}}');
    END IF;
END $$;