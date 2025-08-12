import { NextResponse } from 'next/server';
import { z } from 'zod';

import type { NextRequest } from 'next/server';

// Request/Response schemas with Zod validation
const chatRequestSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(5000, 'Message too long'),
  user_id: z.string().uuid('Invalid user ID format').optional(),
});

const chatResponseSchema = z.object({
  response: z.string(),
  message_id: z.string().uuid(),
  created_at: z.string(),
});

type ChatResponse = z.infer<typeof chatResponseSchema>;

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse and validate request body
    const body: unknown = await request.json();
    const { message } = chatRequestSchema.parse(body);

    // Simple placeholder response for CEO dashboard
    const placeholderResponse = `I understand you're asking about: "${message}". 

The CEO dashboard is currently being built to provide insights on:
- Project cost tracking by client identifier
- Employee performance metrics
- Payroll analysis and forecasting
- Integration with SpringAhead, Paychex, and QuickBooks

This feature will be available once we integrate your data sources.`;

    // Prepare response
    const response: ChatResponse = {
      response: placeholderResponse,
      message_id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };

    // Validate response
    const validatedResponse = chatResponseSchema.parse(response);

    return NextResponse.json(validatedResponse);
  } catch (error) {
    console.error('Chat API error:', error);

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        },
        { status: 400 }
      );
    }

    // Handle other errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      {
        error: 'Chat request failed',
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve conversation history (placeholder)
export function GET(): NextResponse {
  return NextResponse.json({
    message: 'CEO dashboard chat history will be implemented with full integration',
    conversations: [],
  });
}