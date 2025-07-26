import { errorResponse, successResponse } from '@/lib/api-response';
import { mockUser, simulateDelay, simulateError } from '@/lib/mock-data';
import { kudosList } from '@/lib/mock-data/kudos';

import type { NextRequest, NextResponse } from 'next/server';

// Track likes per user
const userLikes = new Map<string, Set<string>>();

export async function POST(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> {
  try {
    await simulateDelay();
    simulateError();

    const { id } = await context.params;
    const userId = mockUser.id;

    const kudosIndex = kudosList.findIndex((k) => k.id === id);
    if (kudosIndex === -1) {
      return errorResponse('NOT_FOUND', 'Kudos not found', 404);
    }

    // Initialize user likes set if not exists
    if (!userLikes.has(userId)) {
      userLikes.set(userId, new Set());
    }

    const userLikeSet = userLikes.get(userId)!;
    const kudos = kudosList[kudosIndex]!;

    if (userLikeSet.has(id)) {
      // Unlike
      userLikeSet.delete(id);
      kudos.likes_count = Math.max(0, kudos.likes_count - 1);
    } else {
      // Like
      userLikeSet.add(id);
      kudos.likes_count += 1;
    }

    return successResponse({
      kudos_id: id,
      liked: userLikeSet.has(id),
      likes_count: kudos.likes_count,
    });
  } catch (_error) {
    return errorResponse('LIKE_ERROR', 'Failed to update kudos like', 500);
  }
}
