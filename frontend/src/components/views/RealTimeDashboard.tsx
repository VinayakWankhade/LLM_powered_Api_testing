import React, { useState, useEffect, useCallback } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Scatter,
  ScatterChart,
} from 'recharts';
import axios from 'axios';

interface RealTimeMetrics {
  timestamp: string;
  system_health: {
    status: 'healthy' | 'warning' | 'critical';
    uptime: number;
    memory_usage: number;
    cpu_usage: number;
    disk_usage: number;
    network_io: {
      bytes_sent: number;
      bytes_received: number;
    };
  };
  active_workflows: {
    total: number;
    running: number;
    queued: number;
    completed_last_hour: number;
    failed_last_hour: number;
  };
  test_execution_metrics: {
    tests_per_minute: number;
    average_response_time: number;
    success_rate_last_hour: number;
    error_rate_last_hour: number;
    throughput: number;
  };
  rl_optimization_status: {
    active_policies: number;
    learning_rate: number;
    recent_improvements: number;
    convergence_status: 'learning' | 'converged' | 'diverging';
    reward_trend: number[];
  };
  self_healing_activity: {
    fixes_attempted_last_hour: number;
    fixes_successful_last_hour: number;
    active_healing_sessions: number;
    most_common_fixes: Array<{
      pattern: string;
      count: number;
    }>;
  };
  coverage_trends: {
    current_coverage: number;
    coverage_trend: number[];
    endpoints_covered: number;
    total_endpoints: number;
    newly_discovered_endpoints: number;
  };
  alerts: Array<{
    id: string;
    severity: 'info' | 'warning' | 'critical';
    message: string;
    timestamp: string;
    component: string;
  }>;
  resource_utilization: {
    concurrent_executions: number;
    queue_length: number;
    thread_pool_usage: number;
    connection_pool_usage: number;
  };
}

const COLORS = {
  primary: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#06B6D4',
  purple: '#8B5CF6',
  pink: '#EC4899',
};

const RealTimeDashboard = () => {
  const [metrics, setMetrics] = useState<RealTimeMetrics | null>(null);
  const [historicalData, setHistoricalData] = useState<RealTimeMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(5000); // 5 seconds
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h');

  const fetchMetrics = useCallback(async () => {
    try {
      const response = await axios.get('/api/dashboard/realtime-metrics', {
        params: { time_range: selectedTimeRange }
      });
      const newMetrics = response.data;
      
      setMetrics(newMetrics);
      setHistoricalData(prev => {
        const updated = [...prev, newMetrics].slice(-50); // Keep last 50 data points
        return updated;
      });
      setError(null);
      setIsConnected(true);
    } catch (err) {
      console.error('Failed to fetch metrics:', err);
      setError('Failed to connect to backend');
      setIsConnected(false);
    }
  }, [selectedTimeRange]);

  useEffect(() => {
    fetchMetrics();
    setLoading(false);
  }, [fetchMetrics]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(fetchMetrics, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchMetrics]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return COLORS.success;
      case 'warning': return COLORS.warning;
      case 'critical': return COLORS.error;
      default: return COLORS.info;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'info': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const formatUptime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  const renderSystemHealth = () => {
    if (!metrics) return null;

    const health = metrics.system_health;
    
    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">System Health</h3>
          <div className="flex items-center gap-2">
            <div 
              className={`w-3 h-3 rounded-full ${
                health.status === 'healthy' ? 'bg-green-500' : 
                health.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
              }`}
            />
            <span className={`text-sm font-medium ${
              health.status === 'healthy' ? 'text-green-700' : 
              health.status === 'warning' ? 'text-yellow-700' : 'text-red-700'
            }`}>
              {health.status.toUpperCase()}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-500">Uptime</p>
            <p className="text-lg font-semibold text-green-600">
              {formatUptime(health.uptime)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">CPU Usage</p>
            <p className="text-lg font-semibold">
              {health.cpu_usage.toFixed(1)}%
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div 
                className={`h-2 rounded-full ${
                  health.cpu_usage > 80 ? 'bg-red-500' : 
                  health.cpu_usage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${health.cpu_usage}%` }}
              />
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500">Memory Usage</p>
            <p className="text-lg font-semibold">
              {health.memory_usage.toFixed(1)}%
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div 
                className={`h-2 rounded-full ${
                  health.memory_usage > 80 ? 'bg-red-500' : 
                  health.memory_usage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${health.memory_usage}%` }}
              />
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500">Disk Usage</p>
            <p className="text-lg font-semibold">
              {health.disk_usage.toFixed(1)}%
            </p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div 
                className={`h-2 rounded-full ${
                  health.disk_usage > 80 ? 'bg-red-500' : 
                  health.disk_usage > 60 ? 'bg-yellow-500' : 'bg-green-500'
                }`}
                style={{ width: `${health.disk_usage}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderWorkflowStatus = () => {
    if (!metrics) return null;

    const workflows = metrics.active_workflows;
    
    const workflowData = [
      { name: 'Running', value: workflows.running, color: COLORS.primary },
      { name: 'Queued', value: workflows.queued, color: COLORS.warning },
      { name: 'Completed', value: workflows.completed_last_hour, color: COLORS.success },
      { name: 'Failed', value: workflows.failed_last_hour, color: COLORS.error },
    ];

    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Workflow Status</h3>
        
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">{workflows.total}</p>
            <p className="text-sm text-gray-500">Total Active</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{workflows.running}</p>
            <p className="text-sm text-gray-500">Currently Running</p>
          </div>
        </div>

        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={workflowData.filter(d => d.value > 0)}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={60}
                label={({ name, value }) => `${name}: ${value}`}
              >
                {workflowData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderTestExecutionMetrics = () => {
    if (!metrics) return null;

    const execution = metrics.test_execution_metrics;

    const performanceData = historicalData.map((data, index) => ({
      time: index,
      testsPerMinute: data.test_execution_metrics.tests_per_minute,
      avgResponseTime: data.test_execution_metrics.average_response_time,
      successRate: data.test_execution_metrics.success_rate_last_hour * 100,
    }));

    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Test Execution Metrics</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Tests/Minute</p>
            <p className="text-xl font-bold text-blue-600">
              {execution.tests_per_minute.toFixed(1)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Avg Response</p>
            <p className="text-xl font-bold text-purple-600">
              {execution.average_response_time.toFixed(0)}ms
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Success Rate</p>
            <p className="text-xl font-bold text-green-600">
              {(execution.success_rate_last_hour * 100).toFixed(1)}%
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Throughput</p>
            <p className="text-xl font-bold text-orange-600">
              {execution.throughput.toFixed(1)} req/s
            </p>
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="time" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="testsPerMinute"
                fill={COLORS.primary}
                fillOpacity={0.3}
                stroke={COLORS.primary}
                name="Tests/min"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="avgResponseTime"
                stroke={COLORS.warning}
                strokeWidth={2}
                name="Avg Response (ms)"
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="successRate"
                stroke={COLORS.success}
                strokeWidth={2}
                name="Success Rate (%)"
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderRLOptimization = () => {
    if (!metrics) return null;

    const rl = metrics.rl_optimization_status;
    const rewardData = rl.reward_trend.map((reward, index) => ({
      iteration: index,
      reward: reward,
    }));

    const getConvergenceColor = (status: string) => {
      switch (status) {
        case 'converged': return 'text-green-600';
        case 'learning': return 'text-blue-600';
        case 'diverging': return 'text-red-600';
        default: return 'text-gray-600';
      }
    };

    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">RL Optimization Status</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Active Policies</p>
            <p className="text-xl font-bold text-blue-600">{rl.active_policies}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Learning Rate</p>
            <p className="text-xl font-bold text-purple-600">
              {rl.learning_rate.toFixed(4)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Recent Improvements</p>
            <p className="text-xl font-bold text-green-600">{rl.recent_improvements}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Convergence</p>
            <p className={`text-xl font-bold ${getConvergenceColor(rl.convergence_status)}`}>
              {rl.convergence_status.toUpperCase()}
            </p>
          </div>
        </div>

        {rewardData.length > 0 && (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={rewardData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="iteration" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="reward"
                  stroke={COLORS.success}
                  strokeWidth={2}
                  name="Reward"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    );
  };

  const renderSelfHealingActivity = () => {
    if (!metrics) return null;

    const healing = metrics.self_healing_activity;

    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Self-Healing Activity</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-sm text-gray-500">Fixes Attempted (1h)</p>
            <p className="text-xl font-bold text-blue-600">
              {healing.fixes_attempted_last_hour}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Fixes Successful (1h)</p>
            <p className="text-xl font-bold text-green-600">
              {healing.fixes_successful_last_hour}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Active Sessions</p>
            <p className="text-xl font-bold text-orange-600">
              {healing.active_healing_sessions}
            </p>
          </div>
        </div>

        {healing.most_common_fixes.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Most Common Fix Patterns</h4>
            <div className="space-y-2">
              {healing.most_common_fixes.slice(0, 5).map((fix, index) => (
                <div key={index} className="flex justify-between items-center text-sm">
                  <span className="text-gray-700">{fix.pattern}</span>
                  <span className="text-gray-500 font-medium">{fix.count}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderAlerts = () => {
    if (!metrics || !metrics.alerts.length) return null;

    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Recent Alerts</h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {metrics.alerts.slice(0, 10).map((alert) => (
            <div
              key={alert.id}
              className={`p-3 rounded border-l-4 ${getSeverityColor(alert.severity)}`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <p className="text-sm font-medium">{alert.message}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">{alert.component}</span>
                    <span className="text-xs text-gray-500">•</span>
                    <span className="text-xs text-gray-500">
                      {new Date(alert.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
                <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                  alert.severity === 'critical' ? 'bg-red-100 text-red-800' :
                  alert.severity === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {alert.severity.toUpperCase()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderResourceUtilization = () => {
    if (!metrics) return null;

    const resources = metrics.resource_utilization;

    const utilizationData = [
      { name: 'Concurrent Executions', value: resources.concurrent_executions, max: 100 },
      { name: 'Queue Length', value: resources.queue_length, max: 50 },
      { name: 'Thread Pool', value: resources.thread_pool_usage, max: 100 },
      { name: 'Connection Pool', value: resources.connection_pool_usage, max: 100 },
    ];

    return (
      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <h3 className="text-lg font-semibold mb-4">Resource Utilization</h3>
        
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={utilizationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip />
              <Bar 
                dataKey="value" 
                fill={COLORS.primary}
                name="Current Usage"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-4">
          {utilizationData.map((resource, index) => (
            <div key={index}>
              <div className="flex justify-between text-sm">
                <span>{resource.name}</span>
                <span>{resource.value}/{resource.max}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div
                  className={`h-2 rounded-full ${
                    (resource.value / resource.max) > 0.8 ? 'bg-red-500' :
                    (resource.value / resource.max) > 0.6 ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${(resource.value / resource.max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="bg-white p-4 rounded-lg shadow-sm border">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Real-Time Dashboard</h2>
            <div className="flex items-center gap-2 mt-1">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-600">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
              {metrics && (
                <span className="text-sm text-gray-500 ml-2">
                  Last updated: {new Date(metrics.timestamp).toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              <span className="text-sm">Auto Refresh</span>
            </label>
            
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              disabled={!autoRefresh}
              className="border border-gray-300 rounded px-3 py-1 text-sm"
            >
              <option value={1000}>1s</option>
              <option value={5000}>5s</option>
              <option value={10000}>10s</option>
              <option value={30000}>30s</option>
            </select>

            <button
              onClick={fetchMetrics}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              Refresh Now
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg">
          <p>{error}</p>
          <button
            onClick={fetchMetrics}
            className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
          >
            Retry Connection
          </button>
        </div>
      )}

      {/* Main Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderSystemHealth()}
        {renderWorkflowStatus()}
      </div>

      {/* Execution Metrics - Full Width */}
      {renderTestExecutionMetrics()}

      {/* Secondary Metrics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderRLOptimization()}
        {renderSelfHealingActivity()}
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderResourceUtilization()}
        {renderAlerts()}
      </div>
    </div>
  );
};

export default RealTimeDashboard;