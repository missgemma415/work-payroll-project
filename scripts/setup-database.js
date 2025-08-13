const { neon } = require('@neondatabase/serverless');

const sql = neon(process.env.NEON_DATABASE_URL);

async function setupDatabase() {
  console.log('Setting up database schema...');
  
  try {
    // Create projects table
    await sql`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        project_identifier VARCHAR(255) UNIQUE NOT NULL,
        client_name VARCHAR(255),
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ Projects table created');

    // Create imported_files table
    await sql`
      CREATE TABLE IF NOT EXISTS imported_files (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        file_type VARCHAR(50),
        file_size INTEGER,
        status VARCHAR(50) DEFAULT 'pending',
        records_processed INTEGER,
        error_message TEXT,
        processed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ Imported files table created');

    // Create payroll_data table
    await sql`
      CREATE TABLE IF NOT EXISTS payroll_data (
        id SERIAL PRIMARY KEY,
        imported_file_id INTEGER REFERENCES imported_files(id),
        source_type VARCHAR(50),
        employee_name VARCHAR(255),
        employee_id VARCHAR(100),
        project_identifier VARCHAR(255),
        work_date DATE,
        pay_period_start DATE,
        pay_period_end DATE,
        hours_worked DECIMAL(8,2),
        hourly_rate DECIMAL(10,2),
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
        total_burden DECIMAL(12,2),
        true_cost DECIMAL(12,2),
        burden_rate DECIMAL(5,4),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `;
    console.log('✅ Payroll data table created');

    // Create employee_costs table  
    await sql`
      CREATE TABLE IF NOT EXISTS employee_costs (
        id SERIAL PRIMARY KEY,
        employee_name VARCHAR(255),
        employee_id VARCHAR(100),
        period_start DATE,
        period_end DATE,
        total_hours DECIMAL(8,2),
        gross_pay DECIMAL(12,2),
        total_taxes DECIMAL(12,2),
        total_benefits DECIMAL(12,2),
        total_employer_burden DECIMAL(12,2),
        total_true_cost DECIMAL(12,2),
        average_hourly_rate DECIMAL(10,2),
        burden_rate DECIMAL(5,4),
        project_allocations JSONB,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW(),
        UNIQUE(employee_name, period_start, period_end)
      )
    `;
    console.log('✅ Employee costs table created');

    // Test connection
    const result = await sql`SELECT 1 as test`;
    console.log('✅ Database connection successful');
    
    console.log('🎉 Database schema setup complete!');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

setupDatabase();