require('dotenv').config({ path: '.env.local' });
const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

async function runMigrations() {
  const connectionString = process.env.NEON_DATABASE_URL;
  
  if (!connectionString) {
    console.log('❌ NEON_DATABASE_URL not found');
    return;
  }

  console.log('🚀 Starting database migrations...');
  
  try {
    const sql = neon(connectionString);
    
    // Create migrations tracking table
    console.log('📋 Creating migrations table...');
    await sql`
      CREATE TABLE IF NOT EXISTS migrations (
        id VARCHAR(255) PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        applied_at TIMESTAMPTZ DEFAULT NOW()
      )
    `;
    console.log('✅ Migrations table ready');

    // Check what migrations have been applied
    const appliedMigrations = await sql`SELECT id FROM migrations ORDER BY applied_at`;
    const appliedIds = appliedMigrations.map(row => row.id);
    console.log(`📊 Found ${appliedIds.length} previously applied migrations`);

    // Migration files to run
    const migrationFiles = [
      '001_postgresql_base_schema.sql',
      '002_payroll_postgresql_schema.sql'
    ];

    let migrationsRun = 0;

    for (const filename of migrationFiles) {
      const migrationId = filename.replace('.sql', '');
      
      if (appliedIds.includes(migrationId)) {
        console.log(`⏭️  Skipping ${filename} (already applied)`);
        continue;
      }

      console.log(`🔄 Applying migration: ${filename}`);
      
      try {
        // Read migration file
        const filePath = path.join(__dirname, 'migrations', filename);
        const migrationSQL = fs.readFileSync(filePath, 'utf-8');
        
        // Execute migration
        await sql([migrationSQL]);
        
        // Record migration as applied
        await sql`INSERT INTO migrations (id, filename) VALUES (${migrationId}, ${filename})`;
        
        console.log(`✅ Applied migration: ${filename}`);
        migrationsRun++;
      } catch (error) {
        console.log(`❌ Failed to apply ${filename}:`, error.message);
        break;
      }
    }

    if (migrationsRun > 0) {
      console.log('');
      console.log('🎉 Database setup complete!');
      console.log('');
      console.log('📊 Your database now has the following tables:');
      
      // List all tables
      const tables = await sql`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        ORDER BY table_name
      `;
      
      tables.forEach(table => {
        console.log(`   ✅ ${table.table_name}`);
      });
      
      console.log('');
      console.log('🚀 Ready for development! Run: npm run dev');
    } else {
      console.log('✅ All migrations already applied - database is up to date!');
    }

  } catch (error) {
    console.log('❌ Migration failed:', error.message);
  }
}

runMigrations();