import { z } from 'zod';
import { analyzeEmployeeCost } from '../../lib/gemini';

export interface Env {
  GOOGLE_GEMINI_API_KEY: string;
  GOOGLE_GEMINI_MODEL: string;
}

const ChatRequestSchema = z.object({
  query: z.string().min(1).max(1000),
  context: z.record(z.unknown()).optional(),
});

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validation = ChatRequestSchema.safeParse(body);

    if (!validation.success) {
      return new Response(
        JSON.stringify({
          error: 'Invalid request',
          details: validation.error.errors,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const { query, context } = validation.data;

    // Get user info from middleware
    const userId = request.headers.get('X-User-Id');
    const organizationId = request.headers.get('X-Organization-Id');

    // Add user context
    const enrichedContext = {
      ...context,
      userId,
      organizationId,
      timestamp: new Date().toISOString(),
    };

    // Generate AI response
    const response = await analyzeEmployeeCost(query, enrichedContext);

    return new Response(
      JSON.stringify({
        response,
        metadata: {
          model: env.GOOGLE_GEMINI_MODEL || 'gemini-2.0-flash-exp-01-18',
          timestamp: new Date().toISOString(),
        },
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Chat endpoint error:', error);

    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};
