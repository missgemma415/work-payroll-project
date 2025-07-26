'use client';

import KudosWall from '@/components/dashboard/KudosWall';
import MoodCheckIn from '@/components/dashboard/MoodCheckIn';
import TeamPulse from '@/components/dashboard/TeamPulse';
import TodaysPriorities from '@/components/dashboard/TodaysPriorities';
import WelcomeSection from '@/components/dashboard/WelcomeSection';
import { useUser } from '@/lib/context/app-context';
import { useAuthGuard } from '@/lib/hooks/use-auth-guard';

export default function DashboardPage(): React.JSX.Element {
  useAuthGuard(); // Protect this route
  const user = useUser();

  // Show loading state while auth is being verified
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Convert user to format expected by WelcomeSection
  const userForWelcome = {
    firstName: user.first_name ?? 'User',
    lastName: user.last_name ?? '',
    email: user.email,
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <WelcomeSection user={userForWelcome} />

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column */}
        <div className="space-y-6 lg:col-span-2">
          <TodaysPriorities />
          <TeamPulse />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          <MoodCheckIn />
          <KudosWall />
        </div>
      </div>
    </div>
  );
}
