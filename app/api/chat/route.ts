import { NextResponse } from 'next/server';
import { z } from 'zod';
import { claudeClient } from '@/lib/ai/claude-client';

import type { NextRequest } from 'next/server';

// Request/Response schemas with Zod validation
const chatRequestSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(5000, 'Message too long'),
  user_id: z.string().uuid('Invalid user ID format').optional(),
  conversation_history: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string()
  })).optional(),
});

const chatResponseSchema = z.object({
  response: z.string(),
  message_id: z.string().uuid(),
  created_at: z.string(),
  usage: z.object({
    input_tokens: z.number(),
    output_tokens: z.number(),
  }).optional(),
});


export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse and validate request body
    const body: unknown = await request.json();
    const { message, conversation_history = [] } = chatRequestSchema.parse(body);

    // Check if API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        {
          error: 'Claude API key not configured',
          message: 'ANTHROPIC_API_KEY environment variable is required',
        },
        { status: 500 }
      );
    }

    // Use Claude client to generate response
    const claudeResponse = await claudeClient.chat(message, conversation_history);

    // Validate response
    const validatedResponse = chatResponseSchema.parse(claudeResponse);

    return NextResponse.json(validatedResponse);
  } catch (error) {
    console.error('Chat API error:', error);

    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: error.issues.map((err) => ({
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