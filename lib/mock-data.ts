import type {
  MoodCheckin,
  DailyPriority,
  Kudo,
  User,
  Organization,
  UserPreferences,
  OrganizationSettings,
  MoodCheckinMetadata,
  PriorityMetadata,
} from './types/database';

// Mock user data
export const mockUser: User = {
  id: 'user-1',
  email: 'john.doe@scientiacapital.com',
  first_name: 'John',
  last_name: 'Doe',
  avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
  organization_id: 'org-1',
  role: 'member',
  department: 'Engineering',
  position: 'Senior Developer',
  hire_date: '2022-01-15',
  status: 'active',
  timezone: 'America/New_York',
  preferences: {
    notifications: {
      email: true,
      push: true,
      inApp: true,
    },
    privacy: {
      anonymousMoodCheckins: false,
      showProfileToTeam: true,
    },
    display: {
      theme: 'light',
      compactMode: false,
    },
  } as UserPreferences,
  email_verified: true,
  last_login: '2024-01-15T08:30:00Z',
  created_at: '2022-01-15T10:00:00Z',
  updated_at: '2024-01-15T10:00:00Z',
};

export const mockOrganization: Organization = {
  id: 'org-1',
  name: 'Scientia Capital',
  slug: 'scientia-capital',
  subscription_tier: 'professional',
  settings: {
    features: {
      moodCheckins: true,
      kudos: true,
      priorities: true,
      teamPulse: true,
    },
    notifications: {
      dailyReminders: true,
      weeklyReports: true,
      kudosAlerts: true,
    },
  } as OrganizationSettings,
  created_at: '2022-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

// Generate mock mood check-ins
export function generateMockMoodCheckIns(count: number = 30): MoodCheckin[] {
  const moods: Array<{ value: MoodCheckin['mood_value']; score: number }> = [
    { value: 'amazing', score: 5 },
    { value: 'great', score: 4 },
    { value: 'good', score: 3 },
    { value: 'okay', score: 2 },
    { value: 'tough', score: 1 },
  ];

  const checkIns: MoodCheckin[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const mood = moods[Math.floor(Math.random() * moods.length)];

    checkIns.push({
      id: `mood-${i + 1}`,
      user_id: mockUser.id,
      organization_id: mockOrganization.id,
      mood_value: mood!.value,
      mood_score: mood!.score,
      notes: i % 3 === 0 ? 'Feeling productive today!' : null,
      is_anonymous: false,
      metadata: {} as MoodCheckinMetadata,
      created_at: date.toISOString(),
    });
  }

  return checkIns.reverse();
}

// Generate mock priorities
export function generateMockPriorities(): DailyPriority[] {
  const priorities = [
    {
      text: 'Review PR for authentication feature',
      urgency: 'high' as const,
      estimated_time: 45,
      category: 'Code Review',
      completed: false,
    },
    {
      text: 'Update project documentation',
      urgency: 'medium' as const,
      estimated_time: 30,
      category: 'Documentation',
      completed: true,
      completed_at: new Date().toISOString(),
    },
    {
      text: 'Team standup meeting',
      urgency: 'high' as const,
      estimated_time: 15,
      category: 'Meetings',
      completed: true,
      completed_at: new Date().toISOString(),
    },
    {
      text: 'Implement user feedback on dashboard',
      urgency: 'medium' as const,
      estimated_time: 120,
      category: 'Development',
      completed: false,
    },
    {
      text: 'Debug production issue #342',
      urgency: 'high' as const,
      estimated_time: 60,
      category: 'Bug Fix',
      completed: false,
    },
  ];

  return priorities.map((priority, index) => ({
    id: `priority-${index + 1}`,
    user_id: mockUser.id,
    organization_id: mockOrganization.id,
    text: priority.text,
    completed: priority.completed,
    urgency: priority.urgency,
    estimated_time: priority.estimated_time,
    completed_at: 'completed_at' in priority ? priority.completed_at : null,
    due_date: null,
    category: priority.category,
    metadata: {} as PriorityMetadata,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
}

// Generate mock kudos
export function generateMockKudos(): Kudo[] {
  const teamMembers = [
    {
      id: 'user-2',
      name: 'Sarah Chen',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    },
    {
      id: 'user-3',
      name: 'Mike Johnson',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    },
    {
      id: 'user-4',
      name: 'Emily Davis',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    },
    {
      id: 'user-5',
      name: 'Alex Kim',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    },
  ];

  const kudosMessages = [
    {
      message:
        'Amazing work on the new feature launch! Your attention to detail made all the difference.',
      category: 'excellence' as const,
    },
    {
      message: 'Thanks for staying late to help debug that critical issue. True team player!',
      category: 'teamwork' as const,
    },
    {
      message: 'Your presentation today was inspiring. Great job communicating our vision!',
      category: 'leadership' as const,
    },
    {
      message: 'Innovative solution to the performance problem. Thinking outside the box!',
      category: 'innovation' as const,
    },
    {
      message: 'Always willing to help others. Your patience and guidance are invaluable.',
      category: 'helpfulness' as const,
    },
  ];

  const kudos: Kudo[] = [];
  const now = new Date();

  kudosMessages.forEach((kudosData, index) => {
    const fromMember = teamMembers[index % teamMembers.length];
    const toMember = teamMembers[(index + 1) % teamMembers.length];
    const date = new Date(now);
    date.setHours(date.getHours() - index * 3);

    kudos.push({
      id: `kudos-${index + 1}`,
      from_user_id: fromMember!.id,
      to_user_id: index % 2 === 0 ? mockUser.id : toMember!.id,
      organization_id: mockOrganization.id,
      message: kudosData.message,
      category: kudosData.category,
      is_public: true,
      likes_count: Math.floor(Math.random() * 15) + 1,
      metadata: {},
      created_at: date.toISOString(),
    });
  });

  return kudos;
}

// Generate team pulse data
interface TeamPulseData {
  date: string;
  averageMood: number;
  activeUsers: number;
  completedTasks: number;
  kudosGiven: number;
}

export function generateTeamPulseData(): TeamPulseData[] {
  const days = 7;
  const data = [];
  const now = new Date();

  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);

    data.push({
      date: date.toISOString().split('T')[0]!,
      averageMood: 3.5 + Math.random() * 1.5,
      activeUsers: Math.floor(Math.random() * 10) + 15,
      completedTasks: Math.floor(Math.random() * 30) + 20,
      kudosGiven: Math.floor(Math.random() * 15) + 5,
    });
  }

  return data.reverse();
}

// Simulate API delay
export function simulateDelay(ms: number = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Simulate random errors (10% chance)
export function simulateError(): void {
  if (Math.random() < 0.1) {
    throw new Error('Simulated API error for testing');
  }
}
