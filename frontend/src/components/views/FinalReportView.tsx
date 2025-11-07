import React, { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from 'recharts';
import axios from 'axios';

interface WorkflowReport {
  workflow_id: string;
  executive_summary: {
    application_analyzed: string;
    endpoints_discovered: number;
    components_discovered: number;
    tests_generated: number;
    overall_success_rate: number;
    coverage_achieved: number;
    execution_time: string;
    key_findings: string[];
  };
  scan_analysis: {
    scan_metadata: any;
    project_structure: any;
    endpoints: any[];
    components: any[];
    summary: any;
  };
  test_generation_summary: {
    total_tests_generated: number;
    generation_metadata: any;
  };
  execution_summary: {
    execution_results: any;
    success_rate: number;
  };
  coverage_report: {
    endpoint_coverage: any;
    method_coverage: any;
    overall_coverage: number;
  };
  optimization_report: {
    healing_actions: any[];
    optimization_metrics: any;
  };
  recommendations: string[];
  performance_metrics: {
    total_execution_time: number;
    workflow_efficiency: number;
  };
  generated_at: string;
}

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const FinalReportView = () => {
  const [report, setReport] = useState<WorkflowReport | null>(null);
  const [workflowId, setWorkflowId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'scan' | 'tests' | 'coverage' | 'recommendations'>('overview');

  const fetchReport = async () => {
    if (!workflowId.trim()) {
      setError('Please enter a workflow ID');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`/api/workflow/workflow/${workflowId}/report`);
      setReport(response.data);
    } catch (err: any) {
      setError(err.response?.data?.detail || err.message || 'Failed to fetch report');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async (format: 'json' | 'html' | 'pdf') => {
    if (!report) return;

    try {
      const reportData = JSON.stringify(report, null, 2);
      
      let blob: Blob;
      let filename: string;
      
      switch (format) {
        case 'json':
          blob = new Blob([reportData], { type: 'application/json' });
          filename = `workflow_report_${report.workflow_id}.json`;
          break;
        case 'html':
          const htmlContent = generateHTMLReport(report);
          blob = new Blob([htmlContent], { type: 'text/html' });
          filename = `workflow_report_${report.workflow_id}.html`;
          break;
        default:
          blob = new Blob([reportData], { type: 'application/json' });
          filename = `workflow_report_${report.workflow_id}.json`;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export failed:', err);
    }
  };

  const generateHTMLReport = (report: WorkflowReport): string => {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MERN AI Testing Platform - Workflow Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
        .header { background: #4F46E5; color: white; padding: 20px; border-radius: 8px; }
        .section { margin: 20px 0; padding: 15px; border-left: 4px solid #4F46E5; }
        .metric { display: inline-block; margin: 10px; padding: 10px; background: #F3F4F6; border-radius: 4px; }
        .finding { background: #FEF3C7; padding: 10px; margin: 5px 0; border-radius: 4px; }
        .recommendation { background: #DBEAFE; padding: 10px; margin: 5px 0; border-radius: 4px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>MERN AI Testing Platform - Final Report</h1>
        <p>Workflow ID: ${report.workflow_id}</p>
        <p>Generated: ${new Date(report.generated_at).toLocaleString()}</p>
    </div>
    
    <div class="section">
        <h2>Executive Summary</h2>
        <div class="metric">Application: ${report.executive_summary.application_analyzed}</div>
        <div class="metric">Endpoints: ${report.executive_summary.endpoints_discovered}</div>
        <div class="metric">Tests Generated: ${report.executive_summary.tests_generated}</div>
        <div class="metric">Success Rate: ${(report.executive_summary.overall_success_rate * 100).toFixed(1)}%</div>
        <div class="metric">Coverage: ${(report.executive_summary.coverage_achieved * 100).toFixed(1)}%</div>
        <div class="metric">Execution Time: ${report.executive_summary.execution_time}</div>
    </div>
    
    <div class="section">
        <h2>Key Findings</h2>
        ${report.executive_summary.key_findings.map(finding => 
          `<div class="finding">• ${finding}</div>`
        ).join('')}
    </div>
    
    <div class="section">
        <h2>Recommendations</h2>
        ${report.recommendations.map(rec => 
          `<div class="recommendation">• ${rec}</div>`
        ).join('')}
    </div>
    
    <div class="section">
        <h2>Technical Details</h2>
        <h3>Scan Results</h3>
        <p>Total Files Analyzed: ${report.scan_analysis.scan_metadata?.total_files_analyzed || 'N/A'}</p>
        <p>Frameworks Detected: ${report.scan_analysis.summary?.frameworks_detected?.join(', ') || 'None'}</p>
        
        <h3>Test Execution</h3>
        <p>Total Tests Generated: ${report.test_generation_summary.total_tests_generated}</p>
        <p>Execution Success Rate: ${(report.execution_summary.success_rate * 100).toFixed(1)}%</p>
        
        <h3>Coverage Analysis</h3>
        <p>Overall Coverage: ${(report.coverage_report.overall_coverage * 100).toFixed(1)}%</p>
        <p>Endpoints Tested: ${report.coverage_report.endpoint_coverage?.tested || 0}/${report.coverage_report.endpoint_coverage?.total || 0}</p>
    </div>
    
    <div class="section">
        <h2>Performance Metrics</h2>
        <p>Total Execution Time: ${report.performance_metrics.total_execution_time.toFixed(2)} seconds</p>
        <p>Workflow Efficiency: ${(report.performance_metrics.workflow_efficiency * 100).toFixed(1)}%</p>
    </div>
</body>
</html>`;
  };

  const renderOverview = () => {
    if (!report) return null;

    const summaryData = [
      { name: 'Endpoints', value: report.executive_summary.endpoints_discovered, color: COLORS[0] },
      { name: 'Components', value: report.executive_summary.components_discovered, color: COLORS[1] },
      { name: 'Tests', value: report.executive_summary.tests_generated, color: COLORS[2] },
    ];

    const performanceData = [
      { name: 'Success Rate', value: report.executive_summary.overall_success_rate * 100 },
      { name: 'Coverage', value: report.executive_summary.coverage_achieved * 100 },
      { name: 'Efficiency', value: report.performance_metrics.workflow_efficiency * 100 },
    ];

    return (
      <div className="space-y-6">
        {/* Executive Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-blue-600">
              {report.executive_summary.endpoints_discovered}
            </div>
            <div className="text-sm text-gray-600">Endpoints Discovered</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-green-600">
              {report.executive_summary.tests_generated}
            </div>
            <div className="text-sm text-gray-600">Tests Generated</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-purple-600">
              {(report.executive_summary.overall_success_rate * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Success Rate</div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-orange-600">
              {(report.executive_summary.coverage_achieved * 100).toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Coverage Achieved</div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Discovery Summary</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={summaryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {summaryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={performanceData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="name" />
                  <PolarRadiusAxis angle={60} domain={[0, 100]} />
                  <Radar
                    name="Performance"
                    dataKey="value"
                    stroke="#6366F1"
                    fill="#6366F1"
                    fillOpacity={0.6}
                  />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Key Findings */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Key Findings</h3>
          <div className="space-y-2">
            {report.executive_summary.key_findings.map((finding, index) => (
              <div key={index} className="flex items-start">
                <span className="text-blue-500 mr-2 font-bold">•</span>
                <span className="text-gray-700">{finding}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderScanResults = () => {
    if (!report) return null;

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Project Structure Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Scan Metadata</h4>
              <div className="space-y-2 text-sm">
                <div>Total Files: {report.scan_analysis.scan_metadata?.total_files_analyzed || 'N/A'}</div>
                <div>Scan Time: {report.scan_analysis.scan_metadata?.scan_time?.toFixed(2) || 'N/A'}s</div>
                <div>Scanned Path: {report.scan_analysis.scan_metadata?.scanned_path || 'N/A'}</div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">MERN Stack Detection</h4>
              <div className="space-y-2 text-sm">
                {report.scan_analysis.summary?.frameworks_detected?.map((framework: string, index: number) => (
                  <div key={index} className="flex items-center">
                    <span className="text-green-500 mr-2">✓</span>
                    {framework}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Discovered Endpoints</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left">Method</th>
                  <th className="px-4 py-2 text-left">Path</th>
                  <th className="px-4 py-2 text-left">Framework</th>
                  <th className="px-4 py-2 text-left">File</th>
                  <th className="px-4 py-2 text-left">Parameters</th>
                </tr>
              </thead>
              <tbody>
                {report.scan_analysis.endpoints?.slice(0, 10).map((endpoint: any, index: number) => (
                  <tr key={index} className="border-t">
                    <td className="px-4 py-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        endpoint.method === 'GET' ? 'bg-green-100 text-green-800' :
                        endpoint.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                        endpoint.method === 'PUT' ? 'bg-yellow-100 text-yellow-800' :
                        endpoint.method === 'DELETE' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {endpoint.method}
                      </span>
                    </td>
                    <td className="px-4 py-2 font-mono text-sm">{endpoint.path}</td>
                    <td className="px-4 py-2 text-sm">{endpoint.framework}</td>
                    <td className="px-4 py-2 text-sm text-gray-600">{endpoint.file_path?.split('/').pop() || 'N/A'}</td>
                    <td className="px-4 py-2 text-sm">{endpoint.parameters?.length || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {(report.scan_analysis.endpoints?.length || 0) > 10 && (
              <div className="text-sm text-gray-500 mt-2">
                ... and {(report.scan_analysis.endpoints?.length || 0) - 10} more endpoints
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderTestResults = () => {
    if (!report) return null;

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Test Generation Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">
                {report.test_generation_summary.total_tests_generated}
              </div>
              <div className="text-sm text-gray-600">Total Tests Generated</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">
                {(report.execution_summary.success_rate * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Execution Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">
                {report.performance_metrics.total_execution_time.toFixed(2)}s
              </div>
              <div className="text-sm text-gray-600">Total Execution Time</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Optimization Report</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Self-Healing Actions</h4>
              <div className="space-y-2">
                {report.optimization_report.healing_actions?.length > 0 ? (
                  report.optimization_report.healing_actions.map((action: any, index: number) => (
                    <div key={index} className="p-3 bg-green-50 rounded border-l-4 border-green-400">
                      <div className="text-sm font-medium text-green-800">
                        {action.action || 'Unknown Action'}
                      </div>
                      <div className="text-xs text-green-600 mt-1">
                        {action.timestamp ? new Date(action.timestamp).toLocaleString() : ''}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500 text-sm">No healing actions performed</div>
                )}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">RL Optimization Metrics</h4>
              <div className="space-y-2">
                {Object.entries(report.optimization_report.optimization_metrics || {}).map(([key, value]) => (
                  <div key={key} className="flex justify-between p-2 bg-blue-50 rounded">
                    <span className="text-sm font-medium text-blue-800 capitalize">
                      {key.replace(/_/g, ' ')}:
                    </span>
                    <span className="text-sm text-blue-600">
                      {typeof value === 'number' ? value.toFixed(2) : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderCoverageAnalysis = () => {
    if (!report) return null;

    const coverageData = [
      {
        name: 'Endpoint Coverage',
        tested: report.coverage_report.endpoint_coverage?.tested || 0,
        total: report.coverage_report.endpoint_coverage?.total || 0,
        percentage: (report.coverage_report.endpoint_coverage?.percentage || 0) * 100,
      },
      {
        name: 'Method Coverage',
        tested: report.coverage_report.method_coverage?.tested || 0,
        total: report.coverage_report.method_coverage?.total || 0,
        percentage: (report.coverage_report.method_coverage?.percentage || 0) * 100,
      },
    ];

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Coverage Overview</h3>
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-blue-600">
              {(report.coverage_report.overall_coverage * 100).toFixed(1)}%
            </div>
            <div className="text-gray-600">Overall Coverage</div>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={coverageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}%`, 'Coverage']} />
                <Bar dataKey="percentage" fill="#6366F1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {coverageData.map((coverage, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm border">
              <h4 className="font-medium mb-4">{coverage.name}</h4>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">Progress</span>
                <span className="text-sm font-medium">{coverage.percentage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{ width: `${coverage.percentage}%` }}
                ></div>
              </div>
              <div className="text-sm text-gray-500 mt-2">
                {coverage.tested} of {coverage.total} covered
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderRecommendations = () => {
    if (!report) return null;

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">System Recommendations</h3>
          <div className="space-y-4">
            {report.recommendations.map((recommendation, index) => (
              <div key={index} className="p-4 bg-blue-50 border-l-4 border-blue-400 rounded-r">
                <div className="flex items-start">
                  <span className="text-blue-500 mr-2">💡</span>
                  <div>
                    <div className="text-blue-800 font-medium">
                      Recommendation #{index + 1}
                    </div>
                    <div className="text-blue-700 mt-1">{recommendation}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Performance Analysis</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-2">Execution Metrics</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Execution Time:</span>
                  <span className="font-medium">{report.performance_metrics.total_execution_time.toFixed(2)}s</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Workflow Efficiency:</span>
                  <span className="font-medium">{(report.performance_metrics.workflow_efficiency * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tests per Second:</span>
                  <span className="font-medium">
                    {(report.executive_summary.tests_generated / report.performance_metrics.total_execution_time).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2">Quality Metrics</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Success Rate:</span>
                  <span className="font-medium">{(report.executive_summary.overall_success_rate * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Coverage Achievement:</span>
                  <span className="font-medium">{(report.executive_summary.coverage_achieved * 100).toFixed(1)}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Endpoints per Component:</span>
                  <span className="font-medium">
                    {(report.executive_summary.endpoints_discovered / Math.max(1, report.executive_summary.components_discovered)).toFixed(1)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h2 className="text-2xl font-semibold mb-4">Final Report Viewer</h2>
        <p className="text-gray-600 mb-4">
          View comprehensive reports from completed MERN AI Testing Platform workflows.
        </p>
        
        {/* Workflow ID Input */}
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Workflow ID
            </label>
            <input
              type="text"
              value={workflowId}
              onChange={(e) => setWorkflowId(e.target.value)}
              placeholder="Enter workflow ID (e.g., workflow_20231227_143022)"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={fetchReport}
            disabled={loading || !workflowId.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Loading...' : 'Load Report'}
          </button>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-md">
            <strong>Error:</strong> {error}
          </div>
        )}
      </div>

      {/* Report Content */}
      {report && (
        <>
          {/* Report Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-lg shadow-sm">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold">MERN AI Testing Platform Report</h2>
                <p className="opacity-90 mt-1">Workflow ID: {report.workflow_id}</p>
                <p className="opacity-75 text-sm">Generated: {new Date(report.generated_at).toLocaleString()}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => exportReport('json')}
                  className="px-4 py-2 bg-white bg-opacity-20 rounded-md hover:bg-opacity-30 transition-colors text-sm"
                >
                  Export JSON
                </button>
                <button
                  onClick={() => exportReport('html')}
                  className="px-4 py-2 bg-white bg-opacity-20 rounded-md hover:bg-opacity-30 transition-colors text-sm"
                >
                  Export HTML
                </button>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="border-b">
              <nav className="flex">
                {[
                  { key: 'overview', label: 'Overview', icon: '📊' },
                  { key: 'scan', label: 'Scan Results', icon: '🔍' },
                  { key: 'tests', label: 'Test Results', icon: '🧪' },
                  { key: 'coverage', label: 'Coverage', icon: '📈' },
                  { key: 'recommendations', label: 'Recommendations', icon: '💡' },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.key
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'overview' && renderOverview()}
              {activeTab === 'scan' && renderScanResults()}
              {activeTab === 'tests' && renderTestResults()}
              {activeTab === 'coverage' && renderCoverageAnalysis()}
              {activeTab === 'recommendations' && renderRecommendations()}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default FinalReportView;