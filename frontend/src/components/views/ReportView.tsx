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
  ComposedChart,
  Area,
  AreaChart,
  TreeMap,
  ScatterChart,
  Scatter,
} from 'recharts';
import axios from 'axios';

interface ReportData {
  report_id: string;
  workflow_id: string;
  generated_at: string;
  executive_summary: {
    total_tests: number;
    passed_tests: number;
    failed_tests: number;
    coverage_percentage: number;
    execution_time: number;
    critical_issues: number;
    security_issues: number;
    performance_issues: number;
  };
  detailed_results: {
    endpoint_analysis: Record<string, {
      total_tests: number;
      passed: number;
      failed: number;
      coverage: number;
      avg_response_time: number;
      issues: Array<{
        severity: string;
        type: string;
        description: string;
        recommendation: string;
      }>;
    }>;
    test_type_breakdown: Record<string, {
      count: number;
      success_rate: number;
      avg_duration: number;
    }>;
    performance_metrics: {
      response_times: Array<{
        endpoint: string;
        avg_time: number;
        p95_time: number;
        p99_time: number;
      }>;
      throughput: Array<{
        endpoint: string;
        requests_per_second: number;
      }>;
      error_rates: Array<{
        endpoint: string;
        error_rate: number;
      }>;
    };
    security_analysis: {
      vulnerabilities_found: number;
      security_tests_passed: number;
      security_tests_failed: number;
      critical_vulnerabilities: Array<{
        endpoint: string;
        vulnerability_type: string;
        severity: string;
        description: string;
        recommendation: string;
      }>;
    };
    coverage_analysis: {
      endpoint_coverage: Record<string, number>;
      parameter_coverage: Record<string, number>;
      path_coverage: Record<string, number>;
      method_coverage: Record<string, number>;
      uncovered_paths: string[];
      recommendations: string[];
    };
  };
  recommendations: {
    priority: string;
    category: string;
    title: string;
    description: string;
    impact: string;
    effort: string;
    implementation_guide: string;
  }[];
  optimization_insights: {
    rl_performance: {
      policy_iterations: number;
      reward_improvement: number;
      convergence_rate: number;
      optimal_actions: Record<string, string>;
    };
    self_healing_stats: {
      auto_fixed_tests: number;
      fix_success_rate: number;
      common_fix_patterns: Array<{
        pattern: string;
        frequency: number;
        success_rate: number;
      }>;
    };
    efficiency_metrics: {
      test_generation_time: number;
      execution_efficiency: number;
      resource_utilization: number;
      cost_analysis: {
        compute_cost: number;
        time_saved: number;
        manual_testing_equivalent: number;
      };
    };
  };
}

const COLORS = {
  primary: '#6366F1',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#06B6D4',
  purple: '#8B5CF6',
  pink: '#EC4899',
  gray: '#6B7280'
};

const SEVERITY_COLORS = {
  critical: '#EF4444',
  high: '#F97316',
  medium: '#F59E0B',
  low: '#84CC16',
  info: '#06B6D4'
};

const ReportView = () => {
  const [reports, setReports] = useState<ReportData[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedTimeRange, setSelectedTimeRange] = useState('7d');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/reports', {
        params: { time_range: selectedTimeRange }
      });
      setReports(response.data.reports);
      if (response.data.reports.length > 0 && !selectedReport) {
        setSelectedReport(response.data.reports[0]);
      }
      setError(null);
    } catch (err) {
      setError('Failed to fetch reports');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async (workflowId: string) => {
    try {
      const response = await axios.post('/api/reports/generate', {
        workflow_id: workflowId
      });
      await fetchReports();
      return response.data;
    } catch (err) {
      console.error('Failed to generate report:', err);
      throw err;
    }
  };

  const exportReport = async (reportId: string, format: 'pdf' | 'html' | 'json') => {
    try {
      const response = await axios.get(`/api/reports/${reportId}/export`, {
        params: { format },
        responseType: format === 'json' ? 'json' : 'blob'
      });

      if (format === 'json') {
        const blob = new Blob([JSON.stringify(response.data, null, 2)], {
          type: 'application/json'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report-${reportId}.json`;
        a.click();
      } else {
        const blob = new Blob([response.data]);
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report-${reportId}.${format}`;
        a.click();
      }
    } catch (err) {
      console.error('Failed to export report:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-md">
        {error}
        <button
          onClick={fetchReports}
          className="ml-4 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!selectedReport) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">No reports available</p>
        <button
          onClick={fetchReports}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          Refresh
        </button>
      </div>
    );
  }

  const renderOverviewTab = () => {
    const summary = selectedReport.executive_summary;
    const successRate = summary.total_tests > 0 ? (summary.passed_tests / summary.total_tests) * 100 : 0;

    const summaryData = [
      { name: 'Passed', value: summary.passed_tests, color: COLORS.success },
      { name: 'Failed', value: summary.failed_tests, color: COLORS.error },
    ];

    const issuesData = [
      { name: 'Critical', value: summary.critical_issues, color: SEVERITY_COLORS.critical },
      { name: 'Security', value: summary.security_issues, color: SEVERITY_COLORS.high },
      { name: 'Performance', value: summary.performance_issues, color: SEVERITY_COLORS.medium },
    ];

    return (
      <div className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500">Success Rate</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {successRate.toFixed(1)}%
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {summary.passed_tests}/{summary.total_tests} tests
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500">Coverage</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {(summary.coverage_percentage * 100).toFixed(1)}%
            </p>
            <p className="text-sm text-gray-600 mt-1">API coverage achieved</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500">Execution Time</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              {Math.round(summary.execution_time)}s
            </p>
            <p className="text-sm text-gray-600 mt-1">Total runtime</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500">Issues Found</h3>
            <p className="text-3xl font-bold text-orange-600 mt-2">
              {summary.critical_issues + summary.security_issues + summary.performance_issues}
            </p>
            <p className="text-sm text-gray-600 mt-1">Require attention</p>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Test Results Distribution</h3>
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
                    label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
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
            <h3 className="text-lg font-semibold mb-4">Issues Breakdown</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={issuesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill={COLORS.warning} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderPerformanceTab = () => {
    const performance = selectedReport.detailed_results.performance_metrics;

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Response Time Analysis</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={performance.response_times}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="endpoint" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="avg_time" fill={COLORS.primary} name="Average (ms)" />
                <Line
                  type="monotone"
                  dataKey="p95_time"
                  stroke={COLORS.warning}
                  strokeWidth={2}
                  name="P95 (ms)"
                />
                <Line
                  type="monotone"
                  dataKey="p99_time"
                  stroke={COLORS.error}
                  strokeWidth={2}
                  name="P99 (ms)"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Throughput Analysis</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performance.throughput}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="endpoint" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="requests_per_second" fill={COLORS.success} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Error Rates</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={performance.error_rates}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="endpoint" angle={-45} textAnchor="end" height={80} />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="error_rate"
                    stroke={COLORS.error}
                    fill={COLORS.error}
                    fillOpacity={0.6}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSecurityTab = () => {
    const security = selectedReport.detailed_results.security_analysis;

    return (
      <div className="space-y-6">
        {/* Security Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500">Vulnerabilities Found</h3>
            <p className="text-3xl font-bold text-red-600 mt-2">
              {security.vulnerabilities_found}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500">Security Tests Passed</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {security.security_tests_passed}
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-sm font-medium text-gray-500">Security Tests Failed</h3>
            <p className="text-3xl font-bold text-red-600 mt-2">
              {security.security_tests_failed}
            </p>
          </div>
        </div>

        {/* Critical Vulnerabilities */}
        {security.critical_vulnerabilities.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4 text-red-600">Critical Vulnerabilities</h3>
            <div className="space-y-4">
              {security.critical_vulnerabilities.map((vuln, index) => (
                <div key={index} className="border-l-4 border-red-500 bg-red-50 p-4">
                  <div className="flex items-start">
                    <div className="flex-1">
                      <h4 className="font-semibold text-red-800">
                        {vuln.vulnerability_type} on {vuln.endpoint}
                      </h4>
                      <p className="text-red-700 mt-1">{vuln.description}</p>
                      <div className="mt-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${ 
                          vuln.severity === 'critical' 
                            ? 'bg-red-100 text-red-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {vuln.severity.toUpperCase()}
                        </span>
                      </div>
                      <div className="mt-3 p-2 bg-white border rounded">
                        <p className="text-sm text-gray-700">
                          <strong>Recommendation:</strong> {vuln.recommendation}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCoverageTab = () => {
    const coverage = selectedReport.detailed_results.coverage_analysis;

    const coverageData = Object.entries(coverage.endpoint_coverage).map(([endpoint, cov]) => ({
      endpoint,
      coverage: cov * 100
    }));

    return (
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Endpoint Coverage</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={coverageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="endpoint" angle={-45} textAnchor="end" height={100} />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value) => [`${value}%`, 'Coverage']} />
                <Bar dataKey="coverage" fill={COLORS.primary} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {coverage.uncovered_paths.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Uncovered Paths</h3>
            <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
              <ul className="list-disc list-inside space-y-1">
                {coverage.uncovered_paths.map((path, index) => (
                  <li key={index} className="text-yellow-800 text-sm">{path}</li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {coverage.recommendations.length > 0 && (
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Coverage Recommendations</h3>
            <div className="space-y-2">
              {coverage.recommendations.map((rec, index) => (
                <div key={index} className="flex items-start">
                  <span className="text-blue-500 mr-2 mt-1">•</span>
                  <span className="text-gray-700">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderOptimizationTab = () => {
    const optimization = selectedReport.optimization_insights;

    return (
      <div className="space-y-6">
        {/* RL Performance */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Reinforcement Learning Performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-sm text-gray-500">Policy Iterations</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {optimization.rl_performance.policy_iterations}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Reward Improvement</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                +{optimization.rl_performance.reward_improvement.toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Convergence Rate</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">
                {(optimization.rl_performance.convergence_rate * 100).toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        {/* Self-Healing Stats */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Self-Healing Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-500">Auto-Fixed Tests</span>
                <span className="text-lg font-semibold text-green-600">
                  {optimization.self_healing_stats.auto_fixed_tests}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Fix Success Rate</span>
                <span className="text-lg font-semibold text-blue-600">
                  {(optimization.self_healing_stats.fix_success_rate * 100).toFixed(1)}%
                </span>
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Common Fix Patterns</h4>
              <div className="space-y-1">
                {optimization.self_healing_stats.common_fix_patterns.map((pattern, index) => (
                  <div key={index} className="text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-700">{pattern.pattern}</span>
                      <span className="text-gray-500">
                        {pattern.frequency} ({(pattern.success_rate * 100).toFixed(0)}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Efficiency Metrics */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h3 className="text-lg font-semibold mb-4">Efficiency Metrics</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500">Test Generation Time</p>
                <p className="text-lg font-semibold text-blue-600">
                  {optimization.efficiency_metrics.test_generation_time.toFixed(2)}s
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Execution Efficiency</p>
                <p className="text-lg font-semibold text-green-600">
                  {(optimization.efficiency_metrics.execution_efficiency * 100).toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Resource Utilization</p>
                <p className="text-lg font-semibold text-purple-600">
                  {(optimization.efficiency_metrics.resource_utilization * 100).toFixed(1)}%
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded">
              <h4 className="font-medium mb-3">Cost Analysis</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Compute Cost</span>
                  <span className="text-sm font-medium">
                    ${optimization.efficiency_metrics.cost_analysis.compute_cost.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Time Saved</span>
                  <span className="text-sm font-medium text-green-600">
                    {Math.round(optimization.efficiency_metrics.cost_analysis.time_saved)}h
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Manual Testing Equivalent</span>
                  <span className="text-sm font-medium">
                    ${optimization.efficiency_metrics.cost_analysis.manual_testing_equivalent.toFixed(0)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderRecommendationsTab = () => {
    const recommendations = selectedReport.recommendations;

    const groupedRecommendations = recommendations.reduce((acc, rec) => {
      if (!acc[rec.category]) {
        acc[rec.category] = [];
      }
      acc[rec.category].push(rec);
      return acc;
    }, {} as Record<string, typeof recommendations>);

    return (
      <div className="space-y-6">
        {Object.entries(groupedRecommendations).map(([category, recs]) => (
          <div key={category} className="bg-white p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4 capitalize">{category} Recommendations</h3>
            <div className="space-y-4">
              {recs.map((rec, index) => (
                <div key={index} className="border-l-4 border-blue-500 bg-blue-50 p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-blue-800">{rec.title}</h4>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          rec.priority === 'high' 
                            ? 'bg-red-100 text-red-800'
                            : rec.priority === 'medium'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {rec.priority.toUpperCase()}
                        </span>
                      </div>
                      <p className="text-blue-700 mb-2">{rec.description}</p>
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <span className="text-xs font-medium text-gray-500">IMPACT:</span>
                          <p className="text-sm text-gray-700">{rec.impact}</p>
                        </div>
                        <div>
                          <span className="text-xs font-medium text-gray-500">EFFORT:</span>
                          <p className="text-sm text-gray-700">{rec.effort}</p>
                        </div>
                      </div>
                      <div className="bg-white border rounded p-3">
                        <span className="text-xs font-medium text-gray-500">IMPLEMENTATION:</span>
                        <p className="text-sm text-gray-700 mt-1">{rec.implementation_guide}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const tabs = [
    { id: 'overview', label: 'Overview', content: renderOverviewTab },
    { id: 'performance', label: 'Performance', content: renderPerformanceTab },
    { id: 'security', label: 'Security', content: renderSecurityTab },
    { id: 'coverage', label: 'Coverage', content: renderCoverageTab },
    { id: 'optimization', label: 'Optimization', content: renderOptimizationTab },
    { id: 'recommendations', label: 'Recommendations', content: renderRecommendationsTab },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Test Reports</h2>
            <p className="text-gray-600 mt-1">
              Comprehensive analysis and insights from your testing workflows
            </p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={reports.findIndex(r => r.report_id === selectedReport?.report_id)}
              onChange={(e) => setSelectedReport(reports[parseInt(e.target.value)])}
              className="border border-gray-300 rounded-md px-3 py-2"
            >
              {reports.map((report, index) => (
                <option key={report.report_id} value={index}>
                  Report {report.report_id.slice(-8)} - {new Date(report.generated_at).toLocaleDateString()}
                </option>
              ))}
            </select>
            <button
              onClick={() => exportReport(selectedReport.report_id, 'pdf')}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Export PDF
            </button>
            <button
              onClick={() => exportReport(selectedReport.report_id, 'json')}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
            >
              Export JSON
            </button>
          </div>
        </div>

        {/* Report Info */}
        <div className="mt-4 flex items-center gap-6 text-sm text-gray-600">
          <span>Report ID: {selectedReport.report_id}</span>
          <span>Workflow ID: {selectedReport.workflow_id}</span>
          <span>Generated: {new Date(selectedReport.generated_at).toLocaleString()}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 text-sm font-medium border-b-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {tabs.find(tab => tab.id === activeTab)?.content()}
        </div>
      </div>
    </div>
  );
};

export default ReportView;