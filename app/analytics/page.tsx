'use client';

import { Brain, DollarSign, TrendingUp, Users } from 'lucide-react';
import React from 'react';

import AIChatInterface from '@/components/dashboard/ai/AIChatInterface';
import DashboardNav from '@/components/dashboard/DashboardNav';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Mock data for demonstration
const mockStats = {
  totalEmployees: 127,
  totalMonthlyCost: 1875000,
  avgCostPerEmployee: 14764,
  costTrend: '+3.2%',
};

export default function AnalyticsPage(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sage-50 via-white to-warmth-50">
      <DashboardNav />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">Employee Cost Analytics</h1>
          <p className="text-gray-600">
            AI-powered insights for workforce optimization and cost management
          </p>
        </div>

        {/* Stats Overview */}
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.totalEmployees}</div>
              <p className="text-xs text-muted-foreground">Across all departments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Cost</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(mockStats.totalMonthlyCost / 1000).toFixed(1)}M
              </div>
              <p className="text-xs text-muted-foreground">Total employee expenses</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Cost/Employee</CardTitle>
              <Brain className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${mockStats.avgCostPerEmployee.toLocaleString()}
              </div>
              <p className="text-xs text-muted-foreground">Including benefits & overhead</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cost Trend</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{mockStats.costTrend}</div>
              <p className="text-xs text-muted-foreground">vs. last month</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="grid gap-8 md:grid-cols-2">
          {/* AI Chat Interface */}
          <div>
            <AIChatInterface />
          </div>

          {/* Coming Soon: Forecast Chart */}
          <Card className="h-[600px]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Cost Forecast
              </CardTitle>
            </CardHeader>
            <CardContent className="flex h-full items-center justify-center">
              <div className="text-center text-muted-foreground">
                <TrendingUp className="mx-auto mb-4 h-12 w-12 opacity-20" />
                <p className="mb-2 text-lg font-medium">Coming Soon</p>
                <p className="text-sm">Advanced forecasting with Prophet and Neural Prophet</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feature Preview */}
        <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-6">
          <h3 className="mb-2 text-lg font-semibold text-blue-900">
            🚀 Coming Soon: Advanced Features
          </h3>
          <ul className="space-y-2 text-blue-800">
            <li>• Prophet-powered cost forecasting with seasonal analysis</li>
            <li>• Scenario planning: What-if analysis for hiring/termination</li>
            <li>• Department-wise cost optimization recommendations</li>
            <li>• Executive reports with AI-generated insights</li>
            <li>• Integration with StatsForecast for high-performance analytics</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
