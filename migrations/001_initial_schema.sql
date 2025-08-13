-- Prophet Growth Analysis Database Schema
-- PostgreSQL (Neon) Database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations table for multi-tenant support
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    subscription_tier VARCHAR(50) DEFAULT 'starter' CHECK (subscription_tier IN ('starter', 'professional', 'enterprise')),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Users table with auth integration
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(255),
    last_name VARCHAR(255),
    avatar_url TEXT,
    organization_id UUID NOT NULL,
    role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    department VARCHAR(255),
    position VARCHAR(255),
    hire_date DATE,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    timezone VARCHAR(100) DEFAULT 'UTC',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Employees table for cost analysis
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    position VARCHAR(255),
    level VARCHAR(100),
    location VARCHAR(255),
    start_date DATE,
    end_date DATE,
    base_salary DECIMAL(12,2),
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'terminated')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Cost Analysis table
CREATE TABLE IF NOT EXISTS cost_analyses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    employee_id UUID REFERENCES employees(id),
    analysis_date DATE NOT NULL,
    base_salary DECIMAL(12,2),
    benefits_cost DECIMAL(12,2),
    overhead_cost DECIMAL(12,2),
    total_monthly_cost DECIMAL(12,2),
    total_annual_cost DECIMAL(12,2),
    utilization_rate DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Conversation History for AI chat
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    message TEXT NOT NULL,
    response TEXT NOT NULL,
    context JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Forecasts table for Prophet predictions
CREATE TABLE IF NOT EXISTS forecasts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    forecast_type VARCHAR(100),
    time_period VARCHAR(50),
    predictions JSONB NOT NULL,
    confidence_score DECIMAL(5,2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Mood check-ins table for wellness tracking
CREATE TABLE IF NOT EXISTS mood_checkins (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    organization_id UUID NOT NULL,
    mood_value VARCHAR(50) NOT NULL CHECK (mood_value IN ('amazing', 'great', 'good', 'okay', 'tough')),
    mood_score INTEGER NOT NULL CHECK (mood_score BETWEEN 1 AND 5),
    notes TEXT,
    is_anonymous BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Daily priorities/tasks table
CREATE TABLE IF NOT EXISTS daily_priorities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    organization_id UUID NOT NULL,
    text TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    urgency VARCHAR(50) DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high')),
    estimated_time INTEGER, -- in minutes
    completed_at TIMESTAMP WITH TIME ZONE,
    due_date DATE,
    category VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Kudos/appreciation system
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Kudos likes table for tracking who liked what
CREATE TABLE IF NOT EXISTS kudos_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kudos_id UUID NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (kudos_id) REFERENCES kudos(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(kudos_id, user_id)
);

-- Team pulse/analytics aggregation table
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    UNIQUE(organization_id, date)
);

-- Activity logs for audit and analytics
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    organization_id UUID NOT NULL,
    action_type VARCHAR(100) NOT NULL, -- 'mood_checkin', 'priority_added', 'kudos_given', etc.
    resource_type VARCHAR(100), -- 'mood', 'priority', 'kudos', etc.
    resource_id UUID,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE INDEX IF NOT EXISTS idx_employees_user_id ON employees(user_id);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);

CREATE INDEX IF NOT EXISTS idx_cost_analyses_employee_id ON cost_analyses(employee_id);
CREATE INDEX IF NOT EXISTS idx_cost_analyses_user_id ON cost_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_cost_analyses_analysis_date ON cost_analyses(analysis_date);

CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);

CREATE INDEX IF NOT EXISTS idx_forecasts_user_id ON forecasts(user_id);
CREATE INDEX IF NOT EXISTS idx_forecasts_created_at ON forecasts(created_at);

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

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updating timestamps
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON employees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_priorities_updated_at BEFORE UPDATE ON daily_priorities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update kudos likes count
CREATE OR REPLACE FUNCTION update_kudos_likes_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE kudos SET likes_count = likes_count + 1 WHERE id = NEW.kudos_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE kudos SET likes_count = likes_count - 1 WHERE id = OLD.kudos_id;
    END IF;
    RETURN NULL;
END;
$$ language 'plpgsql';

-- Triggers for kudos likes count
CREATE TRIGGER update_kudos_likes_count_trigger
    AFTER INSERT OR DELETE ON kudos_likes
    FOR EACH ROW EXECUTE FUNCTION update_kudos_likes_count();