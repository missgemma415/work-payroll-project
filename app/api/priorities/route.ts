

import { successResponse, errorResponse } from '@/lib/api-response';
import { generateMockPriorities, simulateDelay, simulateError, mockUser } from '@/lib/mock-data';
import type { CreatePriorityRequest } from '@/lib/types/api';
import type { DailyPriority } from '@/lib/types/database';

import { NextResponse, type NextRequest } from 'next/server';


// In-memory storage for development
export const priorities = generateMockPriorities();

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    await simulateDelay();
    simulateError();

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') ?? mockUser.id;
    const completed = searchParams.get('completed');

    let userPriorities = priorities.filter(p => p.user_id === userId);

    if (completed !== null) {
      userPriorities = userPriorities.filter(p => 
        p.completed === (completed === 'true')
      );
    }

    return successResponse(userPriorities);
  } catch (_error) {
    return errorResponse('FETCH_ERROR', 'Failed to fetch priorities', 500);
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    await simulateDelay();
    simulateError();

    const body = await request.json() as CreatePriorityRequest;
    const { text, urgency = 'medium', estimated_time, category, due_date } = body;

    // Validation
    if (!text || text.trim().length === 0) {
      return errorResponse('VALIDATION_ERROR', 'Priority text is required', 400);
    }

    const validUrgencies = ['low', 'medium', 'high'];
    if (!validUrgencies.includes(urgency)) {
      return errorResponse('VALIDATION_ERROR', 'Invalid urgency level', 400);
    }

    // Create new priority
    const newPriority: DailyPriority = {
      id: `priority-${Date.now()}`,
      user_id: mockUser.id,
      organization_id: mockUser.organization_id,
      text: text.trim(),
      completed: false,
      urgency,
      estimated_time: estimated_time ?? null,
      completed_at: null,
      due_date: due_date ?? null,
      category: category ?? null,
      metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    priorities.unshift(newPriority);

    return successResponse(newPriority);
  } catch (_error) {
    return errorResponse('CREATE_ERROR', 'Failed to create priority', 500);
  }
}