/**
 * Database Connection for CEO Payroll Analysis Platform
 * Clean, simple connection using Neon PostgreSQL Serverless
 */

import { neon } from '@neondatabase/serverless';

// Lazy connection - only create when actually needed
let sql: ReturnType<typeof neon> | null = null;

function getSqlConnection() {
  if (!sql) {
    const databaseUrl = process.env['NEON_DATABASE_URL'];
    if (!databaseUrl) {
      throw new Error('NEON_DATABASE_URL environment variable is required');
    }
    sql = neon(databaseUrl);
  }
  return sql;
}

// Export the lazy connection for backward compatibility
export { getSqlConnection as sql };

/**
 * Execute a database query
 */
export async function query<T = unknown>(
  text: string, 
  params: unknown[] = []
): Promise<T[]> {
  try {
    const sqlConnection = getSqlConnection();
    // Always use sql.query() for both parameterized and non-parameterized queries
    return await sqlConnection.query(text, params) as T[];
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
 * Execute a database query and return the first result or null
 */
export async function queryOne<T = unknown>(
  text: string, 
  params: unknown[] = []
): Promise<T | null> {
  try {
    const results = await query<T>(text, params);
    return results.length > 0 ? results[0] : null;
  } catch (error) {
    console.error('Database queryOne error:', {
      query: text,
      params,
      error: error instanceof Error ? error.message : String(error)
    });
    throw error;
  }
}

/**
 * Database utility functions
 */
export class DatabaseUtils {
  /**
   * Safely escape SQL identifiers (table names, column names, etc.)
   */
  static escapeIdentifier(identifier: string): string {
    // Remove any potentially dangerous characters and wrap in quotes
    const cleaned = identifier.replace(/[^a-zA-Z0-9_]/g, '');
    return `"${cleaned}"`;
  }

  /**
   * Generate a WHERE clause with parameterized values
   */
  static buildWhereClause(conditions: Record<string, unknown>): { clause: string; params: unknown[] } {
    const keys = Object.keys(conditions);
    if (keys.length === 0) {
      return { clause: '', params: [] };
    }

    const whereParts = keys.map((key, index) => 
      `${this.escapeIdentifier(key)} = $${index + 1}`
    );
    
    return {
      clause: `WHERE ${whereParts.join(' AND ')}`,
      params: Object.values(conditions)
    };
  }

  /**
   * Generate a unique ID
   */
  static generateId(): string {
    return crypto.randomUUID();
  }

  /**
   * Format date for database storage
   */
  static formatDate(date: Date): string {
    return date.toISOString();
  }

  /**
   * Safely parse JSON with fallback
   */
  static parseJSON<T>(jsonString: string | null): T | null {
    if (!jsonString) return null;
    
    try {
      return JSON.parse(jsonString) as T;
    } catch {
      return null;
    }
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
const database = { sql, query, queryOne, testConnection, DatabaseUtils };
export default database;
