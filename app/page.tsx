'use client';

import { redirect } from 'next/navigation';

export default function HomePage(): never {
  // Redirect to analytics page which has our AI Financial Analyst
  redirect('/analytics');
}
