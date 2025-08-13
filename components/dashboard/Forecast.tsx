/**
 * Simple Forecast Component for CEO Payroll Analysis MVP
 */

'use client';

import { useEffect, useState } from 'react';

import { Card } from '@/components/ui/card';

interface ForecastData {
  total_employees: number;
  total_cost: number;
  average_cost: number;
  total_hours: number;
}

export default function Forecast(): React.JSX.Element {
  const [data, setData] = useState<ForecastData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchData(): Promise<void> {
      try {
        const response = await fetch('/api/employee-costs');
        const result = await response.json();
        
        if (result.success && result.summary) {
          setData({
            total_employees: result.summary.total_employees || 0,
            total_cost: result.summary.total_cost || 0,
            average_cost: result.summary.average_cost || 0,
            total_hours: result.summary.total_hours || 0
          });
        }
      } catch (error) {
        console.error('Error fetching forecast data:', error);
      } finally {
        setIsLoading(false);
      }
    }
    
    void fetchData();
  }, []);

  if (isLoading) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Cost Forecast</h3>
        <div className="text-gray-500">Loading...</div>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Cost Forecast</h3>
        <div className="text-gray-500">No data available</div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Cost Forecast</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{data.total_employees}</div>
          <div className="text-sm text-gray-600">Total Employees</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            ${data.total_cost.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Total Monthly Cost</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            ${data.average_cost.toLocaleString()}
          </div>
          <div className="text-sm text-gray-600">Average Employee Cost</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{data.total_hours}</div>
          <div className="text-sm text-gray-600">Total Hours</div>
        </div>
      </div>
    </Card>
  );
}