import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: '--font-inter',
});

const poppins = Poppins({ 
  weight: ['300', '400', '500', '600', '700'],
  subsets: ["latin"],
  variable: '--font-poppins',
});

export const metadata: Metadata = {
  title: "Scientia Capital - Your Work Home",
  description: "Where work feels like home. The HR platform that actually cares about your team's wellbeing and growth.",
  keywords: "HR platform, employee wellness, team management, workplace culture",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: [dark],
        variables: {
          colorPrimary: '#d17344',
          colorBackground: '#fef6f0',
          colorInputBackground: '#ffffff',
          colorInputText: '#2d1810',
          borderRadius: '1rem',
        },
        elements: {
          formButtonPrimary: 'bg-gradient-to-r from-warmth-400 to-community-400 hover:shadow-lg transition-all duration-300',
          card: 'shadow-warm-lg backdrop-blur border-warmth-200',
        }
      }}
    >
      <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
        <body className="font-sans antialiased bg-warmth-gradient min-h-screen">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}