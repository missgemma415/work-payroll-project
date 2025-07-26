import { errorResponse, successResponse } from '@/lib/api-response';
import { simulateDelay, simulateError } from '@/lib/mock-data';
import type { UpdatePriorityRequest } from '@/lib/types/api';

// Import the priorities array from the parent route
// In a real app, this would be from a database
import { priorities } from '../route';

import type { NextResponse, NextRequest } from 'next/server';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    await simulateDelay();
    simulateError();

    const { id } = await context.params;
    const body = (await request.json()) as UpdatePriorityRequest;

    const priorityIndex = priorities.findIndex((p) => p.id === id);
    if (priorityIndex === -1) {
      return errorResponse('NOT_FOUND', 'Priority not found', 404);
    }

    const priority = priorities[priorityIndex]!;
    const updatedPriority = {
      ...priority,
      ...body,
      updated_at: new Date().toISOString(),
    };

    // Handle completion
    if (body.completed === true && !priority.completed) {
      updatedPriority.completed_at = new Date().toISOString();
    } else if (body.completed === false) {
      updatedPriority.completed_at = null;
    }

    priorities[priorityIndex] = updatedPriority;

    return successResponse(updatedPriority);
  } catch (_error) {
    return errorResponse('UPDATE_ERROR', 'Failed to update priority', 500);
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    await simulateDelay();
    simulateError();

    const { id } = await context.params;

    const priorityIndex = priorities.findIndex((p) => p.id === id);
    if (priorityIndex === -1) {
      return errorResponse('NOT_FOUND', 'Priority not found', 404);
    }

    priorities.splice(priorityIndex, 1);

    return successResponse({ message: 'Priority deleted successfully' });
  } catch (_error) {
    return errorResponse('DELETE_ERROR', 'Failed to delete priority', 500);
  }
}

// Export priorities for this route
export { priorities };
