import { Inter, Poppins } from 'next/font/google';

import type { Metadata } from 'next';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: 'Scientia Capital - Your Work Home',
  description:
    "Where work feels like home. The HR platform that actually cares about your team's wellbeing and growth.",
  keywords: 'HR platform, employee wellness, team management, workplace culture',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.JSX.Element {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="bg-warmth-gradient min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
