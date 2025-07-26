import { auth, currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import WelcomeSection from '@/components/dashboard/WelcomeSection';
import MoodCheckIn from '@/components/dashboard/MoodCheckIn';
import TeamPulse from '@/components/dashboard/TeamPulse';
import TodaysPriorities from '@/components/dashboard/TodaysPriorities';
import KudosWall from '@/components/dashboard/KudosWall';

export default async function DashboardPage() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <WelcomeSection user={user} />
      
      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
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