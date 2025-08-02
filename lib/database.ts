/**
 * Database Connection Utility for Neon PostgreSQL
 * Prophet Growth Analysis Platform
 *
 * Features:
 * - Connection pooling with @neondatabase/serverless
 * - Environment variable configuration
 * - Proper error handling and logging
 * - TypeScript strict mode support
 */

import { neon } from '@neondatabase/serverless';

import type { NeonQueryFunction } from '@neondatabase/serverless';

// Environment configuration
interface DatabaseConfig {
  url: string;
  pooling?: boolean;
  timeout?: number;
}

// Database connection singleton
class DatabaseConnection {
  private static instance: DatabaseConnection;
  private sql: NeonQueryFunction<false, false>;
  private config: DatabaseConfig;

  private constructor() {
    this.config = this.validateConfig();
    this.sql = neon(this.config.url);
  }

  /**
   * Get singleton database instance
   */
  public static getInstance(): DatabaseConnection {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new DatabaseConnection();
    }
    return DatabaseConnection.instance;
  }

  /**
   * Validate environment configuration
   */
  private validateConfig(): DatabaseConfig {
    const url = process.env['NEON_DATABASE_URL'];

    if (!url) {
      throw new Error(
        'NEON_DATABASE_URL environment variable is required. ' +
          'Please set it to your Neon PostgreSQL connection string.'
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch (error) {
      throw new Error(
        `Invalid NEON_DATABASE_URL format: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }

    return {
      url,
      pooling: true,
      timeout: 30000, // 30 seconds
    };
  }

  /**
   * Get the SQL query function
   */
  public getSQL(): NeonQueryFunction<false, false> {
    return this.sql;
  }

  /**
   * Execute a raw SQL query with proper error handling
   * Note: Neon uses template literals, so params are embedded in the text
   */
  public async query<T = unknown>(
    text: string,
    _params?: (string | number | boolean | null | Date | Buffer)[]
  ): Promise<T[]> {
    try {
      // For neon, we use template literals - params should be embedded in text
      const result = await this.sql([text] as unknown as TemplateStringsArray);
      return result as T[];
    } catch (error) {
      console.error('Database query error:', {
        query: text,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw new DatabaseError(
        `Query failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error
      );
    }
  }

  /**
   * Execute a query and return the first result
   */
  public async queryOne<T = unknown>(
    text: string,
    params?: (string | number | boolean | null | Date | Buffer)[]
  ): Promise<T | null> {
    const results = await this.query<T>(text, params);
    return results.length > 0 ? (results[0] ?? null) : null;
  }

  /**
   * Execute multiple queries in a transaction
   */
  public async transaction<T>(
    queries: Array<{
      text: string;
      params?: (string | number | boolean | null | Date | Buffer)[];
    }>
  ): Promise<T[]> {
    const results: T[] = [];

    try {
      // Note: Neon serverless doesn't support traditional transactions
      // but provides atomicity at the query level
      for (const query of queries) {
        const result = await this.query<T>(query.text, query.params);
        results.push(...result);
      }

      return results;
    } catch (error) {
      console.error('Transaction failed:', {
        queries: queries.map((q) => ({ text: q.text, paramCount: q.params?.length ?? 0 })),
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }

  /**
   * Test database connection
   */
  public async testConnection(): Promise<boolean> {
    try {
      await this.query('SELECT 1 as test');
      return true;
    } catch (error) {
      console.error('Database connection test failed:', error);
      return false;
    }
  }

  /**
   * Get database configuration (without sensitive data)
   */
  public getConfig(): Omit<DatabaseConfig, 'url'> & { hasUrl: boolean } {
    return {
      pooling: this.config.pooling ?? false,
      timeout: this.config.timeout ?? 30000,
      hasUrl: !!this.config.url,
    };
  }
}

/**
 * Custom database error class
 */
export class DatabaseError extends Error {
  public readonly originalError?: unknown;

  constructor(message: string, originalError?: unknown) {
    super(message);
    this.name = 'DatabaseError';
    this.originalError = originalError;
  }
}

/**
 * Database utility functions
 */
export class DatabaseUtils {
  /**
   * Format date for PostgreSQL
   */
  static formatDate(date: Date): string {
    return date.toISOString();
  }

  /**
   * Parse JSON safely
   */
  static parseJSON<T>(jsonString: string | null): T | null {
    if (!jsonString) return null;

    try {
      return JSON.parse(jsonString) as T;
    } catch (error) {
      console.warn('Failed to parse JSON:', { jsonString, error });
      return null;
    }
  }

  /**
   * Generate UUID v4 (for use as primary keys)
   */
  static generateId(): string {
    return crypto.randomUUID();
  }

  /**
   * Escape SQL identifier (table/column names)
   */
  static escapeIdentifier(identifier: string): string {
    return `"${identifier.replace(/"/g, '""')}"`;
  }

  /**
   * Build WHERE clause from object
   */
  static buildWhereClause(
    conditions: Record<string, unknown>,
    startIndex = 1
  ): { clause: string; params: unknown[] } {
    const entries = Object.entries(conditions).filter(([_, value]) => value !== undefined);

    if (entries.length === 0) {
      return { clause: '', params: [] };
    }

    const clauses = entries.map(
      ([key], index) => `${DatabaseUtils.escapeIdentifier(key)} = $${startIndex + index}`
    );

    const params = entries.map(([, value]) => value);

    return {
      clause: `WHERE ${clauses.join(' AND ')}`,
      params,
    };
  }
}

// Export singleton instance and utilities
const db = DatabaseConnection.getInstance();

/**
 * Get the SQL query function (main export)
 */
export const sql = db.getSQL();

/**
 * Execute a database query with error handling
 */
export const query = db.query.bind(db);

/**
 * Execute a query and return the first result
 */
export const queryOne = db.queryOne.bind(db);

/**
 * Execute multiple queries in sequence
 */
export const transaction = db.transaction.bind(db);

/**
 * Test database connection
 */
export const testConnection = db.testConnection.bind(db);

/**
 * Get database configuration
 */
export const getDbConfig = db.getConfig.bind(db);

// DatabaseUtils is already exported above as a class

// Export types
export type { NeonQueryFunction } from '@neondatabase/serverless';

/**
 * Default export for convenience
 */
const database = {
  sql,
  query,
  queryOne,
  transaction,
  testConnection,
  getDbConfig,
  utils: DatabaseUtils,
  DatabaseError,
};

export default database;
