require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');

async function setupDatabase() {
  const connectionString = process.env.NEON_DATABASE_URL;
  
  if (!connectionString) {
    console.log('❌ NEON_DATABASE_URL not found');
    return;
  }

  console.log('🚀 Setting up your Prophet Growth Analysis database...');
  console.log('');
  
  try {
    const sql = neon(connectionString);
    
    // Test connection first
    console.log('🔄 Testing connection...');
    await sql`SELECT 1 as test`;
    console.log('✅ Database connection successful!');
    console.log('');

    // Create extensions
    console.log('🔧 Setting up extensions...');
    await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    await sql`CREATE EXTENSION IF NOT EXISTS "pg_trgm"`;
    console.log('✅ Extensions ready');

    // Create update function for timestamps
    console.log('🔧 Creating utility functions...');
    await sql`
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
          NEW.updated_at = NOW();
          RETURN NEW;
      END;
      $$ language 'plpgsql'
    `;
    console.log('✅ Utility functions ready');

    // Create organizations table
    console.log('🏢 Creating organizations table...');
    await sql`
      CREATE TABLE IF NOT EXISTS organizations (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          name VARCHAR(255) NOT NULL,
          slug VARCHAR(100) UNIQUE NOT NULL,
          subscription_tier VARCHAR(50) DEFAULT 'starter' CHECK (subscription_tier IN ('starter', 'professional', 'enterprise')),
          settings JSONB DEFAULT '{}',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    // Create users table
    console.log('👥 Creating users table...');
    await sql`
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
      )
    `;

    // Create projects table
    console.log('📋 Creating projects table...');
    await sql`
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
      )
    `;

    // Create imported_files table
    console.log('📁 Creating imported files table...');
    await sql`
      CREATE TABLE IF NOT EXISTS imported_files (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          filename VARCHAR(255) NOT NULL,
          file_type VARCHAR(50) NOT NULL,
          file_size INTEGER,
          status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
          error_message TEXT,
          records_processed INTEGER DEFAULT 0,
          processed_at TIMESTAMPTZ,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;

    // Create payroll_data table
    console.log('💰 Creating payroll data table...');
    await sql`
      CREATE TABLE IF NOT EXISTS payroll_data (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          imported_file_id UUID NOT NULL,
          source_type VARCHAR(50) NOT NULL,
          employee_name VARCHAR(255) NOT NULL,
          employee_id VARCHAR(100),
          project_identifier VARCHAR(100),
          work_date DATE,
          hours_worked DECIMAL(8,2),
          hourly_rate DECIMAL(10,2),
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
          expense_amount DECIMAL(12,2),
          expense_category VARCHAR(100),
          expense_description TEXT,
          total_burden DECIMAL(12,2),
          true_cost DECIMAL(12,2),
          burden_rate DECIMAL(5,4),
          created_at TIMESTAMPTZ DEFAULT NOW(),
          FOREIGN KEY (imported_file_id) REFERENCES imported_files(id) ON DELETE CASCADE,
          FOREIGN KEY (project_identifier) REFERENCES projects(project_identifier) ON DELETE SET NULL
      )
    `;

    // Create employee_costs table
    console.log('📊 Creating employee costs table...');
    await sql`
      CREATE TABLE IF NOT EXISTS employee_costs (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          employee_name VARCHAR(255) NOT NULL,
          employee_id VARCHAR(100),
          period_start DATE NOT NULL,
          period_end DATE NOT NULL,
          total_hours DECIMAL(10,2) DEFAULT 0,
          gross_pay DECIMAL(12,2) DEFAULT 0,
          total_taxes DECIMAL(12,2) DEFAULT 0,
          total_benefits DECIMAL(12,2) DEFAULT 0,
          total_employer_burden DECIMAL(12,2) DEFAULT 0,
          total_true_cost DECIMAL(12,2) DEFAULT 0,
          average_hourly_rate DECIMAL(10,2),
          burden_rate DECIMAL(5,4),
          project_allocations JSONB DEFAULT '{}',
          created_at TIMESTAMPTZ DEFAULT NOW(),
          updated_at TIMESTAMPTZ DEFAULT NOW(),
          UNIQUE(employee_name, period_start, period_end)
      )
    `;

    // Create activity logs table
    console.log('📝 Creating activity logs table...');
    await sql`
      CREATE TABLE IF NOT EXISTS activity_logs (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID,
          organization_id UUID,
          action_type VARCHAR(100) NOT NULL,
          resource_type VARCHAR(100),
          resource_id UUID,
          details JSONB DEFAULT '{}',
          ip_address INET,
          user_agent TEXT,
          created_at TIMESTAMPTZ DEFAULT NOW(),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
          FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
      )
    `;

    // Create indexes
    console.log('⚡ Creating indexes for performance...');
    await sql`CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_projects_identifier ON projects(project_identifier)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_payroll_data_employee ON payroll_data(employee_name)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_payroll_data_project ON payroll_data(project_identifier)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_employee_costs_name ON employee_costs(employee_name)`;

    // Add triggers
    console.log('🔧 Setting up triggers...');
    await sql`DROP TRIGGER IF EXISTS update_users_timestamp ON users`;
    await sql`
      CREATE TRIGGER update_users_timestamp 
      BEFORE UPDATE ON users 
      FOR EACH ROW 
      EXECUTE FUNCTION update_updated_at_column()
    `;
    
    await sql`DROP TRIGGER IF EXISTS update_organizations_timestamp ON organizations`;
    await sql`
      CREATE TRIGGER update_organizations_timestamp 
      BEFORE UPDATE ON organizations 
      FOR EACH ROW 
      EXECUTE FUNCTION update_updated_at_column()
    `;

    // Insert sample data
    console.log('📋 Adding sample projects...');
    await sql`
      INSERT INTO projects (project_identifier, client_name, description, hourly_rate, status) VALUES
      ('PROJ-001', 'Client Alpha', 'Software Development Project', 150.00, 'active'),
      ('PROJ-002', 'Client Beta', 'Consulting Services', 200.00, 'active'),
      ('PROJ-003', 'Client Gamma', 'Data Analysis Project', 125.00, 'active'),
      ('INTERNAL', 'Internal', 'Internal company activities', 0.00, 'active')
      ON CONFLICT (project_identifier) DO NOTHING
    `;

    // Show final status
    console.log('');
    console.log('✅ Checking what tables were created...');
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;
    
    console.log('');
    console.log('🎉 Database setup complete!');
    console.log('');
    console.log('📊 Your database now has these tables:');
    tables.forEach(table => {
      console.log(`   ✅ ${table.table_name}`);
    });

    // Check projects
    const projects = await sql`SELECT project_identifier, client_name FROM projects`;
    console.log('');
    console.log('📋 Sample projects added:');
    projects.forEach(project => {
      console.log(`   🔹 ${project.project_identifier}: ${project.client_name}`);
    });

    console.log('');
    console.log('🚀 Your Prophet Growth Analysis database is ready!');
    console.log('');
    console.log('Next steps:');
    console.log('   • Start development: npm run dev');
    console.log('   • View your database: https://console.neon.tech/app/projects/holy-fog-47054548/branches');

  } catch (error) {
    console.log('❌ Setup failed:', error.message);
    console.log('Details:', error);
  }
}

setupDatabase();