-- Scientia Capital HR Platform Database Schema
-- Cloudflare D1 (SQLite) Database

-- Organizations table for multi-tenant support
CREATE TABLE IF NOT EXISTS organizations (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    subscription_tier TEXT DEFAULT 'starter' CHECK (subscription_tier IN ('starter', 'professional', 'enterprise')),
    settings JSON DEFAULT '{}',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Users table with Clerk auth integration
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY, -- Clerk user ID
    clerk_id TEXT UNIQUE NOT NULL,
    email TEXT NOT NULL,
    first_name TEXT,
    last_name TEXT,
    avatar_url TEXT,
    organization_id TEXT NOT NULL,
    role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    department TEXT,
    position TEXT,
    hire_date DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    timezone TEXT DEFAULT 'UTC',
    preferences JSON DEFAULT '{}',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Mood check-ins table for wellness tracking
CREATE TABLE IF NOT EXISTS mood_checkins (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    organization_id TEXT NOT NULL,
    mood_value TEXT NOT NULL CHECK (mood_value IN ('amazing', 'great', 'good', 'okay', 'tough')),
    mood_score INTEGER NOT NULL CHECK (mood_score BETWEEN 1 AND 5),
    notes TEXT,
    is_anonymous BOOLEAN DEFAULT FALSE,
    metadata JSON DEFAULT '{}',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Daily priorities/tasks table
CREATE TABLE IF NOT EXISTS daily_priorities (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    organization_id TEXT NOT NULL,
    text TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    urgency TEXT DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high')),
    estimated_time INTEGER, -- in minutes
    completed_at DATETIME,
    due_date DATE,
    category TEXT,
    metadata JSON DEFAULT '{}',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Kudos/appreciation system
CREATE TABLE IF NOT EXISTS kudos (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    from_user_id TEXT NOT NULL,
    to_user_id TEXT, -- NULL for team-wide kudos
    organization_id TEXT NOT NULL,
    message TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('teamwork', 'innovation', 'leadership', 'helpfulness', 'excellence')),
    is_public BOOLEAN DEFAULT TRUE,
    likes_count INTEGER DEFAULT 0,
    metadata JSON DEFAULT '{}',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (to_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Kudos likes table for tracking who liked what
CREATE TABLE IF NOT EXISTS kudos_likes (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    kudos_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (kudos_id) REFERENCES kudos(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(kudos_id, user_id)
);

-- Team pulse/analytics aggregation table
CREATE TABLE IF NOT EXISTS team_pulse_snapshots (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    organization_id TEXT NOT NULL,
    date DATE NOT NULL,
    active_users_count INTEGER DEFAULT 0,
    average_mood_score REAL DEFAULT 0,
    mood_distribution JSON DEFAULT '{}', -- {"amazing": 5, "great": 10, ...}
    total_priorities_completed INTEGER DEFAULT 0,
    total_kudos_given INTEGER DEFAULT 0,
    engagement_score REAL DEFAULT 0,
    metadata JSON DEFAULT '{}',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    UNIQUE(organization_id, date)
);

-- Conversations table for AI chat history
CREATE TABLE IF NOT EXISTS conversations (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    metadata JSON DEFAULT '{}',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Messages table for storing chat messages
CREATE TABLE IF NOT EXISTS messages (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    conversation_id TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    metadata JSON DEFAULT '{}',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE
);

-- Activity logs for audit and analytics
CREATE TABLE IF NOT EXISTS activity_logs (
    id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
    user_id TEXT,
    organization_id TEXT NOT NULL,
    action_type TEXT NOT NULL, -- 'mood_checkin', 'priority_added', 'kudos_given', 'chat_message', etc.
    resource_type TEXT, -- 'mood', 'priority', 'kudos', 'conversation', etc.
    resource_id TEXT,
    details JSON DEFAULT '{}',
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
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

CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);
CREATE INDEX IF NOT EXISTS idx_conversations_updated_at ON conversations(updated_at);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_role ON messages(role);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_organization_id ON activity_logs(organization_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_action_type ON activity_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at);

-- Triggers for updating timestamps
CREATE TRIGGER IF NOT EXISTS update_users_timestamp 
    AFTER UPDATE ON users 
    BEGIN 
        UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_organizations_timestamp 
    AFTER UPDATE ON organizations 
    BEGIN 
        UPDATE organizations SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_priorities_timestamp 
    AFTER UPDATE ON daily_priorities 
    BEGIN 
        UPDATE daily_priorities SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

CREATE TRIGGER IF NOT EXISTS update_conversations_timestamp 
    AFTER UPDATE ON conversations 
    BEGIN 
        UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

-- Trigger to update kudos likes count
CREATE TRIGGER IF NOT EXISTS update_kudos_likes_count_insert
    AFTER INSERT ON kudos_likes
    BEGIN
        UPDATE kudos SET likes_count = likes_count + 1 WHERE id = NEW.kudos_id;
    END;

CREATE TRIGGER IF NOT EXISTS update_kudos_likes_count_delete
    AFTER DELETE ON kudos_likes
    BEGIN
        UPDATE kudos SET likes_count = likes_count - 1 WHERE id = OLD.kudos_id;
    END;