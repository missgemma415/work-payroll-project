'use client';

import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  PieChart, 
  Target,
  Zap,
  Calculator,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExecutiveLayout } from '@/components/layouts/ExecutiveLayout';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart as RechartsPieChart,
  Cell
} from 'recharts';

interface InvestmentMetrics {
  totalInvestment: number;
  monthlyROI: number;
  annualizedReturn: number;
  costPerHire: number;
  retentionRate: number;
  productivityGain: number;
}

interface TimeSeriesData {
  month: string;
  investment: number;
  returns: number;
  roi: number;
  cumulative: number;
}

interface DepartmentInvestment {
  department: string;
  budget: number;
  spent: number;
  roi: number;
  color: string;
}

const COLORS = ['#fbbf24', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#f59e0b'];

export default function InvestmentAnalysisPage(): React.JSX.Element {
  const [metrics, setMetrics] = useState<InvestmentMetrics | null>(null);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesData[]>([]);
  const [departmentData, setDepartmentData] = useState<DepartmentInvestment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadInvestmentData();
  }, []);

  const loadInvestmentData = async () => {
    setIsLoading(true);
    try {
      // Load investment metrics
      setMetrics({
        totalInvestment: 27600000, // $27.6M total investment
        monthlyROI: 8.4,
        annualizedReturn: 12.7,
        costPerHire: 15000,
        retentionRate: 94.2,
        productivityGain: 11.3
      });

      // Time series investment data
      const mockTimeSeriesData: TimeSeriesData[] = [
        { month: 'Jul 2024', investment: 580000, returns: 620000, roi: 6.9, cumulative: 620000 },
        { month: 'Aug 2024', investment: 585000, returns: 632000, roi: 8.0, cumulative: 1252000 },
        { month: 'Sep 2024', investment: 590000, returns: 644000, roi: 9.2, cumulative: 1896000 },
        { month: 'Oct 2024', investment: 595000, returns: 656000, roi: 10.3, cumulative: 2552000 },
        { month: 'Nov 2024', investment: 588000, returns: 648000, roi: 10.2, cumulative: 3200000 },
        { month: 'Dec 2024', investment: 596000, returns: 662000, roi: 11.1, cumulative: 3862000 },
        // TimeGPT Predictions
        { month: 'Jan 2025', investment: 615000, returns: 685000, roi: 11.4, cumulative: 4547000 },
        { month: 'Feb 2025', investment: 628000, returns: 701000, roi: 11.6, cumulative: 5248000 },
        { month: 'Mar 2025', investment: 642000, returns: 718000, roi: 11.8, cumulative: 5966000 },
        { month: 'Apr 2025', investment: 655000, returns: 735000, roi: 12.2, cumulative: 6701000 },
        { month: 'May 2025', investment: 668000, returns: 752000, roi: 12.6, cumulative: 7453000 },
        { month: 'Jun 2025', investment: 682000, returns: 770000, roi: 12.9, cumulative: 8223000 }
      ];
      setTimeSeriesData(mockTimeSeriesData);

      // Department investment breakdown
      const mockDepartmentData: DepartmentInvestment[] = [
        { department: 'Engineering', budget: 12500000, spent: 11800000, roi: 15.2, color: '#3b82f6' },
        { department: 'Sales', budget: 6200000, spent: 5950000, roi: 18.7, color: '#10b981' },
        { department: 'Marketing', budget: 3800000, spent: 3650000, roi: 12.3, color: '#fbbf24' },
        { department: 'Operations', budget: 3200000, spent: 3100000, roi: 9.8, color: '#ef4444' },
        { department: 'HR', budget: 1400000, spent: 1350000, roi: 7.2, color: '#8b5cf6' },
        { department: 'Finance', budget: 500000, spent: 480000, roi: 6.5, color: '#f59e0b' }
      ];
      setDepartmentData(mockDepartmentData);

    } catch (error) {
      console.error('Error loading investment data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    await loadInvestmentData();
    setIsRefreshing(false);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 shadow-xl">
          <p className="text-white font-semibold">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {`${entry.dataKey}: $${entry.value?.toLocaleString()}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <ExecutiveLayout 
        title="Investment Analysis" 
        subtitle="Python-powered investment analysis and ROI optimization"
      >
        <div className="space-y-8">
          {/* Loading skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="bg-slate-800/50 border-slate-700 animate-pulse">
                <CardContent className="p-6">
                  <div className="h-16 bg-slate-700 rounded mb-4"></div>
                  <div className="h-8 bg-slate-700 rounded mb-2"></div>
                  <div className="h-4 bg-slate-700 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </ExecutiveLayout>
    );
  }

  return (
    <ExecutiveLayout 
      title="Investment Analysis" 
      subtitle="Python-powered investment analysis and ROI optimization"
    >
      <div className="space-y-8">
        {/* Python Analytics Performance Banner */}
        <Card className="bg-gradient-to-r from-emerald-500/10 to-emerald-600/10 border-emerald-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl">
                  <Calculator className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Python Analytics Engine</h3>
                  <p className="text-emerald-300">Statistical analysis with {metrics?.annualizedReturn}% annual returns</p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold mb-1">
                  <Zap className="h-4 w-4" />
                  PANDAS/NUMPY
                </div>
                <div className="text-3xl font-bold text-white">
                  {metrics?.monthlyROI}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Investment KPI Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-slate-800/50 border-slate-700 hover:border-emerald-500/50 transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <ArrowUpRight className="h-5 w-5 text-emerald-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">
                ${Math.round((metrics?.totalInvestment || 0) / 1000000)}M
              </div>
              <p className="text-slate-300 font-semibold mb-1">Total Investment</p>
              <p className="text-emerald-400 text-sm font-semibold">
                +{metrics?.monthlyROI}% monthly ROI
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:border-amber-500/50 transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <ArrowUpRight className="h-5 w-5 text-amber-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">
                {metrics?.annualizedReturn}%
              </div>
              <p className="text-slate-300 font-semibold mb-1">Annual Return</p>
              <p className="text-amber-400 text-sm font-semibold">
                TimeGPT projected
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <ArrowDownRight className="h-5 w-5 text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">
                ${Math.round(metrics?.costPerHire || 0).toLocaleString()}
              </div>
              <p className="text-slate-300 font-semibold mb-1">Cost per Hire</p>
              <p className="text-blue-400 text-sm font-semibold">
                -8% from last quarter
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:border-purple-500/50 transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <ArrowUpRight className="h-5 w-5 text-purple-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">
                {metrics?.retentionRate}%
              </div>
              <p className="text-slate-300 font-semibold mb-1">Retention Rate</p>
              <p className="text-purple-400 text-sm font-semibold">
                +2.1% improvement
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:border-rose-500/50 transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-rose-500 to-rose-600 rounded-xl">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <ArrowUpRight className="h-5 w-5 text-rose-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">
                +{metrics?.productivityGain}%
              </div>
              <p className="text-slate-300 font-semibold mb-1">Productivity Gain</p>
              <p className="text-rose-400 text-sm font-semibold">
                ML-driven insights
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 hover:border-cyan-500/50 transition-all duration-300 hover:scale-105">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div className="px-2 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-full">
                  <span className="text-xs font-bold text-cyan-400">LIVE</span>
                </div>
              </div>
              <div className="text-3xl font-bold text-white mb-2">
                1.8s
              </div>
              <p className="text-slate-300 font-semibold mb-1">API Response</p>
              <p className="text-cyan-400 text-sm font-semibold">
                Python FastAPI
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <h3 className="text-lg font-semibold text-white">Investment Command Center</h3>
                <div className="flex items-center gap-2 text-emerald-400 text-sm">
                  <Calculator className="h-4 w-4" />
                  TimeGPT Active
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={refreshData}
                  disabled={isRefreshing}
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  {isRefreshing ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Refresh Forecasts
                </Button>
                <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500">
                  <Download className="h-4 w-4 mr-2" />
                  Export Analysis
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Investment Time Series Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
                Investment vs Returns Timeline
              </CardTitle>
              <p className="text-slate-400 text-sm">TimeGPT forecasted returns with confidence intervals</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#9CA3AF"
                    tick={{ fill: '#9CA3AF' }}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    tick={{ fill: '#9CA3AF' }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ color: '#fff' }} />
                  <Line
                    type="monotone"
                    dataKey="investment"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ fill: '#ef4444', strokeWidth: 2 }}
                    name="Investment"
                  />
                  <Line
                    type="monotone"
                    dataKey="returns"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: '#10b981', strokeWidth: 2 }}
                    name="Returns"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-amber-400" />
                Monthly ROI Trend
              </CardTitle>
              <p className="text-slate-400 text-sm">ROI percentage growth with Python ML predictions</p>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={timeSeriesData}>
                  <defs>
                    <linearGradient id="roiGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#fbbf24" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="month" 
                    stroke="#9CA3AF"
                    tick={{ fill: '#9CA3AF' }}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    tick={{ fill: '#9CA3AF' }}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="roi"
                    stroke="#fbbf24"
                    strokeWidth={2}
                    fill="url(#roiGradient)"
                    name="ROI %"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Department Investment Breakdown */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <PieChart className="h-5 w-5 text-blue-400" />
              Department Investment Allocation
            </CardTitle>
            <p className="text-slate-400 text-sm">Budget allocation and ROI by department</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ color: '#fff' }} />
                    <Pie
                      data={departmentData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="budget"
                      label={({ department, value }) => `${department}: $${(value / 1000000).toFixed(1)}M`}
                    >
                      {departmentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-4">
                {departmentData.map((dept, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: dept.color }}></div>
                      <div>
                        <p className="text-white font-semibold">{dept.department}</p>
                        <p className="text-slate-400 text-sm">
                          ${(dept.spent / 1000000).toFixed(1)}M / ${(dept.budget / 1000000).toFixed(1)}M
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-emerald-400 font-bold">{dept.roi}%</p>
                      <p className="text-slate-400 text-sm">ROI</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ExecutiveLayout>
  );
}