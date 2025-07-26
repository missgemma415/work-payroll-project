import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import DashboardNav from '@/components/dashboard/DashboardNav';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-warmth-gradient">
      <DashboardNav />
      <main className="container mx-auto py-8 px-4">
        {children}
      </main>
    </div>
  );
}