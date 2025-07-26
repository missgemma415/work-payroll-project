import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
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
  title: "Scientia Capital - HR Software That Actually Cares",
  description: "Build a workplace where everyone thrives. The only HRMS that combines powerful features with genuine warmth and AI-powered insights.",
  keywords: "HR software, HRMS, payroll, employee wellness, performance reviews, team management",
  authors: [{ name: "Scientia Capital" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://scientiacapital.com",
    siteName: "Scientia Capital",
    title: "Scientia Capital - HR Software That Actually Cares",
    description: "Build a workplace where everyone thrives",
    images: [
      {
        url: "https://scientiacapital.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "Scientia Capital - Where work feels like home",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Scientia Capital - HR Software That Actually Cares",
    description: "Build a workplace where everyone thrives",
    images: ["https://scientiacapital.com/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable}`}>
      <body className="font-sans antialiased bg-warmth-gradient min-h-screen">
        {children}
      </body>
    </html>
  );
}