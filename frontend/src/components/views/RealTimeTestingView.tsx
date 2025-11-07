import { useEffect, useState } from 'react';
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
} from 'recharts';
import axios from 'axios';

interface RealTimeData {
  dashboard: {
    total_tests: number;
    total_endpoints: number;
    overall_coverage: number;
    failure_rate: number;
    high_risk_endpoints: number;
    last_update: string;
    data_source: string;
  };
  coverage: {
    endpoint_coverage: any;
    parameter_coverage: any;
    coverage_trends: {
      endpoint_coverage: number[];
      method_coverage: number[];
      parameter_coverage: number[];
    };
    coverage_gaps: any;
    calculation_timestamp: string;
    data_source: string;
  };
  failures: {
    failure_patterns: any[];
    failure_trends: {
      daily_failure_rate: number[];
      weekly_failure_rate: number[];
    };
    failure_types: {
      timeout: number;
      assertion: number;
      network: number;
      authentication: number;
    };
    retry_success_rate: number;
    analysis_timestamp: string;
    data_source: string;
  };
  analytics: {
    execution_trends: {
      daily_executions: number[];
      success_rate: number[];
    };
    optimization_metrics: {
      policy_updates: number;
      learning_rate: number;
      reward_improvement: number;
    };
    performance_metrics: {
      avg_response_time: number;
      p95_response_time: number;
      execution_success_rate: number;
    };
    resource_utilization: {
      cpu_usage: number;
      memory_usage: number;
      disk_io: number;
    };
    calculation_timestamp: string;
    data_source: string;
  };
  simulator: any;
  testing_active: boolean;
}

interface TestingStatus {
  is_running: boolean;
  task_status: string | null;
  execution_stats: any;
  coverage_stats: any;
  failure_patterns: string[];
}

const RealTimeTestingView = () => {
  const [liveData, setLiveData] = useState<RealTimeData | null>(null);
  const [testingStatus, setTestingStatus] = useState<TestingStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [intervalSeconds, setIntervalSeconds] = useState(30);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [usingMockData, setUsingMockData] = useState(false);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [liveResponse, statusResponse] = await Promise.all([
        axios.get('/api/testing/live-metrics'),
        axios.get('/api/testing/status')
      ]);
      
      setLiveData(liveResponse.data);
      setTestingStatus(statusResponse.data);
      setError(null);
      setUsingMockData(false);
    } catch (err) {
      console.error('Backend not available, using mock data:', err);
      // Use mock data when backend is not available
      setLiveData(getMockRealTimeData());
      setTestingStatus(getMockTestingStatus());
      setError(null);
      setUsingMockData(true);
    } finally {
      setLoading(false);
    }
  };

  const getMockRealTimeData = (): RealTimeData => ({
    dashboard: {
      total_tests: 1542,
      total_endpoints: 12,
      overall_coverage: 0.85,
      failure_rate: 0.13,
      high_risk_endpoints: 2,
      last_update: new Date().toISOString(),
      data_source: 'mock_data'
    },
    coverage: {
      endpoint_coverage: {},
      parameter_coverage: {},
      coverage_trends: {
        endpoint_coverage: [0.82, 0.83, 0.84, 0.85, 0.86, 0.85, 0.85],
        method_coverage: [0.78, 0.79, 0.80, 0.81, 0.82, 0.81, 0.82],
        parameter_coverage: [0.75, 0.76, 0.77, 0.78, 0.79, 0.78, 0.80]
      },
      coverage_gaps: {},
      calculation_timestamp: new Date().toISOString(),
      data_source: 'mock_data'
    },
    failures: {
      failure_patterns: ['Authentication timeout', 'Rate limit exceeded'],
      failure_trends: {
        daily_failure_rate: [0.10, 0.12, 0.13, 0.11, 0.14, 0.13, 0.12],
        weekly_failure_rate: [0.11, 0.12, 0.13, 0.12]
      },
      failure_types: {
        timeout: 5,
        assertion: 2,
        network: 1,
        authentication: 3
      },
      retry_success_rate: 0.75,
      analysis_timestamp: new Date().toISOString(),
      data_source: 'mock_data'
    },
    analytics: {
      execution_trends: {
        daily_executions: [120, 145, 168, 192, 234, 275, 198],
        success_rate: [0.82, 0.85, 0.87, 0.84, 0.89, 0.87, 0.86]
      },
      optimization_metrics: {
        policy_updates: 15,
        learning_rate: 0.001,
        reward_improvement: 12.5
      },
      performance_metrics: {
        avg_response_time: 324.5,
        p95_response_time: 650.2,
        execution_success_rate: 0.87
      },
      resource_utilization: {
        cpu_usage: 45.2,
        memory_usage: 68.5,
        disk_io: 12.8
      },
      calculation_timestamp: new Date().toISOString(),
      data_source: 'mock_data'
    },
    simulator: {},
    testing_active: false
  });

  const getMockTestingStatus = (): TestingStatus => ({
    is_running: false,
    task_status: 'stopped',
    execution_stats: {
      total_executions: 1542,
      success_rate: 0.87
    },
    coverage_stats: {
      coverage_percentage: 83.3
    },
    failure_patterns: ['timeout', 'validation_error', 'auth_failed']
  });

  const startTesting = async () => {
    setActionLoading('start');
    try {
      await axios.post('/api/testing/start', null, {
        params: { interval_seconds: intervalSeconds }
      });
      setTimeout(fetchData, 1000); // Refresh after starting
    } catch (err) {
      setError('Failed to start testing');
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const stopTesting = async () => {
    setActionLoading('stop');
    try {
      await axios.post('/api/testing/stop');
      setTimeout(fetchData, 1000); // Refresh after stopping
    } catch (err) {
      setError('Failed to stop testing');
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const runSingleCycle = async () => {
    setActionLoading('cycle');
    try {
      await axios.post('/api/testing/run-single-cycle');
      setTimeout(fetchData, 1000); // Refresh after cycle
    } catch (err) {
      setError('Failed to run test cycle');
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const clearData = async () => {
    setActionLoading('clear');
    try {
      await axios.delete('/api/testing/clear-data');
      setTimeout(fetchData, 1000); // Refresh after clearing
    } catch (err) {
      setError('Failed to clear data');
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !liveData || !testingStatus) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-md">
        {error || 'No data available'}
      </div>
    );
  }

  // Transform data for charts
  const performanceTrendData = liveData.analytics.execution_trends.success_rate.map((value, index) => ({
    time: `T-${liveData.analytics.execution_trends.success_rate.length - index}`,
    performance: value,
  }));

  const coverageData = [
    { name: 'Endpoint Coverage', value: liveData.coverage.coverage_trends.endpoint_coverage[liveData.coverage.coverage_trends.endpoint_coverage.length - 1] * 100 },
    { name: 'Method Coverage', value: liveData.coverage.coverage_trends.method_coverage[liveData.coverage.coverage_trends.method_coverage.length - 1] * 100 },
    { name: 'Parameter Coverage', value: liveData.coverage.coverage_trends.parameter_coverage[liveData.coverage.coverage_trends.parameter_coverage.length - 1] * 100 },
  ];

  return (
    <div className="space-y-6">
      {usingMockData && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-blue-400">ℹ️</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-700">
                <strong>Demo Mode:</strong> Backend is not available. Displaying sample data to demonstrate the interface. Controls may not function.
              </p>
            </div>
          </div>
        </div>
      )}
      {/* Control Panel */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Real-Time Testing Control</h3>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              testingStatus.is_running 
                ? 'bg-green-100 text-green-800' 
                : 'bg-gray-100 text-gray-800'
            }`}>
              {testingStatus.is_running ? 'Running' : 'Stopped'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Interval (seconds)
            </label>
            <input
              type="number"
              value={intervalSeconds}
              onChange={(e) => setIntervalSeconds(parseInt(e.target.value))}
              min="10"
              max="300"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <p className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-md">
              {testingStatus.task_status || 'No active task'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={startTesting}
            disabled={testingStatus.is_running || actionLoading === 'start'}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {actionLoading === 'start' ? 'Starting...' : 'Start Testing'}
          </button>
          <button
            onClick={stopTesting}
            disabled={!testingStatus.is_running || actionLoading === 'stop'}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {actionLoading === 'stop' ? 'Stopping...' : 'Stop Testing'}
          </button>
          <button
            onClick={runSingleCycle}
            disabled={actionLoading === 'cycle'}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50"
          >
            {actionLoading === 'cycle' ? 'Running...' : 'Run Single Cycle'}
          </button>
          <button
            onClick={clearData}
            disabled={actionLoading === 'clear'}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200 disabled:opacity-50"
          >
            {actionLoading === 'clear' ? 'Clearing...' : 'Clear Data'}
          </button>
        </div>
      </div>

      {/* Live Dashboard Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800">Total Tests</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {liveData.dashboard.total_tests.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800">Coverage</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {(liveData.dashboard.overall_coverage * 100).toFixed(1)}%
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800">Failure Rate</h3>
          <p className="text-3xl font-bold text-purple-600 mt-2">
            {(liveData.dashboard.failure_rate * 100).toFixed(1)}%
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800">Total Endpoints</h3>
          <p className="text-3xl font-bold text-orange-600 mt-2">
            {liveData.dashboard.total_endpoints}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Performance Trends</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="performance"
                  stroke="#6366F1"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Coverage Metrics</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={coverageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis unit="%" />
                <Tooltip />
                <Bar dataKey="value" fill="#10B981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Performance Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Response Times</h4>
            <div className="space-y-1 text-sm">
              <p>Average: {liveData.analytics.performance_metrics.avg_response_time.toFixed(2)}ms</p>
              <p>95th Percentile: {liveData.analytics.performance_metrics.p95_response_time.toFixed(2)}ms</p>
              <p>Success Rate: {(liveData.analytics.performance_metrics.execution_success_rate * 100).toFixed(1)}%</p>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Resource Usage</h4>
            <div className="space-y-1 text-sm">
              <p>CPU: {liveData.analytics.resource_utilization.cpu_usage.toFixed(1)}%</p>
              <p>Memory: {liveData.analytics.resource_utilization.memory_usage.toFixed(1)}%</p>
              <p>Disk I/O: {liveData.analytics.resource_utilization.disk_io.toFixed(1)}%</p>
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Failure Types</h4>
            <div className="space-y-1 text-sm">
              <p>Timeouts: {liveData.failures.failure_types.timeout}</p>
              <p>Network: {liveData.failures.failure_types.network}</p>
              <p>Auth: {liveData.failures.failure_types.authentication}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Failure Patterns */}
      {liveData.failures.failure_patterns.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Failure Patterns</h3>
          <div className="space-y-2">
            {liveData.failures.failure_patterns.map((pattern, index) => (
              <div key={index} className="flex items-center justify-between bg-red-50 px-4 py-2 rounded-md">
                <span className="text-sm text-red-800">{pattern}</span>
                <span className="text-xs text-red-600">Pattern #{index + 1}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Optimization Metrics */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Optimization Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <h4 className="font-medium text-gray-700 mb-2">Policy Updates</h4>
            <p className="text-2xl font-bold text-blue-600">{liveData.analytics.optimization_metrics.policy_updates}</p>
          </div>
          <div className="text-center">
            <h4 className="font-medium text-gray-700 mb-2">Learning Rate</h4>
            <p className="text-2xl font-bold text-green-600">{liveData.analytics.optimization_metrics.learning_rate}</p>
          </div>
          <div className="text-center">
            <h4 className="font-medium text-gray-700 mb-2">Reward Improvement</h4>
            <p className="text-2xl font-bold text-purple-600">+{liveData.analytics.optimization_metrics.reward_improvement.toFixed(1)}%</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealTimeTestingView;