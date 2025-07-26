import WelcomeSection from '@/components/dashboard/WelcomeSection';
import MoodCheckIn from '@/components/dashboard/MoodCheckIn';
import TeamPulse from '@/components/dashboard/TeamPulse';
import TodaysPriorities from '@/components/dashboard/TodaysPriorities';
import KudosWall from '@/components/dashboard/KudosWall';

export default function DashboardPage() {
  // Mock user for now
  const mockUser = {
    firstName: 'Demo',
    lastName: 'User',
    email: 'demo@scientiacapital.com'
  };

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <WelcomeSection user={mockUser} />
      
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