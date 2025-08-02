const { Client } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

async function setupDatabase() {
  const connectionString = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('Error: NEON_DATABASE_URL or DATABASE_URL environment variable is required');
    process.exit(1);
  }

  const client = new Client({ connectionString });

  try {
    await client.connect();
    console.log('Connected to Neon database');

    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'migrations', '001_initial_schema.sql');
    const migrationContent = fs.readFileSync(migrationPath, 'utf-8');

    // Parse SQL file more carefully
    // First, remove all single-line comments
    let cleanedContent = migrationContent
      .split('\n')
      .map((line) => {
        const commentIndex = line.indexOf('--');
        if (commentIndex >= 0) {
          return line.substring(0, commentIndex);
        }
        return line;
      })
      .join('\n');

    // Now split by semicolons, but handle function bodies
    const statements = [];
    let currentStatement = '';
    let inFunction = false;

    const lines = cleanedContent.split('\n');
    for (const line of lines) {
      const trimmedLine = line.trim();

      // Check if we're entering or leaving a function
      if (trimmedLine.match(/^CREATE\s+(OR\s+REPLACE\s+)?FUNCTION/i)) {
        inFunction = true;
      }
      if (trimmedLine.match(/^\$\$\s+language/i)) {
        inFunction = false;
      }

      currentStatement += line + '\n';

      // If we find a semicolon and we're not in a function, it's the end of a statement
      if (line.trim().endsWith(';') && !inFunction) {
        const stmt = currentStatement.trim();
        if (stmt.length > 0) {
          statements.push(stmt);
        }
        currentStatement = '';
      }
    }

    // Add any remaining statement
    if (currentStatement.trim().length > 0) {
      statements.push(currentStatement.trim());
    }

    console.log(`Running ${statements.length} SQL statements...`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.length > 0) {
        try {
          console.log(
            `[${i + 1}/${statements.length}] Executing: ${statement.substring(0, 60)}...`
          );
          await client.query(statement);
        } catch (err) {
          console.error(`Error executing statement ${i + 1}:`, err.message);
          console.error('Statement:', statement);
          throw err;
        }
      }
    }

    console.log('\nMigration completed successfully!');

    // Verify tables were created
    const result = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    console.log('\nCreated tables:');
    result.rows.forEach((row) => console.log(`  ✓ ${row.table_name}`));
  } catch (error) {
    console.error('Setup failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

setupDatabase();
