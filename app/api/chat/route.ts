import { NextResponse } from 'next/server';
import { z } from 'zod';

import { GeminiClient } from '@/lib/ai/clients';
import { query, queryOne } from '@/lib/database/connection';

import type { NextRequest } from 'next/server';

// Request/Response schemas with Zod validation
const chatRequestSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(5000, 'Message too long'),
  user_id: z.string().uuid('Invalid user ID format'),
  conversation_id: z.string().uuid('Invalid conversation ID format').optional(),
  context: z.record(z.unknown()).optional(),
});

const chatResponseSchema = z.object({
  response: z.string(),
  conversation_id: z.string().uuid(),
  message_id: z.string().uuid(),
  created_at: z.string(),
});

// type ChatRequest = z.infer<typeof chatRequestSchema>;
type ChatResponse = z.infer<typeof chatResponseSchema>;

// Database interfaces
interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface Message {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse and validate request body
    const body: unknown = await request.json();
    const { message, user_id, conversation_id, context } = chatRequestSchema.parse(body);

    // Initialize Gemini client
    const geminiClient = new GeminiClient();

    // Handle conversation management
    let finalConversationId = conversation_id;

    if (!finalConversationId) {
      // Create new conversation
      const newConversation = await createConversation(user_id, message);
      finalConversationId = newConversation.id;
    }

    // Get conversation history for context
    const conversationHistory = await getConversationHistory(finalConversationId);

    // Build context for Gemini
    const geminiContext = {
      conversation_history: conversationHistory,
      ...context,
    };

    // Enhance prompt with financial analysis context
    const enhancedPrompt = `
You are an AI financial analyst specializing in employee cost management and workforce planning for the Prophet Growth Analysis platform.

User Question: ${message}

Please provide a clear, concise, and actionable response. Focus on:
- Direct answer to the question
- Relevant financial insights
- Practical recommendations
- Potential risks or considerations

Keep the response professional but conversational, suitable for executives.
    `;

    // Get response from Gemini
    const geminiResponse = await geminiClient.askQuestion(enhancedPrompt, geminiContext);

    // Save user message to database
    const userMessageId = crypto.randomUUID();
    await saveMessage({
      id: userMessageId,
      conversation_id: finalConversationId,
      role: 'user',
      content: message,
      metadata: context ?? {},
    });

    // Save assistant response to database
    const assistantMessageId = crypto.randomUUID();
    await saveMessage({
      id: assistantMessageId,
      conversation_id: finalConversationId,
      role: 'assistant',
      content: geminiResponse,
      metadata: { model: 'gemini-1.5-flash-latest' },
    });

    // Update conversation timestamp
    await updateConversationTimestamp(finalConversationId);

    // Prepare response
    const response: ChatResponse = {
      response: geminiResponse,
      conversation_id: finalConversationId,
      message_id: assistantMessageId,
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

// Database helper functions
async function createConversation(userId: string, firstMessage: string): Promise<Conversation> {
  const conversationId = crypto.randomUUID();

  // Generate a title from the first message (truncate if too long)
  const title = firstMessage.length > 100 ? firstMessage.substring(0, 97) + '...' : firstMessage;

  const conversation = await queryOne<Conversation>(
    `INSERT INTO conversations (id, user_id, title, created_at, updated_at)
     VALUES ($1, $2, $3, NOW(), NOW())
     RETURNING *`,
    [conversationId, userId, title]
  );

  if (!conversation) {
    throw new Error('Failed to create conversation');
  }

  return conversation;
}

async function getConversationHistory(conversationId: string): Promise<Message[]> {
  return query<Message>(
    `SELECT * FROM messages 
     WHERE conversation_id = $1 
     ORDER BY created_at ASC 
     LIMIT 20`,
    [conversationId]
  );
}

async function saveMessage(message: Omit<Message, 'created_at'>): Promise<void> {
  await query(
    `INSERT INTO messages (id, conversation_id, role, content, metadata, created_at)
     VALUES ($1, $2, $3, $4, $5, NOW())`,
    [
      message.id,
      message.conversation_id,
      message.role,
      message.content,
      JSON.stringify(message.metadata),
    ]
  );
}

async function updateConversationTimestamp(conversationId: string): Promise<void> {
  await query(`UPDATE conversations SET updated_at = NOW() WHERE id = $1`, [conversationId]);
}

// GET endpoint to retrieve conversation history
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversation_id');
    const userId = searchParams.get('user_id');

    if (!conversationId || !userId) {
      return NextResponse.json(
        { error: 'conversation_id and user_id are required' },
        { status: 400 }
      );
    }

    // Validate UUIDs
    const conversationIdSchema = z.string().uuid();
    const userIdSchema = z.string().uuid();

    conversationIdSchema.parse(conversationId);
    userIdSchema.parse(userId);

    // Get conversation and verify ownership
    const conversation = await queryOne<Conversation>(
      `SELECT * FROM conversations WHERE id = $1 AND user_id = $2`,
      [conversationId, userId]
    );

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    // Get conversation history
    const messages = await getConversationHistory(conversationId);

    return NextResponse.json({
      conversation,
      messages,
    });
  } catch (error) {
    console.error('Get conversation error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid UUID format' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Failed to retrieve conversation' }, { status: 500 });
  }
}
