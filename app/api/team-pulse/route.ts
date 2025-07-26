import { successResponse, errorResponse } from '@/lib/api-response';
import { generateTeamPulseData, simulateDelay, simulateError } from '@/lib/mock-data';

import type { NextResponse, NextRequest } from 'next/server';

export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    await simulateDelay();
    simulateError();

    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') ?? 'week'; // week, month, quarter

    // TODO: Use days parameter to generate appropriate data
    // let days = 7;
    // if (period === 'month') days = 30;
    // if (period === 'quarter') days = 90;

    const pulseData = generateTeamPulseData();

    // Calculate summary stats
    const summary = {
      averageMood: pulseData.reduce((sum, d) => sum + d.averageMood, 0) / pulseData.length,
      totalActiveUsers: pulseData.reduce((sum, d) => sum + d.activeUsers, 0),
      totalCompletedTasks: pulseData.reduce((sum, d) => sum + d.completedTasks, 0),
      totalKudosGiven: pulseData.reduce((sum, d) => sum + d.kudosGiven, 0),
      engagementScore: Math.round(
        (pulseData.reduce((sum, d) => sum + d.activeUsers, 0) / (pulseData.length * 25)) * 100
      ),
    };

    return successResponse({
      period,
      summary,
      dailyData: pulseData,
      trends: {
        mood: calculateTrend(pulseData.map((d) => d.averageMood)),
        engagement: calculateTrend(pulseData.map((d) => d.activeUsers)),
        productivity: calculateTrend(pulseData.map((d) => d.completedTasks)),
      },
    });
  } catch (_error) {
    return errorResponse('FETCH_ERROR', 'Failed to fetch team pulse data', 500);
  }
}

function calculateTrend(values: number[]): {
  direction: 'up' | 'down' | 'stable';
  percentage: number;
} {
  if (values.length < 2) return { direction: 'stable', percentage: 0 };

  const recentAvg = values.slice(-3).reduce((a, b) => a + b, 0) / 3;
  const previousAvg = values.slice(0, 3).reduce((a, b) => a + b, 0) / 3;

  const change = ((recentAvg - previousAvg) / previousAvg) * 100;

  return {
    direction: change > 5 ? 'up' : change < -5 ? 'down' : 'stable',
    percentage: Math.abs(Math.round(change)),
  };
}
