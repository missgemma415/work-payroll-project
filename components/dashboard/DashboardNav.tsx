/**
 * Simple Dashboard Navigation for CEO Payroll Analysis MVP
 */

import Link from 'next/link';

import { Card } from '@/components/ui/card';

export default function DashboardNav(): React.JSX.Element {
  return (
    <Card className="p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">CEO Payroll Analysis</h2>
      <nav className="flex gap-4">
        <Link 
          href="/" 
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          Dashboard
        </Link>
        <Link 
          href="/analytics" 
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
        >
          Analytics
        </Link>
        <Link 
          href="/api/export/excel" 
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
        >
          Export Data
        </Link>
      </nav>
    </Card>
  );
}