import { NextResponse } from 'next/server';

/**
 * Health check endpoint that also verifies environment variables
 */
export function GET(): NextResponse {
  try {
    // Check all required environment variables
    const envCheck = {
      DATABASE_URL: !!process.env['DATABASE_URL'],
      NEON_DATABASE_URL: !!process.env['NEON_DATABASE_URL'],
      JWT_SECRET: !!process.env['JWT_SECRET'],
      BCRYPT_ROUNDS: !!process.env['BCRYPT_ROUNDS'],
      GOOGLE_GEMINI_API_KEY: !!process.env['GOOGLE_GEMINI_API_KEY'],
      ELEVENLABS_API_KEY: !!process.env['ELEVENLABS_API_KEY'],
      NODE_ENV: process.env['NODE_ENV'],
    };

    // Additional checks
    const jwtSecretLength = process.env['JWT_SECRET']?.length ?? 0;
    const bcryptRounds = process.env['BCRYPT_ROUNDS'] ? parseInt(process.env['BCRYPT_ROUNDS']) : 0;

    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      environmentVariables: {
        ...envCheck,
        jwtSecretLength,
        bcryptRounds,
        hasValidJwtSecret: jwtSecretLength >= 32,
        hasValidBcryptRounds: bcryptRounds >= 8 && bcryptRounds <= 15,
      },
      databaseConfig: {
        hasNeonUrl: !!process.env['NEON_DATABASE_URL'],
        hasDatabaseUrl: !!process.env['DATABASE_URL'],
        urlsMatch: process.env['DATABASE_URL'] === process.env['NEON_DATABASE_URL'],
      },
    };

    return NextResponse.json(healthStatus);
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
