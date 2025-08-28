/**
 * Jest Test Setup
 * CEO Payroll Analytics Platform
 */

// Environment setup for testing
if (!process.env.NODE_ENV) {
  (process.env as any).NODE_ENV = 'test';
}
if (!process.env.NEON_DATABASE_URL) {
  process.env.NEON_DATABASE_URL = 'postgresql://test:test@localhost:5432/payroll_test';
}
if (!process.env.ANTHROPIC_API_KEY) {
  process.env.ANTHROPIC_API_KEY = 'test-key';
}
if (!process.env.ELEVENLABS_API_KEY) {
  process.env.ELEVENLABS_API_KEY = 'test-key';
}

// Extend Jest matchers
expect.extend({
  toBeValidApiResponse(received: any) {
    const pass = received && typeof received === 'object' && received.status;
    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid API response`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid API response with status field`,
        pass: false,
      };
    }
  },

  toHaveValidPayrollData(received: any) {
    const pass = Array.isArray(received) && received.every(item => 
      item.employee_name && 
      typeof item.total_cost === 'number' &&
      typeof item.burden_rate === 'number'
    );
    
    if (pass) {
      return {
        message: () => `expected ${received} not to have valid payroll data`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to have valid payroll data structure`,
        pass: false,
      };
    }
  }
});

// Mock console methods in test environment
if (process.env.NODE_ENV === 'test') {
  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
}

// Global test utilities
(global as any).testUtils = {
  createMockEmployee: (id: string = '1') => ({
    employee_name: `Test Employee ${id}`,
    employee_id: id,
    total_hours: 40,
    gross_pay: 5000,
    total_taxes: 1000,
    total_benefits: 500,
    total_employer_burden: 800,
    total_true_cost: 6300,
    average_hourly_rate: 125,
    burden_rate: 0.26,
    period_start: '2024-01-01',
    period_end: '2024-01-31'
  }),

  createMockApiRequest: (method: string, body?: any) => ({
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  })
};

// TypeScript declaration for global utilities
declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidApiResponse(): R;
      toHaveValidPayrollData(): R;
    }
  }
  
  var testUtils: {
    createMockEmployee: (id?: string) => any;
    createMockApiRequest: (method: string, body?: any) => any;
  };
}