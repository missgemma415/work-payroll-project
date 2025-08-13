/**
 * Database Connection for CEO Payroll Analysis Platform
 * Clean, simple connection using Neon PostgreSQL Serverless
 */

import { neon } from '@neondatabase/serverless';

// Get database URL from environment
const databaseUrl = process.env['NEON_DATABASE_URL'];

if (!databaseUrl) {
  throw new Error('NEON_DATABASE_URL environment variable is required');
}

// Create connection using Neon serverless
export const sql = neon(databaseUrl);

/**
 * Execute a database query
 */
export async function query<T = unknown>(
  text: string, 
  params: unknown[] = []
): Promise<T[]> {
  try {
    // Always use sql.query() for both parameterized and non-parameterized queries
    return await sql.query(text, params) as T[];
  } catch (error) {
    console.error('Database query error:', {
      query: text,
      params,
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
}

/**
 * Test database connection
 */
export async function testConnection(): Promise<boolean> {
  try {
    await sql`SELECT 1 as test`;
    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

// Default export for convenience
const database = { sql, query, testConnection };
export default database;
