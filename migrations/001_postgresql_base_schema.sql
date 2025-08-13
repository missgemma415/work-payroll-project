-- Prophet Growth Analysis Database Schema
-- Neon PostgreSQL Database
-- Migration: 001_postgresql_base_schema

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create function for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

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

-- Users table with auth integration
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_id VARCHAR(255) UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url TEXT,
    organization_id UUID NOT NULL,
    role VARCHAR(50) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    department VARCHAR(100),
    position VARCHAR(100),
    hire_date DATE,
    status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    timezone VARCHAR(50) DEFAULT 'UTC',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
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
    created_at TIMESTAMPTZ DEFAULT NOW(),
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
    completed_at TIMESTAMPTZ,
    due_date DATE,
    category VARCHAR(100),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
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
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Kudos likes table for tracking who liked what
CREATE TABLE IF NOT EXISTS kudos_likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    kudos_id UUID NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
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
    resource_type VARCHAR(100), -- 'mood', 'priority', 'kudos', etc.
    resource_id UUID,
    details JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_clerk_id ON users(clerk_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

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

-- Triggers for updating timestamps
CREATE TRIGGER update_users_timestamp 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizations_timestamp 
    BEFORE UPDATE ON organizations 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_priorities_timestamp 
    BEFORE UPDATE ON daily_priorities 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger to update kudos likes count
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
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_kudos_likes_count_insert
    AFTER INSERT ON kudos_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_kudos_likes_count();

CREATE TRIGGER update_kudos_likes_count_delete
    AFTER DELETE ON kudos_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_kudos_likes_count();