'use client';

import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Link2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Users,
  Building,
  Calendar,
  Activity,
  Zap,
  Shield,
  Clock,
  Download,
  Settings
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExecutiveLayout } from '@/components/layouts/ExecutiveLayout';

interface DataSourceStatus {
  name: string;
  status: 'connected' | 'syncing' | 'error' | 'disconnected';
  lastSync: string;
  recordCount: number;
  healthScore: number;
  endpoint: string;
  responseTime: number;
}

interface QuickBooksData {
  companyName: string;
  realmId: string;
  employeeCount: number;
  lastSyncTime: string;
  syncStatus: string;
  dataMapping: {
    employees: number;
    payrollItems: number;
    accounts: number;
  };
}

interface SyncActivity {
  timestamp: string;
  action: string;
  status: 'success' | 'warning' | 'error';
  details: string;
  recordsProcessed: number;
}

export default function DataSourcesPage(): React.JSX.Element {
  const [dataSources, setDataSources] = useState<DataSourceStatus[]>([]);
  const [quickbooksData, setQuickbooksData] = useState<QuickBooksData | null>(null);
  const [syncActivity, setSyncActivity] = useState<SyncActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadDataSources();
  }, []);

  const loadDataSources = async () => {
    setIsLoading(true);
    try {
      // Check QuickBooks API health
      const quickbooksHealth = await fetch('http://localhost:8001/health');
      const quickbooksHealthy = quickbooksHealth.ok;
      
      // Check NeuralProphet forecasting service
      const forecastHealth = await fetch('http://localhost:8000/health');
      const forecastHealthy = forecastHealth.ok;

      // Load data sources status
      const mockDataSources: DataSourceStatus[] = [
        {
          name: 'QuickBooks Online',
          status: quickbooksHealthy ? 'connected' : 'error',
          lastSync: '2024-12-28T15:30:00Z',
          recordCount: 33,
          healthScore: quickbooksHealthy ? 98.2 : 0,
          endpoint: 'localhost:8001',
          responseTime: 245
        },
        {
          name: 'NeuralProphet ML',
          status: forecastHealthy ? 'connected' : 'error',
          lastSync: '2024-12-28T15:45:00Z',
          recordCount: 1209,
          healthScore: forecastHealthy ? 96.7 : 0,
          endpoint: 'localhost:8000',
          responseTime: 850
        },
        {
          name: 'Neon PostgreSQL',
          status: 'connected',
          lastSync: '2024-12-28T15:50:00Z',
          recordCount: 40,
          healthScore: 99.5,
          endpoint: 'neon.tech',
          responseTime: 120
        },
        {
          name: 'Paychex Integration',
          status: 'syncing',
          lastSync: '2024-12-28T14:20:00Z',
          recordCount: 586,
          healthScore: 94.8,
          endpoint: 'api.paychex.com',
          responseTime: 320
        }
      ];
      setDataSources(mockDataSources);

      // Load QuickBooks specific data if available
      if (quickbooksHealthy) {
        try {
          const qbResponse = await fetch('http://localhost:8001/api/employees/test-analytics-company-001');
          if (qbResponse.ok) {
            const qbData = await qbResponse.json();
            setQuickbooksData({
              companyName: 'Analytics Test Company',
              realmId: 'test-analytics-company-001',
              employeeCount: qbData.employees?.length || 33,
              lastSyncTime: '2024-12-28T15:30:00Z',
              syncStatus: 'active',
              dataMapping: {
                employees: 33,
                payrollItems: 10,
                accounts: 15
              }
            });
          }
        } catch (error) {
          console.log('QuickBooks data not available');
        }
      }

      // Mock sync activity
      const mockSyncActivity: SyncActivity[] = [
        {
          timestamp: '2024-12-28T15:50:12Z',
          action: 'Employee Data Sync',
          status: 'success',
          details: 'Successfully synced 33 employee records from QuickBooks',
          recordsProcessed: 33
        },
        {
          timestamp: '2024-12-28T15:45:08Z',
          action: 'ML Model Training',
          status: 'success',
          details: 'NeuralProphet model retrained with latest payroll data',
          recordsProcessed: 1209
        },
        {
          timestamp: '2024-12-28T15:30:05Z',
          action: 'Burden Rate Calculation',
          status: 'success',
          details: 'Python statistical analysis updated burden rates',
          recordsProcessed: 40
        },
        {
          timestamp: '2024-12-28T15:15:22Z',
          action: 'Data Validation',
          status: 'warning',
          details: 'Minor discrepancies found in 2 employee records',
          recordsProcessed: 35
        },
        {
          timestamp: '2024-12-28T15:00:18Z',
          action: 'Database Backup',
          status: 'success',
          details: 'Automated backup completed successfully',
          recordsProcessed: 1842
        }
      ];
      setSyncActivity(mockSyncActivity);

    } catch (error) {
      console.error('Error loading data sources:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshSources = async () => {
    setIsRefreshing(true);
    await loadDataSources();
    setIsRefreshing(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-5 w-5 text-emerald-400" />;
      case 'syncing': return <RefreshCw className="h-5 w-5 text-amber-400 animate-spin" />;
      case 'error': return <XCircle className="h-5 w-5 text-red-400" />;
      case 'disconnected': return <XCircle className="h-5 w-5 text-slate-400" />;
      default: return <Activity className="h-5 w-5 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-emerald-400';
      case 'syncing': return 'text-amber-400';
      case 'error': return 'text-red-400';
      case 'disconnected': return 'text-slate-400';
      default: return 'text-slate-400';
    }
  };

  const getSyncIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-emerald-400" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-amber-400" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-400" />;
      default: return <Activity className="h-4 w-4 text-slate-400" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <ExecutiveLayout 
        title="Data Sources" 
        subtitle="Real-time integration monitoring and sync management"
      >
        <div className="space-y-8">
          {/* Loading skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
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
      title="Data Sources" 
      subtitle="Real-time integration monitoring and sync management"
    >
      <div className="space-y-8">
        {/* Integration Status Banner */}
        <Card className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 border-blue-500/30">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                  <Database className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">Integration Control Center</h3>
                  <p className="text-blue-300">
                    {dataSources.filter(ds => ds.status === 'connected').length} of {dataSources.length} systems connected
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 text-blue-400 text-sm font-semibold mb-1">
                  <Zap className="h-4 w-4" />
                  REAL-TIME
                </div>
                <div className="text-3xl font-bold text-white">
                  {Math.round(dataSources.reduce((sum, ds) => sum + ds.healthScore, 0) / dataSources.length)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Source Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {dataSources.map((source, index) => (
            <Card key={index} className="bg-slate-800/50 border-slate-700 hover:border-blue-500/50 transition-all duration-300 hover:scale-105">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gradient-to-br from-slate-700 to-slate-600 rounded-xl">
                    <Database className="h-6 w-6 text-blue-400" />
                  </div>
                  {getStatusIcon(source.status)}
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white">{source.name}</h3>
                  <p className={`text-sm font-semibold ${getStatusColor(source.status)}`}>
                    {source.status.toUpperCase()}
                  </p>
                  <div className="text-slate-400 text-xs space-y-1">
                    <p>Records: {source.recordCount.toLocaleString()}</p>
                    <p>Health: {source.healthScore}%</p>
                    <p>Response: {source.responseTime}ms</p>
                    <p>Last sync: {formatTimestamp(source.lastSync)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <h3 className="text-lg font-semibold text-white">Data Management Center</h3>
                <div className="flex items-center gap-2 text-blue-400 text-sm">
                  <Activity className="h-4 w-4" />
                  Real-time Monitoring
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={refreshSources}
                  disabled={isRefreshing}
                  variant="outline"
                  className="border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  {isRefreshing ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4 mr-2" />
                  )}
                  Refresh Status
                </Button>
                <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-500">
                  <Download className="h-4 w-4 mr-2" />
                  Export Logs
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* QuickBooks Detailed Status & Sync Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Building className="h-5 w-5 text-emerald-400" />
                QuickBooks Integration
              </CardTitle>
              <p className="text-slate-400 text-sm">Live connection status and data synchronization</p>
            </CardHeader>
            <CardContent>
              {quickbooksData ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-emerald-400" />
                      <div>
                        <p className="text-white font-semibold">{quickbooksData.companyName}</p>
                        <p className="text-slate-400 text-sm">Realm ID: {quickbooksData.realmId}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-emerald-400 font-bold">CONNECTED</p>
                      <p className="text-slate-400 text-sm">Port 8001</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                      <Users className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-white">{quickbooksData.dataMapping.employees}</p>
                      <p className="text-slate-400 text-sm">Employees</p>
                    </div>
                    <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                      <Calendar className="h-6 w-6 text-amber-400 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-white">{quickbooksData.dataMapping.payrollItems}</p>
                      <p className="text-slate-400 text-sm">Payroll Items</p>
                    </div>
                    <div className="text-center p-3 bg-slate-700/30 rounded-lg">
                      <Database className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                      <p className="text-2xl font-bold text-white">{quickbooksData.dataMapping.accounts}</p>
                      <p className="text-slate-400 text-sm">Accounts</p>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-700">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Last Sync</span>
                      <span className="text-white font-semibold">
                        {formatTimestamp(quickbooksData.lastSyncTime)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-slate-300">Sync Status</span>
                      <span className="text-emerald-400 font-semibold">
                        {quickbooksData.syncStatus.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                  <p className="text-white font-semibold mb-2">QuickBooks Disconnected</p>
                  <p className="text-slate-400 text-sm mb-4">Service unavailable at localhost:8001</p>
                  <Button 
                    size="sm"
                    className="bg-blue-500 hover:bg-blue-600 text-white"
                  >
                    <Link2 className="h-4 w-4 mr-2" />
                    Reconnect
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-amber-400" />
                Sync Activity Log
              </CardTitle>
              <p className="text-slate-400 text-sm">Recent data synchronization events</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {syncActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
                    <div className="flex-shrink-0 mt-1">
                      {getSyncIcon(activity.status)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-white font-semibold text-sm">{activity.action}</p>
                        <span className="text-slate-400 text-xs">
                          {formatTimestamp(activity.timestamp)}
                        </span>
                      </div>
                      <p className="text-slate-400 text-sm mb-1">{activity.details}</p>
                      <p className="text-slate-500 text-xs">
                        {activity.recordsProcessed.toLocaleString()} records processed
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Health Overview */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="h-5 w-5 text-purple-400" />
              System Health Overview
            </CardTitle>
            <p className="text-slate-400 text-sm">Comprehensive monitoring of all integrated services</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <h4 className="text-white font-semibold">Python Services</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm">NeuralProphet (8000)</span>
                    <span className="text-emerald-400 text-sm font-semibold">96.7%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm">QuickBooks API (8001)</span>
                    <span className="text-emerald-400 text-sm font-semibold">98.2%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm">Statistical Engine</span>
                    <span className="text-emerald-400 text-sm font-semibold">99.1%</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-white font-semibold">Data Sources</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm">Neon PostgreSQL</span>
                    <span className="text-emerald-400 text-sm font-semibold">99.5%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm">Paychex API</span>
                    <span className="text-amber-400 text-sm font-semibold">94.8%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm">File Processing</span>
                    <span className="text-emerald-400 text-sm font-semibold">97.3%</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="text-white font-semibold">Performance</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm">Avg Response Time</span>
                    <span className="text-white text-sm font-semibold">334ms</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm">Success Rate</span>
                    <span className="text-emerald-400 text-sm font-semibold">97.6%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300 text-sm">Data Accuracy</span>
                    <span className="text-emerald-400 text-sm font-semibold">99.2%</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ExecutiveLayout>
  );
}