import { Pool } from 'pg';

import { env } from '@/lib/env';

import type { PoolClient } from 'pg';

// Create a singleton database pool
class DatabasePool {
  private static instance: Pool | null = null;

  static getInstance(): Pool {
    DatabasePool.instance ??= new Pool({
      connectionString: env.DATABASE_URL,
      max: 20, // Maximum number of clients in the pool
      idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
      connectionTimeoutMillis: 2000, // Return an error after 2 seconds if connection could not be established
      ssl: env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    });
    return DatabasePool.instance;
  }

  static async closePool(): Promise<void> {
    if (DatabasePool.instance) {
      await DatabasePool.instance.end();
      DatabasePool.instance = null;
    }
  }
}

// Get database pool instance
export const db = DatabasePool.getInstance();

// Helper function to execute queries
export async function query<T = unknown>(text: string, params?: unknown[]): Promise<T[]> {
  const client = await db.connect();
  try {
    const result = await client.query(text, params);
    return result.rows as T[];
  } finally {
    client.release();
  }
}

// Helper function to execute a single query and return first row
export async function queryOne<T = unknown>(text: string, params?: unknown[]): Promise<T | null> {
  const rows = await query<T>(text, params);
  return rows[0] ?? null;
}

// Helper function to execute transaction
export async function transaction<T>(callback: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await db.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// Test database connection
export async function testConnection(): Promise<boolean> {
  try {
    await query('SELECT 1');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}
