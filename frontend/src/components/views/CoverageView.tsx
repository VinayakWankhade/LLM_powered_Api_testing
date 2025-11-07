import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import axios from 'axios';

interface CoverageData {
  endpoint_coverage: Record<string, number>;
  parameter_coverage: Record<string, number>;
  coverage_trends: Record<string, number[]>;
  coverage_gaps: Record<string, string[]>;
}

const CoverageView = () => {
  const [data, setData] = useState<CoverageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get<CoverageData>('/api/dashboard/coverage');
      setData(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch coverage data');
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
      <div className="p-4 bg-red-50 text-red-600 rounded-md">
        {error || 'No data available'}
      </div>
    );
  }

  const endpointCoverageData = Object.entries(data.endpoint_coverage || {}).map(
    ([endpoint, coverage]) => ({
      endpoint,
      coverage: coverage * 100,
    })
  );

  // The backend returns coverage_trends as a dictionary of metric -> number[].
  // Use the endpoint_coverage series and index as pseudo "dates".
  const trendArray = data.coverage_trends?.endpoint_coverage || [];
  const trendData = trendArray.map((v, i) => ({
    date: `Day ${i + 1}`,
    coverage: v * 100,
  }));

  return (
    <div className="space-y-6">
      {/* Coverage Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Endpoint Coverage</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={endpointCoverageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="endpoint" />
                <YAxis unit="%" />
                <Tooltip />
                <Bar
                  dataKey="coverage"
                  fill="#6366f1"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Coverage Trends</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis unit="%" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="coverage"
                  stroke="#6366f1"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Coverage Gaps */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Coverage Gaps</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(data.coverage_gaps || {}).map(([endpoint, gaps]) => (
            <div
              key={endpoint}
              className="p-4 border border-gray-200 rounded-md"
            >
              <h4 className="font-medium text-gray-700 mb-2">{endpoint}</h4>
              <ul className="list-disc list-inside space-y-1">
                {gaps.map((gap) => (
                  <li key={`${endpoint}-${gap}`} className="text-sm text-gray-600">
                    {gap}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Parameter Coverage */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Parameter Coverage</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Endpoint
                </th>
                <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Coverage
                </th>
                <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Object.entries(data.parameter_coverage || {}).map(
                ([endpoint, coverage]) => (
                  <tr key={endpoint}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {endpoint}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm text-gray-500">
                      {(coverage * 100).toFixed(1)}%
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      {(() => {
                        const getCoverageStatusClass = (value: number) => {
                          if (value >= 0.9) return 'bg-green-100 text-green-800';
                          if (value >= 0.7) return 'bg-yellow-100 text-yellow-800';
                          return 'bg-red-100 text-red-800';
                        };

                        const getCoverageStatusText = (value: number) => {
                          if (value >= 0.9) return 'Good';
                          if (value >= 0.7) return 'Warning';
                          return 'Critical';
                        };

                        return (
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getCoverageStatusClass(coverage)}`}
                          >
                            {getCoverageStatusText(coverage)}
                          </span>
                        );
                      })()}
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CoverageView;