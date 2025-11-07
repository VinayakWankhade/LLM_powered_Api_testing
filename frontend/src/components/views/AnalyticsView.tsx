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

interface AnalyticsData {
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
}

const AnalyticsView = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get<AnalyticsData>('/api/dashboard/analytics');
      setData(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch analytics data. Make sure the backend is running.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="space-y-6">
        <div className="p-4 bg-red-50 text-red-600 rounded-md">
          {error || 'No data available'}
          <div className="mt-2">
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Transform data for charts - generate day labels
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const executionTrendData = data.execution_trends.daily_executions.map((executions, i) => ({
    day: days[i] || `Day ${i + 1}`,
    executions: executions,
    successRate: (data.execution_trends.success_rate[i] || 0) * 100,
  }));

  return (
    <div className="space-y-6">
      {/* Data Source Info */}
      <div className="bg-green-50 border border-green-200 rounded-md p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-green-400">✅</span>
          </div>
          <div className="ml-3">
            <p className="text-sm text-green-700">
              <strong>Live Data:</strong> Connected to backend. Data source: {data.data_source}
            </p>
            <p className="text-xs text-green-600 mt-1">
              Last updated: {new Date(data.calculation_timestamp).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800">
            Policy Updates
          </h3>
          <p className="text-3xl font-bold text-indigo-600 mt-2">
            {data.optimization_metrics.policy_updates}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800">Learning Rate</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {data.optimization_metrics.learning_rate.toFixed(4)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800">
            Reward Improvement
          </h3>
          <p className="text-3xl font-bold text-green-600 mt-2">
            +{data.optimization_metrics.reward_improvement.toFixed(2)}%
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800">
            Success Rate
          </h3>
          <p className="text-3xl font-bold text-purple-600 mt-2">
            {(data.performance_metrics.execution_success_rate * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Execution Trends</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={executionTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" unit="%" />
                <Tooltip />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="executions"
                  stroke="#6366F1"
                  strokeWidth={2}
                  name="Executions"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="successRate"
                  stroke="#10B981"
                  strokeWidth={2}
                  name="Success Rate (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Resource Utilization</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { metric: 'CPU', usage: data.resource_utilization.cpu_usage },
                { metric: 'Memory', usage: data.resource_utilization.memory_usage },
                { metric: 'Disk I/O', usage: data.resource_utilization.disk_io }
              ]}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="metric" />
                <YAxis unit="%" />
                <Tooltip />
                <Bar dataKey="usage" fill="#8B5CF6" />
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
            <p className="text-sm text-gray-500">Average Response Time</p>
            <p className="text-2xl font-semibold mt-1">
              {data.performance_metrics.avg_response_time.toFixed(0)}ms
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">P95 Response Time</p>
            <p className="text-2xl font-semibold mt-1">
              {data.performance_metrics.p95_response_time.toFixed(0)}ms
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Execution Success Rate</p>
            <p className="text-2xl font-semibold mt-1">
              {(data.performance_metrics.execution_success_rate * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Debug Information */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-700 mb-2">Debug Information</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p>Data Source: {data.data_source}</p>
          <p>Calculation Time: {data.calculation_timestamp}</p>
          <p>Backend Status: Connected ✅</p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsView;