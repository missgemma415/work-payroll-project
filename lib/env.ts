import { z } from 'zod';

// Define the schema for our environment variables
const envSchema = z.object({
  // App Configuration
  NEXT_PUBLIC_APP_URL: z.string().url().default('http://localhost:3000'),
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

  // Authentication
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('30d'),

  // Database
  DATABASE_URL: z.string().optional(),

  // Security
  BCRYPT_ROUNDS: z.string().transform(Number).pipe(z.number().min(10)).default('10'),
  SESSION_SECRET: z.string().min(32, 'SESSION_SECRET must be at least 32 characters'),

  // Feature Flags
  ENABLE_REGISTRATION: z
    .string()
    .transform((val) => val === 'true')
    .default('true'),
  ENABLE_MOCK_DATA: z
    .string()
    .transform((val) => val === 'true')
    .default('true'),

  // Optional Services
  SENTRY_DSN: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().optional(),
});

// Type for our validated environment
export type Env = z.infer<typeof envSchema>;

// Validate and parse environment variables
const parseEnv = (): Env => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:');
      error.errors.forEach((err) => {
        console.error(`   ${err.path.join('.')}: ${err.message}`);
      });
      throw new Error('Invalid environment variables');
    }
    throw error;
  }
};

// Export validated environment variables
export const env = parseEnv();

// Helper to check if we're in production
export const isProduction = env.NODE_ENV === 'production';

// Helper to check if we're in development
export const isDevelopment = env.NODE_ENV === 'development';

// Helper to check if mock data is enabled
export const isMockDataEnabled = env.ENABLE_MOCK_DATA && !isProduction;
