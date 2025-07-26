

import { successResponse, errorResponse } from '@/lib/api-response';
import { generateMockKudos, simulateDelay, simulateError, mockUser } from '@/lib/mock-data';
import type { CreateKudosRequest } from '@/lib/types/api';
import type { Kudo } from '@/lib/types/database';

import { NextResponse, type NextRequest } from 'next/server';


// In-memory storage for development
export const kudosList = generateMockKudos();

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    await simulateDelay();
    simulateError();

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');
    const limit = parseInt(searchParams.get('limit') ?? '20');

    let filteredKudos = kudosList;

    if (userId) {
      filteredKudos = kudosList.filter(k => 
        k.from_user_id === userId || k.to_user_id === userId
      );
    }

    const paginatedKudos = filteredKudos.slice(0, limit);

    return successResponse(paginatedKudos);
  } catch (_error) {
    return errorResponse('FETCH_ERROR', 'Failed to fetch kudos', 500);
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    await simulateDelay();
    simulateError();

    const body = await request.json() as CreateKudosRequest;
    const { to_user_id, message, category } = body;

    // Validation
    if (!message || message.trim().length === 0) {
      return errorResponse('VALIDATION_ERROR', 'Message is required', 400);
    }

    const validCategories = ['teamwork', 'innovation', 'leadership', 'helpfulness', 'excellence'];
    if (!validCategories.includes(category)) {
      return errorResponse('VALIDATION_ERROR', 'Invalid category', 400);
    }

    // Create new kudos
    const newKudos: Kudo = {
      id: `kudos-${Date.now()}`,
      from_user_id: mockUser.id,
      to_user_id: to_user_id ?? null,
      organization_id: mockUser.organization_id,
      message: message.trim(),
      category,
      is_public: true,
      likes_count: 0,
      metadata: {},
      created_at: new Date().toISOString()
    };

    kudosList.unshift(newKudos);

    return successResponse(newKudos);
  } catch (_error) {
    return errorResponse('CREATE_ERROR', 'Failed to create kudos', 500);
  }
}