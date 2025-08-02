const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function runMigration() {
  const databaseUrl = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error('Error: NEON_DATABASE_URL or DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const sql = neon(databaseUrl);

  try {
    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'migrations', '001_initial_schema.sql');
    const migrationContent = fs.readFileSync(migrationPath, 'utf-8');

    console.log('Running migration on Neon database...');
    console.log('Database URL:', databaseUrl.replace(/:[^:@]+@/, ':****@'));

    // Execute the entire migration as one query
    const result = await sql`${migrationContent}`;

    console.log('Migration completed successfully!');

    // Verify tables were created
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `;

    console.log('\nCreated tables:');
    tables.forEach((row) => console.log(`  - ${row.table_name}`));
  } catch (error) {
    console.error('Migration failed:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    process.exit(1);
  }
}

runMigration();
