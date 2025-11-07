import { useEffect, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import axios from 'axios';

interface FailureData {
  failure_patterns: Array<{
    pattern_id: string;
    error_type: string;
    frequency: number;
    affected_endpoints: string[];
    affected_methods: string[];
    probable_cause: string;
    error_messages?: string[];
  }>;
  failure_trends: Record<string, number>;
  failure_types: Record<string, number>;
  retry_success_rate: number;
}

const COLORS = ['#EF4444', '#F59E0B', '#10B981', '#6366F1', '#8B5CF6'];

const FailuresView = () => {
  const [data, setData] = useState<FailureData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('7d');
  const [selectedPattern, setSelectedPattern] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get<FailureData>('/api/dashboard/failures', {
        params: { timeRange, pattern: selectedPattern },
      });
      setData(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch failure data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-600 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 bg-red-50 text-red-600 rounded-md">
        {error || 'No data available'}
      </div>
    );
  }

  const trendData = Object.entries(data.failure_trends).map(
    ([date, failures]) => ({
      date,
      failures: Array.isArray(failures) ? failures.reduce((a, b) => a + b, 0) : failures,
    })
  );

  const typeData = Object.entries(data.failure_types).map(
    ([type, count]) => ({
      type,
      count,
    })
  );

  // Derive a severity label from frequency (since backend doesn't provide one)
  const getSeverity = (p: FailureData['failure_patterns'][number]) => {
    if (p.frequency >= 10) return 'high';
    if (p.frequency >= 5) return 'medium';
    return 'low';
  };

  return (
    <div className="space-y-6">
      {/* Time Range Filter */}
      <div className="flex justify-end space-x-2">
        {['24h', '7d', '30d'].map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-3 py-1 rounded-md text-sm ${
              timeRange === range
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {range}
          </button>
        ))}
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800">Total Failures</h3>
          <p className="text-3xl font-bold text-red-600 mt-2">
            {Object.values(data.failure_types).reduce((a, b) => a + b, 0)}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800">
            Retry Success Rate
          </h3>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {(data.retry_success_rate * 100).toFixed(1)}%
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800">
            Unique Failure Patterns
          </h3>
          <p className="text-3xl font-bold text-indigo-600 mt-2">
            {data.failure_patterns.length}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Failure Trends</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="failures"
                  stroke="#EF4444"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Failure Types</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeData}
                  dataKey="count"
                  nameKey="type"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {typeData.map((entry) => (
                    <Cell
                      key={entry.type}
                      fill={COLORS[typeData.findIndex(t => t.type === entry.type) % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Failure Patterns */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Failure Patterns</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pattern
                </th>
                <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Frequency
                </th>
                <th className="px-6 py-3 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity
                </th>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Affected Endpoints
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.failure_patterns.map((pattern) => {
                const severity = getSeverity(pattern);
                return (
                  <tr
                    key={pattern.pattern_id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setSelectedPattern(pattern.pattern_id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {pattern.probable_cause || pattern.error_messages?.[0] || pattern.error_type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                      {pattern.frequency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {(() => {
                        const getSeverityClass = (sev: string) => {
                          switch (sev) {
                            case 'high': return 'bg-red-100 text-red-800';
                            case 'medium': return 'bg-yellow-100 text-yellow-800';
                            default: return 'bg-green-100 text-green-800';
                          }
                        };

                        return (
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getSeverityClass(severity)}`}
                          >
                            {severity}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {pattern.affected_endpoints.join(', ')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FailuresView;