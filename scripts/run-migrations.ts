#!/usr/bin/env tsx

/**
 * Database Migration Runner for Prophet Growth Analysis
 * Neon PostgreSQL Database Setup
 */

import { readFile } from 'fs/promises';
import { join } from 'path';
import { neon } from '@neondatabase/serverless';

// Configuration
interface MigrationConfig {
  databaseUrl: string;
  migrationsDir: string;
  verbose: boolean;
}

interface Migration {
  id: string;
  filename: string;
  content: string;
}

class MigrationRunner {
  private sql: ReturnType<typeof neon>;
  private config: MigrationConfig;

  constructor(config: MigrationConfig) {
    this.config = config;
    this.sql = neon(config.databaseUrl);
  }

  /**
   * Create migrations tracking table
   */
  private async createMigrationsTable(): Promise<void> {
    const createTableSQL = `
      CREATE TABLE IF NOT EXISTS migrations (
        id VARCHAR(255) PRIMARY KEY,
        filename VARCHAR(255) NOT NULL,
        applied_at TIMESTAMPTZ DEFAULT NOW()
      );
    `;

    try {
      await this.sql`${createTableSQL}`;
      if (this.config.verbose) {
        console.log('✅ Migrations table ready');
      }
    } catch (error) {
      throw new Error(`Failed to create migrations table: ${error}`);
    }
  }

  /**
   * Get list of applied migrations
   */
  private async getAppliedMigrations(): Promise<string[]> {
    try {
      const result = await this.sql`SELECT id FROM migrations ORDER BY applied_at`;
      return (result as Array<{id: string}>).map((row) => row.id);
    } catch (error) {
      console.warn('Could not fetch applied migrations, assuming none:', error);
      return [];
    }
  }

  /**
   * Load migration files
   */
  private async loadMigrations(): Promise<Migration[]> {
    const migrations: Migration[] = [];
    
    // Define migration files in order
    const migrationFiles = [
      '001_postgresql_base_schema.sql',
      '002_payroll_postgresql_schema.sql'
    ];

    for (const filename of migrationFiles) {
      try {
        const filePath = join(this.config.migrationsDir, filename);
        const content = await readFile(filePath, 'utf-8');
        const id = filename.replace('.sql', '');
        
        migrations.push({ id, filename, content });
        
        if (this.config.verbose) {
          console.log(`📄 Loaded migration: ${filename}`);
        }
      } catch (error) {
        console.warn(`⚠️  Could not load migration ${filename}:`, error);
      }
    }

    return migrations;
  }

  /**
   * Apply a single migration
   */
  private async applyMigration(migration: Migration): Promise<void> {
    try {
      console.log(`🔄 Applying migration: ${migration.filename}`);

      // Execute the migration SQL
      await this.sql`${migration.content}`;

      // Record that this migration was applied
      await this.sql`
        INSERT INTO migrations (id, filename) 
        VALUES (${migration.id}, ${migration.filename})
        ON CONFLICT (id) DO NOTHING
      `;

      console.log(`✅ Applied migration: ${migration.filename}`);
    } catch (error) {
      throw new Error(`Failed to apply migration ${migration.filename}: ${error}`);
    }
  }

  /**
   * Run all pending migrations
   */
  async runMigrations(): Promise<void> {
    console.log('🚀 Starting database migrations...');

    try {
      // Ensure migrations table exists
      await this.createMigrationsTable();

      // Get applied migrations
      const appliedMigrations = await this.getAppliedMigrations();
      
      // Load available migrations
      const availableMigrations = await this.loadMigrations();

      // Filter pending migrations
      const pendingMigrations = availableMigrations.filter(
        (migration) => !appliedMigrations.includes(migration.id)
      );

      if (pendingMigrations.length === 0) {
        console.log('✅ All migrations already applied');
        return;
      }

      console.log(`📋 Found ${pendingMigrations.length} pending migrations`);

      // Apply pending migrations
      for (const migration of pendingMigrations) {
        await this.applyMigration(migration);
      }

      console.log('🎉 All migrations completed successfully!');
    } catch (error) {
      console.error('❌ Migration failed:', error);
      process.exit(1);
    }
  }

  /**
   * Test database connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.sql`SELECT 1 as test`;
      console.log('✅ Database connection successful');
      return true;
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      return false;
    }
  }

  /**
   * Show migration status
   */
  async showStatus(): Promise<void> {
    try {
      await this.createMigrationsTable();
      
      const appliedMigrations = await this.getAppliedMigrations();
      const availableMigrations = await this.loadMigrations();

      console.log('\n📊 Migration Status:');
      console.log('===================');

      for (const migration of availableMigrations) {
        const isApplied = appliedMigrations.includes(migration.id);
        const status = isApplied ? '✅ Applied' : '⏳ Pending';
        console.log(`${status} ${migration.filename}`);
      }

      const pendingCount = availableMigrations.length - appliedMigrations.length;
      console.log(`\n📈 Total: ${availableMigrations.length} migrations`);
      console.log(`✅ Applied: ${appliedMigrations.length}`);
      console.log(`⏳ Pending: ${pendingCount}`);
    } catch (error) {
      console.error('❌ Could not show status:', error);
    }
  }
}

/**
 * Main execution
 */
async function main() {
  // Parse command line arguments
  const command = process.argv[2] || 'run';
  const verbose = process.argv.includes('--verbose') || process.argv.includes('-v');

  // Get database URL
  const databaseUrl = process.env.NEON_DATABASE_URL;
  if (!databaseUrl) {
    console.error('❌ NEON_DATABASE_URL environment variable is required');
    console.log('');
    console.log('Please set your Neon database connection string:');
    console.log('export NEON_DATABASE_URL="postgresql://[user]:[password]@[host]/[database]?sslmode=require"');
    console.log('');
    console.log('Get your connection string from:');
    console.log('https://console.neon.tech/app/projects/holy-fog-47054548/branches');
    process.exit(1);
  }

  // Configuration
  const config: MigrationConfig = {
    databaseUrl,
    migrationsDir: join(process.cwd(), 'migrations'),
    verbose
  };

  const runner = new MigrationRunner(config);

  // Execute command
  switch (command) {
    case 'run':
    case 'migrate':
      await runner.runMigrations();
      break;

    case 'status':
      await runner.showStatus();
      break;

    case 'test':
    case 'test-connection':
      const isConnected = await runner.testConnection();
      process.exit(isConnected ? 0 : 1);
      break;

    case 'help':
      console.log('Database Migration Runner');
      console.log('');
      console.log('Usage: npm run migrate [command]');
      console.log('');
      console.log('Commands:');
      console.log('  run, migrate     Run pending migrations (default)');
      console.log('  status          Show migration status');
      console.log('  test            Test database connection');
      console.log('  help            Show this help');
      console.log('');
      console.log('Options:');
      console.log('  --verbose, -v   Verbose output');
      break;

    default:
      console.error(`❌ Unknown command: ${command}`);
      console.log('Run "npm run migrate help" for usage information');
      process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Migration runner failed:', error);
    process.exit(1);
  });
}

export { MigrationRunner };