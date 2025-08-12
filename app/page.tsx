'use client';

import { Upload, FileText, DollarSign, Users, TrendingUp, Download, RefreshCw } from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load file list
      const filesResponse = await fetch('/api/scan-files');
      if (filesResponse.ok) {
        const filesData = await filesResponse.json();
        setFiles(filesData.files || []);
      }

      // Load processing status
      const statusResponse = await fetch('/api/process-files');
      if (statusResponse.ok) {
        const statusData = await statusResponse.json();
        setSummary(statusData.summary);
      }

      // Load employee costs
      const costsResponse = await fetch('/api/employee-costs');
      if (costsResponse.ok) {
        const costsData = await costsResponse.json();
        setEmployeeCosts(costsData.employee_costs || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const processFiles = async () => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/process-files', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force: false })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Processing result:', result);
        await loadData(); // Reload data after processing
      }
    } catch (error) {
      console.error('Error processing files:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const totalMonthlyCost = employeeCosts.reduce((sum, emp) => sum + emp.total_true_cost, 0);
  const averageBurdenRate = employeeCosts.length > 0 
    ? employeeCosts.reduce((sum, emp) => sum + emp.burden_rate, 0) / employeeCosts.length 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold text-gray-900">CEO Payroll Dashboard</h1>
          <p className="text-gray-600">
            True employee cost analysis with burden calculations
          </p>
        </div>

        {/* Summary Stats */}
        <div className="mb-8 grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Files Processed</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary?.completed_files || 0}</div>
              <p className="text-xs text-muted-foreground">
                {summary?.failed_files || 0} failed • {files.length} total
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{employeeCosts.length}</div>
              <p className="text-xs text-muted-foreground">With cost data</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Monthly Cost</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${(totalMonthlyCost / 1000).toFixed(1)}K
              </div>
              <p className="text-xs text-muted-foreground">Including burden</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Burden Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(averageBurdenRate * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground">Employer taxes + benefits</p>
            </CardContent>
          </Card>
        </div>

        {/* Control Panel */}
        <div className="mb-8 flex gap-4">
          <Button 
            onClick={processFiles} 
            disabled={isProcessing}
            className="flex items-center gap-2"
          >
            {isProcessing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Process Files
              </>
            )}
          </Button>
          
          <Button 
            onClick={loadData} 
            variant="outline"
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button 
            variant="outline"
            className="flex items-center gap-2"
            onClick={() => window.open('/api/export/excel', '_blank')}
          >
            <Download className="h-4 w-4" />
            Export Excel
          </Button>
        </div>

        <div className="grid gap-8 md:grid-cols-2">
          {/* Files in Folder */}
          <Card>
            <CardHeader>
              <CardTitle>Files in payroll-files-only</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {files.length === 0 ? (
                  <p className="text-gray-500">No files found. Drop CSV/Excel files into the payroll-files-only folder.</p>
                ) : (
                  files.map((file, index) => (
                    <div key={index} className="flex items-center justify-between rounded border p-2">
                      <div>
                        <div className="font-medium">{file.filename}</div>
                        <div className="text-xs text-gray-500">
                          {file.type} • {(file.size / 1024).toFixed(1)}KB
                        </div>
                      </div>
                      <div className={`text-xs px-2 py-1 rounded ${
                        file.processed ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {file.processed ? 'Processed' : 'Pending'}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Employee Costs */}
          <Card>
            <CardHeader>
              <CardTitle>Employee True Costs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {employeeCosts.length === 0 ? (
                  <p className="text-gray-500">No employee cost data yet. Process some payroll files first.</p>
                ) : (
                  employeeCosts.map((emp, index) => (
                    <div key={index} className="flex items-center justify-between rounded border p-2">
                      <div>
                        <div className="font-medium">{emp.employee_name}</div>
                        <div className="text-xs text-gray-500">
                          {emp.total_hours}h • {(emp.burden_rate * 100).toFixed(1)}% burden
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">${emp.total_true_cost.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">
                          ${emp.gross_pay.toLocaleString()} base
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Instructions */}
        <div className="mt-8 rounded-lg border border-blue-200 bg-blue-50 p-6">
          <h3 className="mb-2 text-lg font-semibold text-blue-900">
            📁 How to Use
          </h3>
          <ul className="space-y-2 text-blue-800">
            <li>• Drop SpringAhead CSV files into the <code>/payroll-files-only/</code> folder</li>
            <li>• Drop Paychex payroll reports (CSV format) into the same folder</li>
            <li>• Click "Process Files" to extract data and calculate true costs</li>
            <li>• True costs include base salary + employer taxes + benefits (typically 30-40% burden)</li>
            <li>• Export to Excel for detailed analysis and board reports</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
