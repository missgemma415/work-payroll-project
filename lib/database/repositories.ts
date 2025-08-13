/**
 * Database Repository Patterns
 * Prophet Growth Analysis Platform
 *
 * Provides type-safe data access patterns for core entities:
 * - Users, Organizations, Conversations
 * - Employees, Forecasts, Analytics
 */

import { DatabaseUtils, query, queryOne } from '../database';

import type { User, Organization, Conversation, Employee } from '../types/database';

/**
 * Base Repository with common CRUD operations
 */
abstract class BaseRepository<T extends { id: string; created_at?: string; updated_at?: string }> {
  protected abstract tableName: string;
  protected abstract selectFields: string;

  /**
   * Find record by ID
   */
  async findById(id: string): Promise<T | null> {
    const sql = `
      SELECT ${this.selectFields}
      FROM ${DatabaseUtils.escapeIdentifier(this.tableName)}
      WHERE id = $1
    `;
    return await queryOne<T>(sql, [id]);
  }

  /**
   * Find records with conditions
   */
  async findBy(conditions: Partial<T>, limit?: number): Promise<T[]> {
    const { clause, params } = DatabaseUtils.buildWhereClause(conditions);
    const limitClause = limit ? `LIMIT ${limit}` : '';

    const sql = `
      SELECT ${this.selectFields}
      FROM ${DatabaseUtils.escapeIdentifier(this.tableName)}
      ${clause}
      ORDER BY created_at DESC
      ${limitClause}
    `;

    return await query<T>(sql, params);
  }

  /**
   * Create new record
   */
  async create(data: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T> {
    const id = DatabaseUtils.generateId();
    const now = DatabaseUtils.formatDate(new Date());

    const fields = Object.keys(data);
    const values = Object.values(data);
    const placeholders = values.map((_, i) => `$${i + 4}`).join(', ');

    const sql = `
      INSERT INTO ${DatabaseUtils.escapeIdentifier(this.tableName)}
      (id, created_at, updated_at, ${fields.map((field) => DatabaseUtils.escapeIdentifier(field)).join(', ')})
      VALUES ($1, $2, $3, ${placeholders})
      RETURNING ${this.selectFields}
    `;

    return (await queryOne<T>(sql, [id, now, now, ...values])) as T;
  }

  /**
   * Update record by ID
   */
  async update(
    id: string,
    data: Partial<Omit<T, 'id' | 'created_at' | 'updated_at'>>
  ): Promise<T | null> {
    const fields = Object.keys(data);
    const values = Object.values(data);
    const now = DatabaseUtils.formatDate(new Date());

    if (fields.length === 0) {
      return this.findById(id);
    }

    const setClause = fields
      .map((field, i) => `${DatabaseUtils.escapeIdentifier(field)} = $${i + 3}`)
      .join(', ');

    const sql = `
      UPDATE ${DatabaseUtils.escapeIdentifier(this.tableName)}
      SET ${setClause}, updated_at = $2
      WHERE id = $1
      RETURNING ${this.selectFields}
    `;

    return await queryOne<T>(sql, [id, now, ...values]);
  }

  /**
   * Delete record by ID
   */
  async delete(id: string): Promise<boolean> {
    const sql = `
      DELETE FROM ${DatabaseUtils.escapeIdentifier(this.tableName)}
      WHERE id = $1
    `;

    const result = await query(sql, [id]);
    return result.length > 0;
  }

  /**
   * Count records with conditions
   */
  async count(conditions: Partial<T> = {}): Promise<number> {
    const { clause, params } = DatabaseUtils.buildWhereClause(conditions);

    const sql = `
      SELECT COUNT(*) as count
      FROM ${DatabaseUtils.escapeIdentifier(this.tableName)}
      ${clause}
    `;

    const result = await queryOne<{ count: string }>(sql, params);
    return parseInt(result?.count ?? '0', 10);
  }
}

/**
 * User Repository
 */
export class UserRepository extends BaseRepository<User> {
  protected tableName = 'users';
  protected selectFields = `
    id, clerk_id, email, first_name, last_name, avatar_url,
    organization_id, role, department, position, hire_date,
    status, timezone, preferences, created_at, updated_at
  `;

  /**
   * Find user by Clerk ID
   */
  async findByClerkId(clerkId: string): Promise<User | null> {
    const sql = `
      SELECT ${this.selectFields}
      FROM users
      WHERE clerk_id = $1
    `;
    return await queryOne<User>(sql, [clerkId]);
  }

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    const sql = `
      SELECT ${this.selectFields}
      FROM users
      WHERE email = $1
    `;
    return await queryOne<User>(sql, [email]);
  }

  /**
   * Find users by organization
   */
  async findByOrganization(organizationId: string, limit?: number): Promise<User[]> {
    return this.findBy({ organization_id: organizationId } as Partial<User>, limit);
  }

  /**
   * Update user preferences
   */
  async updatePreferences(id: string, preferences: Record<string, unknown>): Promise<User | null> {
    const sql = `
      UPDATE users
      SET preferences = $2, updated_at = $3
      WHERE id = $1
      RETURNING ${this.selectFields}
    `;

    const now = DatabaseUtils.formatDate(new Date());
    return await queryOne<User>(sql, [id, JSON.stringify(preferences), now]);
  }
}

/**
 * Organization Repository
 */
export class OrganizationRepository extends BaseRepository<Organization> {
  protected tableName = 'organizations';
  protected selectFields = `
    id, name, slug, subscription_tier, settings,
    created_at, updated_at
  `;

  /**
   * Find organization by slug
   */
  async findBySlug(slug: string): Promise<Organization | null> {
    const sql = `
      SELECT ${this.selectFields}
      FROM organizations
      WHERE slug = $1
    `;
    return await queryOne<Organization>(sql, [slug]);
  }

  /**
   * Update organization settings
   */
  async updateSettings(
    id: string,
    settings: Record<string, unknown>
  ): Promise<Organization | null> {
    const sql = `
      UPDATE organizations
      SET settings = $2, updated_at = $3
      WHERE id = $1
      RETURNING ${this.selectFields}
    `;

    const now = DatabaseUtils.formatDate(new Date());
    return await queryOne<Organization>(sql, [id, JSON.stringify(settings), now]);
  }
}

/**
 * Conversation Repository for AI Chat History
 */
export class ConversationRepository extends BaseRepository<Conversation> {
  protected tableName = 'conversations';
  protected selectFields = `
    id, user_id, organization_id, title, messages,
    context, metadata, status, created_at, updated_at
  `;

  /**
   * Find conversations by user
   */
  async findByUser(userId: string, limit = 50): Promise<Conversation[]> {
    return this.findBy({ user_id: userId } as Partial<Conversation>, limit);
  }

  /**
   * Find conversations by organization
   */
  async findByOrganization(organizationId: string, limit = 100): Promise<Conversation[]> {
    return this.findBy({ organization_id: organizationId } as Partial<Conversation>, limit);
  }

  /**
   * Add message to conversation
   */
  async addMessage(
    id: string,
    message: { role: 'user' | 'assistant'; content: string; timestamp?: string }
  ): Promise<Conversation | null> {
    // First get current messages
    const conversation = await this.findById(id);
    if (!conversation) return null;

    const currentMessages =
      DatabaseUtils.parseJSON<Array<unknown>>(JSON.stringify(conversation.messages)) ?? [];
    const newMessage = {
      ...message,
      timestamp: message.timestamp ?? DatabaseUtils.formatDate(new Date()),
    };

    const updatedMessages = [...currentMessages, newMessage];

    const sql = `
      UPDATE conversations
      SET messages = $2, updated_at = $3
      WHERE id = $1
      RETURNING ${this.selectFields}
    `;

    const now = DatabaseUtils.formatDate(new Date());
    return await queryOne<Conversation>(sql, [id, JSON.stringify(updatedMessages), now]);
  }

  /**
   * Update conversation context
   */
  async updateContext(id: string, context: Record<string, unknown>): Promise<Conversation | null> {
    const sql = `
      UPDATE conversations
      SET context = $2, updated_at = $3
      WHERE id = $1
      RETURNING ${this.selectFields}
    `;

    const now = DatabaseUtils.formatDate(new Date());
    return await queryOne<Conversation>(sql, [id, JSON.stringify(context), now]);
  }
}

/**
 * Employee Repository for Financial Analysis
 */
export class EmployeeRepository extends BaseRepository<Employee> {
  protected tableName = 'employees';
  protected selectFields = `
    id, organization_id, name, email, department, position,
    salary, benefits, start_date, end_date, employment_type,
    location, manager_id, cost_center, tags, metadata,
    status, created_at, updated_at
  `;

  /**
   * Find employees by department
   */
  async findByDepartment(organizationId: string, department: string): Promise<Employee[]> {
    return this.findBy({
      organization_id: organizationId,
      department,
    } as Partial<Employee>);
  }

  /**
   * Find employees by manager
   */
  async findByManager(managerId: string): Promise<Employee[]> {
    return this.findBy({ manager_id: managerId } as Partial<Employee>);
  }

  /**
   * Get active employees for cost analysis
   */
  async findActive(organizationId: string): Promise<Employee[]> {
    return this.findBy({
      organization_id: organizationId,
      status: 'active',
    } as Partial<Employee>);
  }

  /**
   * Calculate total cost for employees
   */
  async calculateTotalCost(
    organizationId: string,
    filters?: {
      department?: string;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<{ totalSalary: number; totalBenefits: number; totalCost: number; count: number }> {
    const whereConditions = ['organization_id = $1', 'status = $2'];
    const params: unknown[] = [organizationId, 'active'];
    let paramIndex = 3;

    if (filters?.department) {
      whereConditions.push(`department = $${paramIndex}`);
      params.push(filters.department);
      paramIndex++;
    }

    if (filters?.startDate) {
      whereConditions.push(`start_date >= $${paramIndex}`);
      params.push(filters.startDate);
      paramIndex++;
    }

    if (filters?.endDate) {
      whereConditions.push(`(end_date IS NULL OR end_date <= $${paramIndex})`);
      params.push(filters.endDate);
      paramIndex++;
    }

    const sql = `
      SELECT 
        COALESCE(SUM(salary), 0) as total_salary,
        COALESCE(SUM(benefits), 0) as total_benefits,
        COALESCE(SUM(salary + benefits), 0) as total_cost,
        COUNT(*) as count
      FROM employees
      WHERE ${whereConditions.join(' AND ')}
    `;

    const result = await queryOne<{
      total_salary: string;
      total_benefits: string;
      total_cost: string;
      count: string;
    }>(sql, params);

    return {
      totalSalary: parseFloat(result?.total_salary ?? '0'),
      totalBenefits: parseFloat(result?.total_benefits ?? '0'),
      totalCost: parseFloat(result?.total_cost ?? '0'),
      count: parseInt(result?.count ?? '0', 10),
    };
  }

  /**
   * Get department cost breakdown
   */
  async getDepartmentCostBreakdown(organizationId: string): Promise<
    Array<{
      department: string;
      totalCost: number;
      count: number;
      averageCost: number;
    }>
  > {
    const sql = `
      SELECT 
        department,
        COALESCE(SUM(salary + benefits), 0) as total_cost,
        COUNT(*) as count,
        COALESCE(AVG(salary + benefits), 0) as average_cost
      FROM employees
      WHERE organization_id = $1 AND status = $2
      GROUP BY department
      ORDER BY total_cost DESC
    `;

    const results = await query<{
      department: string;
      total_cost: string;
      count: string;
      average_cost: string;
    }>(sql, [organizationId, 'active']);

    return results.map((row) => ({
      department: row.department,
      totalCost: parseFloat(row.total_cost),
      count: parseInt(row.count, 10),
      averageCost: parseFloat(row.average_cost),
    }));
  }
}

/**
 * Analytics Repository for Financial Insights
 */
export class AnalyticsRepository {
  /**
   * Get team pulse metrics
   */
  async getTeamPulseMetrics(
    organizationId: string,
    dateRange?: {
      startDate: string;
      endDate: string;
    }
  ): Promise<{
    activeUsers: number;
    averageMoodScore: number;
    completedPriorities: number;
    totalKudos: number;
    engagementScore: number;
  }> {
    let dateFilter = '';
    const params = [organizationId];

    if (dateRange) {
      dateFilter = 'AND date BETWEEN $2 AND $3';
      params.push(dateRange.startDate, dateRange.endDate);
    }

    const sql = `
      SELECT 
        COALESCE(AVG(active_users_count), 0) as avg_active_users,
        COALESCE(AVG(average_mood_score), 0) as avg_mood_score,
        COALESCE(SUM(total_priorities_completed), 0) as total_priorities,
        COALESCE(SUM(total_kudos_given), 0) as total_kudos,
        COALESCE(AVG(engagement_score), 0) as avg_engagement
      FROM team_pulse_snapshots
      WHERE organization_id = $1 ${dateFilter}
    `;

    const result = await queryOne<{
      avg_active_users: string;
      avg_mood_score: string;
      total_priorities: string;
      total_kudos: string;
      avg_engagement: string;
    }>(sql, params);

    return {
      activeUsers: Math.round(parseFloat(result?.avg_active_users ?? '0')),
      averageMoodScore: parseFloat(result?.avg_mood_score ?? '0'),
      completedPriorities: parseInt(result?.total_priorities ?? '0', 10),
      totalKudos: parseInt(result?.total_kudos ?? '0', 10),
      engagementScore: parseFloat(result?.avg_engagement ?? '0'),
    };
  }

  /**
   * Get cost trends over time
   */
  async getCostTrends(
    organizationId: string,
    months = 12
  ): Promise<
    Array<{
      month: string;
      totalCost: number;
      employeeCount: number;
      averageCost: number;
    }>
  > {
    const sql = `
      WITH monthly_data AS (
        SELECT 
          DATE_TRUNC('month', created_at) as month,
          SUM(salary + benefits) as total_cost,
          COUNT(*) as employee_count
        FROM employees
        WHERE organization_id = $1 
          AND status = 'active'
          AND created_at >= NOW() - INTERVAL '${months} months'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month DESC
      )
      SELECT 
        month,
        COALESCE(total_cost, 0) as total_cost,
        employee_count,
        CASE 
          WHEN employee_count > 0 THEN total_cost / employee_count
          ELSE 0
        END as average_cost
      FROM monthly_data
    `;

    const results = await query<{
      month: string;
      total_cost: string;
      employee_count: string;
      average_cost: string;
    }>(sql, [organizationId]);

    return results.map((row) => ({
      month: row.month,
      totalCost: parseFloat(row.total_cost),
      employeeCount: parseInt(row.employee_count, 10),
      averageCost: parseFloat(row.average_cost),
    }));
  }
}

// Repository instances (singletons)
export const userRepository = new UserRepository();
export const organizationRepository = new OrganizationRepository();
export const conversationRepository = new ConversationRepository();
export const employeeRepository = new EmployeeRepository();
export const analyticsRepository = new AnalyticsRepository();

// Export all repositories as default
const repositories = {
  user: userRepository,
  organization: organizationRepository,
  conversation: conversationRepository,
  employee: employeeRepository,
  analytics: analyticsRepository,
};

export default repositories;
