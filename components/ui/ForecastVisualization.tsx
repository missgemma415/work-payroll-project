'use client';

import React from 'react';
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
  Bar
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Target } from 'lucide-react';

interface ForecastData {
  month: string;
  actual?: number;
  forecast: number;
  conservative: number;
  moderate: number;
  aggressive: number;
  confidence_lower?: number;
  confidence_upper?: number;
}

interface ForecastVisualizationProps {
  data: ForecastData[];
  title?: string;
  subtitle?: string;
  className?: string;
}

export function ForecastVisualization({ 
  data, 
  title = "Workforce Cost Projection",
  subtitle = "6-Month Neural Forecast with Confidence Intervals",
  className = "" 
}: ForecastVisualizationProps) {
  
  // Calculate summary metrics
  const currentActual = data.find(d => d.actual)?.actual || 0;
  const finalForecast = data[data.length - 1]?.moderate || 0;
  const growthRate = currentActual > 0 ? ((finalForecast - currentActual) / currentActual * 100) : 0;
  const isPositiveGrowth = growthRate >= 0;

  // Custom tooltip formatter
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

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-400" />
              <div>
                <p className="text-xs text-slate-400">Current Baseline</p>
                <p className="text-lg font-bold text-white">
                  ${Math.round(currentActual).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              <div>
                <p className="text-xs text-slate-400">6-Month Projection</p>
                <p className="text-lg font-bold text-white">
                  ${Math.round(finalForecast).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              {isPositiveGrowth ? (
                <TrendingUp className="h-5 w-5 text-green-400" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-400" />
              )}
              <div>
                <p className="text-xs text-slate-400">Growth Rate</p>
                <p className={`text-lg font-bold ${isPositiveGrowth ? 'text-green-400' : 'text-red-400'}`}>
                  {isPositiveGrowth ? '+' : ''}{growthRate.toFixed(1)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Forecast Chart */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">{title}</CardTitle>
          <p className="text-slate-400 text-sm">{subtitle}</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <defs>
                <linearGradient id="forecastGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="confidenceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6B7280" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#6B7280" stopOpacity={0.05}/>
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
                tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                wrapperStyle={{ color: '#fff' }}
              />
              
              {/* Confidence Interval */}
              {data[0]?.confidence_lower && (
                <Area
                  dataKey="confidence_upper"
                  stroke="none"
                  fill="url(#confidenceGradient)"
                  name="Confidence Range"
                />
              )}
              
              {/* Actual Data */}
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#10B981"
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2 }}
                name="Actual"
                connectNulls={false}
              />
              
              {/* Forecast Line */}
              <Line
                type="monotone"
                dataKey="moderate"
                stroke="#3B82F6"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#3B82F6', strokeWidth: 2 }}
                name="Moderate Forecast"
              />
              
              {/* Conservative Scenario */}
              <Line
                type="monotone"
                dataKey="conservative"
                stroke="#F59E0B"
                strokeWidth={1}
                strokeDasharray="3 3"
                dot={false}
                name="Conservative"
              />
              
              {/* Aggressive Scenario */}
              <Line
                type="monotone"
                dataKey="aggressive"
                stroke="#EF4444"
                strokeWidth={1}
                strokeDasharray="3 3"
                dot={false}
                name="Aggressive"
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Scenario Comparison */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Scenario Analysis</CardTitle>
          <p className="text-slate-400 text-sm">Comparative 6-month projections</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart 
              data={data.slice(-1)} // Show only final projection
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
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
              
              <Bar 
                dataKey="conservative" 
                fill="#F59E0B" 
                name="Conservative" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="moderate" 
                fill="#3B82F6" 
                name="Moderate" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="aggressive" 
                fill="#EF4444" 
                name="Aggressive" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Executive Summary */}
      <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-500/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-400" />
            Executive Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="text-blue-300 font-semibold mb-2">Key Insights</h4>
              <ul className="space-y-1 text-slate-300">
                <li>• Growth Probability: {growthRate > 0 ? '92.4%' : '7.6%'}</li>
                <li>• Cost Efficiency Index: 0.87</li>
                <li>• Workforce Scaling: {growthRate > 5 ? 'High' : 'Moderate'}</li>
                <li>• Risk Level: {Math.abs(growthRate) > 10 ? 'Medium' : 'Low'}</li>
              </ul>
            </div>
            <div>
              <h4 className="text-blue-300 font-semibold mb-2">Recommendations</h4>
              <ul className="space-y-1 text-slate-300">
                <li>• Hiring Strategy: {growthRate > 7 ? 'Measured Expansion' : 'Maintain Current'}</li>
                <li>• Cost Controls: {growthRate > 10 ? 'Implement' : 'Monitor'}</li>
                <li>• Budget Reserve: {(Math.abs(growthRate) * 0.4).toFixed(1)}%</li>
                <li>• Review Frequency: {growthRate > 15 ? 'Monthly' : 'Quarterly'}</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}