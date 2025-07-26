
import { NextResponse, type NextRequest } from 'next/server';

import { successResponse, errorResponse } from '@/lib/api-response';
import { generateMockMoodCheckIns, simulateDelay, simulateError, mockUser } from '@/lib/mock-data';
import type { CreateMoodRequest } from '@/lib/types/api';
import type { MoodCheckin } from '@/lib/types/database';


// In-memory storage for development
const moodCheckIns = generateMockMoodCheckIns(30);

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    await simulateDelay();
    simulateError();

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId') ?? mockUser.id;
    const limit = parseInt(searchParams.get('limit') ?? '30');

    const userMoods = moodCheckIns
      .filter(mood => mood.user_id === userId)
      .slice(0, limit);

    return successResponse(userMoods);
  } catch (_error) {
    return errorResponse('FETCH_ERROR', 'Failed to fetch mood check-ins', 500);
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    await simulateDelay();
    simulateError();

    const body = await request.json() as CreateMoodRequest;
    const { mood_value, mood_score, notes } = body;

    // Validation
    if (!mood_value || !mood_score) {
      return errorResponse('VALIDATION_ERROR', 'Mood value and score are required', 400);
    }

    const validMoods = ['amazing', 'great', 'good', 'okay', 'tough'];
    if (!validMoods.includes(mood_value)) {
      return errorResponse('VALIDATION_ERROR', 'Invalid mood value', 400);
    }

    if (mood_score < 1 || mood_score > 5) {
      return errorResponse('VALIDATION_ERROR', 'Mood score must be between 1 and 5', 400);
    }

    // Create new mood check-in
    const newMoodCheckIn: MoodCheckin = {
      id: `mood-${Date.now()}`,
      user_id: mockUser.id,
      organization_id: mockUser.organization_id,
      mood_value,
      mood_score,
      notes: notes ?? null,
      is_anonymous: false,
      metadata: {},
      created_at: new Date().toISOString()
    };

    // Add to the beginning of the array (most recent first)
    moodCheckIns.unshift(newMoodCheckIn);

    return successResponse(newMoodCheckIn);
  } catch (_error) {
    return errorResponse('CREATE_ERROR', 'Failed to create mood check-in', 500);
  }
}