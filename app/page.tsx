'use client';

import { Upload, FileText, DollarSign, Users, TrendingUp, Download, RefreshCw } from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FloatingChatButton } from '@/components/ui/FloatingChatButton';
import { EnhancedChatInterface, ChatContext } from '@/components/ui/EnhancedChatInterface';

interface FileInfo {
  filename: string;
  type: string;
  size: number;
  lastModified: string;
  processed: boolean;
}

interface EmployeeCost {
  employee_name: string;
  total_hours: number;
  gross_pay: number;
  total_true_cost: number;
  burden_rate: number;
  period_start: string;
  period_end: string;
}

interface ProcessingSummary {
  total_files: number;
  completed_files: number;
  failed_files: number;
  total_records: number;
}

export default function HomePage(): React.JSX.Element {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [employeeCosts, setEmployeeCosts] = useState<EmployeeCost[]>([]);
  const [summary, setSummary] = useState<ProcessingSummary | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showEnhancedChat, setShowEnhancedChat] = useState(false);
  const [chatContext, setChatContext] = useState<ChatContext>({});

  useEffect(() => {
    void loadData();
  }, []);

  const loadData = async (): Promise<void> => {
    setIsLoading(true);
    try {
      // Load file list
      const filesResponse = await fetch('/api/scan-files');
      if (filesResponse.ok) {
        const filesData = await filesResponse.json() as { files?: FileInfo[] };
        setFiles(filesData.files ?? []);
      }

      // Load processing status
      const statusResponse = await fetch('/api/process-files');
      if (statusResponse.ok) {
        const statusData = await statusResponse.json() as { summary?: ProcessingSummary };
        setSummary(statusData.summary ?? null);
      }

      // Load employee costs
      const costsResponse = await fetch('/api/employee-costs');
      if (costsResponse.ok) {
        const costsData = await costsResponse.json() as { employee_costs?: EmployeeCost[] };
        setEmployeeCosts(costsData.employee_costs ?? []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const processFiles = async (): Promise<void> => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/process-files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force: false })
      });

      if (response.ok) {
        const result = await response.json() as { success: boolean };
        console.warn('Processing result:', result);
        await loadData(); // Reload data after processing
      }
    } catch (error) {
      console.error('Error processing files:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  // Calculate proper metrics - fix the monthly vs all-time confusion
  const totalAllTimeCost = employeeCosts.reduce((sum, emp) => sum + Number(emp.total_true_cost), 0);
  const averageBurdenRate = employeeCosts.length > 0 
    ? employeeCosts.reduce((sum, emp) => sum + Number(emp.burden_rate), 0) / employeeCosts.length 
    : 0;

  // Calculate last month's costs (this is what executives actually want to see)
  const [monthlyMetrics, setMonthlyMetrics] = useState({
    lastMonth: 0,
    thisMonth: 0,
    growthRate: 0
  });

  const handleMetricClick = (metric: 'workforce' | 'investment' | 'burden' | 'data-sources') => {
    setChatContext({
      activeMetric: metric,
      currentView: 'dashboard'
    });
    setShowEnhancedChat(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 md:px-8 py-6 md:py-12">
        {/* Executive Header */}
        <div className="mb-8 md:mb-16">
          <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-3 h-12 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full"></div>
                <div>
                  <h1 className="text-[clamp(2rem,8vw,4rem)] font-display font-bold text-white tracking-tight leading-tight">
                    Executive Payroll
                  </h1>
                  <h2 className="text-[clamp(2rem,8vw,4rem)] font-display font-bold text-transparent bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text tracking-tight leading-tight">
                    Analytics
                  </h2>
                </div>
              </div>
              <p className="text-[clamp(1rem,4vw,1.25rem)] text-slate-300 font-medium max-w-2xl leading-relaxed">
                Comprehensive workforce cost intelligence with real-time burden analysis for strategic decision making
              </p>
            </div>
            <div className="text-center lg:text-right bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 lg:p-6 border border-slate-700 min-w-fit transition-all duration-300 hover:bg-slate-800/70">
              <p className="text-sm text-slate-400 mb-2">Last Updated</p>
              <p className="text-[clamp(1.125rem,3vw,1.25rem)] font-bold text-white">
                {new Date().toLocaleDateString('en-US', { 
                  month: 'long', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </p>
              <p className="text-sm text-amber-400 mt-2">Live Data</p>
            </div>
          </div>
        </div>

        {/* Executive KPI Dashboard */}
        <div className="mb-8 md:mb-16 grid gap-4 lg:gap-8 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
          {/* Data Processing Status */}
          <Card 
            onClick={() => handleMetricClick('data-sources')}
            className="group bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700 hover:border-amber-500/50 transition-all duration-300 shadow-2xl hover:shadow-amber-500/20 cursor-pointer min-h-[180px] sm:min-h-[200px] hover:scale-105 transform"
          >
            <CardContent className="p-4 sm:p-6 lg:p-8 h-full flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="p-3 sm:p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg touch-manipulation">
                  <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-emerald-500/20 border border-emerald-500/30 rounded-full">
                  <span className="text-xs sm:text-sm font-bold text-emerald-400">OPERATIONAL</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-[clamp(2rem,6vw,2.5rem)] font-bold text-white mb-2">
                  {summary?.completed_files ?? 0}
                </div>
                <p className="text-[clamp(1rem,3vw,1.125rem)] font-semibold text-slate-300">Data Sources</p>
                <p className="text-[clamp(0.875rem,2.5vw,0.875rem)] text-slate-400">
                  {summary?.failed_files ?? 0} failed • {files.length} total processed
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Workforce Analytics */}
          <Card 
            onClick={() => handleMetricClick('workforce')}
            className="group bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700 hover:border-amber-500/50 transition-all duration-300 shadow-2xl hover:shadow-amber-500/20 cursor-pointer min-h-[180px] sm:min-h-[200px] hover:scale-105 transform"
          >
            <CardContent className="p-4 sm:p-6 lg:p-8 h-full flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="p-3 sm:p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg touch-manipulation">
                  <Users className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-500/20 border border-blue-500/30 rounded-full">
                  <span className="text-xs sm:text-sm font-bold text-blue-400">WORKFORCE</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-[clamp(2rem,6vw,2.5rem)] font-bold text-white mb-2">
                  {employeeCosts.length}
                </div>
                <p className="text-[clamp(1rem,3vw,1.125rem)] font-semibold text-slate-300">Active Employees</p>
                <p className="text-[clamp(0.875rem,2.5vw,0.875rem)] text-slate-400">Full cost analysis available</p>
              </div>
            </CardContent>
          </Card>

          {/* Financial Impact */}
          <Card 
            onClick={() => handleMetricClick('investment')}
            className="group bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700 hover:border-amber-500/50 transition-all duration-300 shadow-2xl hover:shadow-amber-500/20 cursor-pointer min-h-[180px] sm:min-h-[200px] hover:scale-105 transform"
          >
            <CardContent className="p-4 sm:p-6 lg:p-8 h-full flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="p-3 sm:p-4 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl shadow-lg touch-manipulation">
                  <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-amber-500/20 border border-amber-500/30 rounded-full">
                  <span className="text-xs sm:text-sm font-bold text-amber-400">ALL-TIME</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-[clamp(1.5rem,5vw,2.5rem)] font-bold text-white mb-2 leading-tight">
                  ${totalAllTimeCost > 0 ? Math.round(totalAllTimeCost).toLocaleString('en-US') : '0'}
                </div>
                <p className="text-[clamp(1rem,3vw,1.125rem)] font-semibold text-slate-300">Total Investment</p>
                <p className="text-[clamp(0.875rem,2.5vw,0.875rem)] text-slate-400">
                  Click to analyze monthly trends
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Burden Analysis */}
          <Card 
            onClick={() => handleMetricClick('burden')}
            className="group bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-700 hover:border-amber-500/50 transition-all duration-300 shadow-2xl hover:shadow-amber-500/20 cursor-pointer min-h-[180px] sm:min-h-[200px] hover:scale-105 transform"
          >
            <CardContent className="p-4 sm:p-6 lg:p-8 h-full flex flex-col justify-between">
              <div className="flex items-center justify-between mb-4 sm:mb-6">
                <div className="p-3 sm:p-4 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl shadow-lg touch-manipulation">
                  <TrendingUp className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-purple-500/20 border border-purple-500/30 rounded-full">
                  <span className="text-xs sm:text-sm font-bold text-purple-400">BURDEN</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-[clamp(2rem,6vw,2.5rem)] font-bold text-white mb-2">
                  {averageBurdenRate > 0 ? (averageBurdenRate * 100).toFixed(1) : '0.0'}%
                </div>
                <p className="text-[clamp(1rem,3vw,1.125rem)] font-semibold text-slate-300">Burden Rate</p>
                <p className="text-[clamp(0.875rem,2.5vw,0.875rem)] text-slate-400">
                  Click to forecast burden trends
                </p>
              </div>
            </CardContent>
          </Card>
        </div>


        {/* Executive Command Center */}
        <Card className="mb-16 bg-gradient-to-r from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-slate-700 shadow-2xl">
          <CardHeader className="pb-6">
            <div className="flex items-center gap-4">
              <div className="w-2 h-8 bg-gradient-to-b from-amber-400 to-amber-600 rounded-full"></div>
              <div>
                <CardTitle className="text-2xl font-bold text-white">Executive Command Center</CardTitle>
                <p className="text-slate-400 text-lg">Strategic workforce management controls</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-3">
              <Button 
                onClick={() => void processFiles()} 
                disabled={isProcessing}
                className="group relative h-16 px-8 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-lg shadow-xl hover:shadow-2xl hover:shadow-emerald-500/25 transition-all duration-300 rounded-xl border border-emerald-500/20"
              >
                <div className="flex items-center justify-center gap-4">
                  {isProcessing ? (
                    <>
                      <RefreshCw className="h-6 w-6 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="h-6 w-6" />
                      <span>Process Data</span>
                    </>
                  )}
                </div>
              </Button>
              
              <Button 
                onClick={() => void loadData()} 
                disabled={isLoading}
                className="group relative h-16 px-8 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold text-lg shadow-xl hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 rounded-xl border border-blue-500/20"
              >
                <div className="flex items-center justify-center gap-4">
                  <RefreshCw className={`h-6 w-6 ${isLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh Analytics</span>
                </div>
              </Button>

              <Button 
                onClick={() => window.open('/api/export/excel', '_blank')}
                className="group relative h-16 px-8 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold text-lg shadow-xl hover:shadow-2xl hover:shadow-amber-500/25 transition-all duration-300 rounded-xl border border-amber-500/20"
              >
                <div className="flex items-center justify-center gap-4">
                  <Download className="h-6 w-6" />
                  <span>Export Report</span>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Data Sources */}
          <Card className="bg-white/90 backdrop-blur-sm shadow-xl border-0 ring-1 ring-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-600" />
                Data Sources
              </CardTitle>
              <p className="text-sm text-slate-600">Processed payroll files</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {files.length === 0 ? (
                  <div className="text-center py-6 text-slate-500">
                    <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No files found</p>
                    <p className="text-xs">Drop CSV files into payroll-files-only folder</p>
                  </div>
                ) : (
                  files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex-1">
                        <div className="font-medium text-slate-800 text-sm">{file.filename}</div>
                        <div className="text-xs text-slate-500 mt-1">
                          {file.type} • {(file.size / 1024).toFixed(1)}KB
                        </div>
                      </div>
                      <div className={`text-xs px-3 py-1 rounded-full font-semibold ${
                        file.processed ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {file.processed ? '✓ Processed' : '⏳ Pending'}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Top Employee Costs */}
          <Card className="lg:col-span-2 bg-white/90 backdrop-blur-sm shadow-xl border-0 ring-1 ring-slate-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <Users className="h-5 w-5 text-emerald-600" />
                Top Employee Costs
              </CardTitle>
              <p className="text-sm text-slate-600">True cost including all burdens and benefits</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {employeeCosts.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Users className="h-10 w-10 mx-auto mb-3 opacity-50" />
                    <p className="text-sm font-medium">No employee cost data</p>
                    <p className="text-xs">Process payroll files to see employee costs</p>
                  </div>
                ) : (
                  employeeCosts.slice(0, 10).map((emp, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {emp.employee_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800">{emp.employee_name}</div>
                            <div className="text-xs text-slate-500">
                              {Number(emp.total_hours).toLocaleString()}h • {(Number(emp.burden_rate) * 100).toFixed(1)}% burden
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-slate-800">
                          ${Math.round(Number(emp.total_true_cost)).toLocaleString('en-US')}
                        </div>
                        <div className="text-xs text-slate-500">
                          ${Math.round(Number(emp.gross_pay)).toLocaleString('en-US')} base
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Executive Summary */}
        <Card className="mt-10 bg-gradient-to-r from-blue-50 to-indigo-50 border-0 ring-1 ring-blue-200">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-blue-900 flex items-center gap-2">
              💼 Executive Summary
            </CardTitle>
            <p className="text-blue-700">Complete workforce cost analysis and reporting</p>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-blue-900 mb-3">Cost Analysis Capabilities</h4>
                <ul className="space-y-2 text-blue-800">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    True employee cost calculation including all burdens
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Employer tax burden analysis (FICA, Medicare, FUTA, SUTA)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Benefits cost integration and reporting
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    Project allocation and time tracking analysis
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 mb-3">Data Sources & Export</h4>
                <ul className="space-y-2 text-blue-800">
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    SpringAhead time tracking integration
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    Paychex payroll data processing
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    Executive Excel reports for board meetings
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    Real-time dashboard analytics
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Enhanced Chat Modal */}
      {showEnhancedChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-4xl h-[80vh] bg-slate-900 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h2 className="text-xl font-semibold text-white">
                Executive Analysis: {chatContext.activeMetric || 'Dashboard'}
              </h2>
              <Button
                onClick={() => setShowEnhancedChat(false)}
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white"
              >
                ✕ Close
              </Button>
            </div>
            <EnhancedChatInterface 
              className="h-full rounded-none border-none"
              context={chatContext}
              onRequestVisualization={(data) => console.log('Visualization requested:', data)}
              onRequestForecast={(params) => console.log('Forecast requested:', params)}
            />
          </div>
        </div>
      )}

      {/* Keep original floating chat for general use */}
      <FloatingChatButton />
    </div>
  );
}
