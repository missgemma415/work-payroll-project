-- Sample data for Scientia Capital HR Platform development

-- Insert sample organization
INSERT OR IGNORE INTO organizations (id, name, slug, subscription_tier, settings) VALUES 
('scientia-capital-demo', 'Scientia Capital', 'scientia-capital', 'professional', '{"theme": "warm", "timezone": "America/Los_Angeles"}');

-- Insert sample users (using realistic Clerk-like IDs)
INSERT OR IGNORE INTO users (id, clerk_id, email, first_name, last_name, organization_id, role, department, position, hire_date, status) VALUES 
('user_2abcdefghijklmnop', 'user_2abcdefghijklmnop', 'sarah.chen@scientiacapital.com', 'Sarah', 'Chen', 'scientia-capital-demo', 'admin', 'Operations', 'Operations Manager', '2023-01-15', 'active'),
('user_2bcdefghijklmnopq', 'user_2bcdefghijklmnopq', 'marcus.johnson@scientiacapital.com', 'Marcus', 'Johnson', 'scientia-capital-demo', 'member', 'Sales', 'Senior Account Executive', '2023-02-01', 'active'),
('user_2cdefghijklmnopqr', 'user_2cdefghijklmnopqr', 'elena.rodriguez@scientiacapital.com', 'Elena', 'Rodriguez', 'scientia-capital-demo', 'member', 'Engineering', 'Lead Developer', '2023-01-10', 'active'),
('user_2defghijklmnopqrs', 'user_2defghijklmnopqrs', 'david.kim@scientiacapital.com', 'David', 'Kim', 'scientia-capital-demo', 'member', 'Engineering', 'Backend Engineer', '2023-03-01', 'active'),
('user_2efghijklmnopqrst', 'user_2efghijklmnopqrst', 'anna.petrova@scientiacapital.com', 'Anna', 'Petrova', 'scientia-capital-demo', 'member', 'Design', 'UX Designer', '2023-02-15', 'active');

-- Insert sample mood check-ins (recent data)
INSERT OR IGNORE INTO mood_checkins (user_id, organization_id, mood_value, mood_score, notes, created_at) VALUES 
('user_2abcdefghijklmnop', 'scientia-capital-demo', 'great', 4, 'Productive day, good client meetings', datetime('now', '-2 hours')),
('user_2bcdefghijklmnopq', 'scientia-capital-demo', 'amazing', 5, 'Closed a big deal today!', datetime('now', '-1 hour')),
('user_2cdefghijklmnopqr', 'scientia-capital-demo', 'good', 3, 'Working on interesting technical challenges', datetime('now', '-3 hours')),
('user_2defghijklmnopqrs', 'scientia-capital-demo', 'great', 4, 'Code review went well', datetime('now', '-4 hours')),
('user_2efghijklmnopqrst', 'scientia-capital-demo', 'okay', 2, 'Bit tired today but making progress', datetime('now', '-5 hours'));

-- Insert sample daily priorities
INSERT OR IGNORE INTO daily_priorities (user_id, organization_id, text, completed, urgency, estimated_time, created_at) VALUES 
('user_2abcdefghijklmnop', 'scientia-capital-demo', 'Review Q1 team performance reports', 0, 'high', 45, datetime('now', '-6 hours')),
('user_2abcdefghijklmnop', 'scientia-capital-demo', 'Prepare for 2pm client meeting', 0, 'high', 30, datetime('now', '-6 hours')),
('user_2abcdefghijklmnop', 'scientia-capital-demo', 'Update employee handbook section 4', 1, 'medium', 60, datetime('now', '-7 hours')),
('user_2bcdefghijklmnopq', 'scientia-capital-demo', 'Follow up with prospect leads', 1, 'high', 90, datetime('now', '-8 hours')),
('user_2bcdefghijklmnopq', 'scientia-capital-demo', 'Update CRM with recent activities', 0, 'medium', 30, datetime('now', '-6 hours')),
('user_2cdefghijklmnopqr', 'scientia-capital-demo', 'Code review for new feature branch', 1, 'high', 60, datetime('now', '-4 hours')),
('user_2cdefghijklmnopqr', 'scientia-capital-demo', 'Update API documentation', 0, 'medium', 45, datetime('now', '-6 hours')),
('user_2defghijklmnopqrs', 'scientia-capital-demo', 'Fix database migration bug', 1, 'high', 120, datetime('now', '-5 hours')),
('user_2efghijklmnopqrst', 'scientia-capital-demo', 'Design mockups for dashboard v2', 0, 'medium', 180, datetime('now', '-6 hours'));

-- Insert sample kudos
INSERT OR IGNORE INTO kudos (from_user_id, to_user_id, organization_id, message, category, likes_count, created_at) VALUES 
('user_2abcdefghijklmnop', 'user_2bcdefghijklmnopq', 'scientia-capital-demo', 'Amazing work on the client presentation! Your attention to detail really made the difference.', 'excellence', 8, datetime('now', '-2 hours')),
('user_2defghijklmnopqrs', 'user_2cdefghijklmnopqr', 'scientia-capital-demo', 'Thank you for helping me with the database migration. You saved me hours of debugging!', 'helpfulness', 12, datetime('now', '-5 hours')),
('user_2efghijklmnopqrst', NULL, 'scientia-capital-demo', 'Kudos to everyone for the successful product launch! Our teamwork was incredible.', 'teamwork', 24, datetime('now', '-1 day')),
('user_2cdefghijklmnopqr', 'user_2efghijklmnopqrst', 'scientia-capital-demo', 'Love the new design concepts! They really capture our brand vision perfectly.', 'innovation', 6, datetime('now', '-3 hours')),
('user_2bcdefghijklmnopq', 'user_2abcdefghijklmnop', 'scientia-capital-demo', 'Great leadership during the client crisis. You kept everyone calm and focused.', 'leadership', 15, datetime('now', '-1 day'));

-- Insert sample kudos likes (who liked which kudos)
INSERT OR IGNORE INTO kudos_likes (kudos_id, user_id, created_at) VALUES 
((SELECT id FROM kudos WHERE message LIKE 'Amazing work on the client presentation%'), 'user_2cdefghijklmnopqr', datetime('now', '-1 hour')),
((SELECT id FROM kudos WHERE message LIKE 'Amazing work on the client presentation%'), 'user_2defghijklmnopqrs', datetime('now', '-1 hour')),
((SELECT id FROM kudos WHERE message LIKE 'Thank you for helping me%'), 'user_2abcdefghijklmnop', datetime('now', '-4 hours')),
((SELECT id FROM kudos WHERE message LIKE 'Thank you for helping me%'), 'user_2bcdefghijklmnopq', datetime('now', '-4 hours')),
((SELECT id FROM kudos WHERE message LIKE 'Kudos to everyone for the successful%'), 'user_2abcdefghijklmnop', datetime('now', '-20 hours')),
((SELECT id FROM kudos WHERE message LIKE 'Kudos to everyone for the successful%'), 'user_2bcdefghijklmnopq', datetime('now', '-20 hours')),
((SELECT id FROM kudos WHERE message LIKE 'Kudos to everyone for the successful%'), 'user_2cdefghijklmnopqr', datetime('now', '-20 hours')),
((SELECT id FROM kudos WHERE message LIKE 'Kudos to everyone for the successful%'), 'user_2defghijklmnopqrs', datetime('now', '-20 hours'));

-- Insert team pulse snapshot for today
INSERT OR IGNORE INTO team_pulse_snapshots (
    organization_id, 
    date, 
    active_users_count, 
    average_mood_score, 
    mood_distribution, 
    total_priorities_completed, 
    total_kudos_given,
    engagement_score
) VALUES (
    'scientia-capital-demo',
    date('now'),
    5,
    3.6,
    '{"amazing": 1, "great": 2, "good": 1, "okay": 1, "tough": 0}',
    4,
    5,
    8.2
);

-- Insert some activity logs
INSERT OR IGNORE INTO activity_logs (user_id, organization_id, action_type, resource_type, resource_id, details, created_at) VALUES 
('user_2abcdefghijklmnop', 'scientia-capital-demo', 'mood_checkin', 'mood', (SELECT id FROM mood_checkins WHERE user_id = 'user_2abcdefghijklmnop' ORDER BY created_at DESC LIMIT 1), '{"mood": "great", "score": 4}', datetime('now', '-2 hours')),
('user_2bcdefghijklmnopq', 'scientia-capital-demo', 'kudos_given', 'kudos', (SELECT id FROM kudos WHERE from_user_id = 'user_2bcdefghijklmnopq' ORDER BY created_at DESC LIMIT 1), '{"to_user": "user_2abcdefghijklmnop", "category": "leadership"}', datetime('now', '-1 day')),
('user_2cdefghijklmnopqr', 'scientia-capital-demo', 'priority_completed', 'priority', (SELECT id FROM daily_priorities WHERE user_id = 'user_2cdefghijklmnopqr' AND completed = 1 ORDER BY updated_at DESC LIMIT 1), '{"priority": "Code review for new feature branch"}', datetime('now', '-4 hours')),
('user_2defghijklmnopqrs', 'scientia-capital-demo', 'kudos_given', 'kudos', (SELECT id FROM kudos WHERE from_user_id = 'user_2defghijklmnopqrs' ORDER BY created_at DESC LIMIT 1), '{"to_user": "user_2cdefghijklmnopqr", "category": "helpfulness"}', datetime('now', '-5 hours')),
('user_2efghijklmnopqrst', 'scientia-capital-demo', 'mood_checkin', 'mood', (SELECT id FROM mood_checkins WHERE user_id = 'user_2efghijklmnopqrst' ORDER BY created_at DESC LIMIT 1), '{"mood": "okay", "score": 2}', datetime('now', '-5 hours'));