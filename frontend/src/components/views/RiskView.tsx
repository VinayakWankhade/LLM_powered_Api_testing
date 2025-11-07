import { useEffect, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';
import axios from 'axios';

interface RiskData {
  recommendations: Array<{
    endpoint: string;
    type: string;
    severity: string;
    description: string;
    action: string;
    risk_score: number;
    confidence: number;
  }>;
  risk_trends: Array<{
    date: string;
    high_risk: number;
    medium_risk: number;
    low_risk: number;
  }>;
  high_risk_endpoints: Array<{
    endpoint: string;
    risk_score: number;
  }>;
}

const RiskView = () => {
  const [data, setData] = useState<RiskData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await axios.get<RiskData>('/api/dashboard/risk');
      setData(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch risk data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow-600 border-t-transparent"></div>
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

  // Transform data for visualization
  const riskScatterData = data.high_risk_endpoints.map((endpoint) => ({
    x: endpoint.risk_score,
    y: Math.random(), // For visual spread
    z: 1,
    name: endpoint.endpoint,
  }));

  return (
    <div className="space-y-6">
      {/* Risk Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Risk Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  type="number"
                  dataKey="x"
                  name="Risk Score"
                  unit="%"
                  domain={[0, 1]}
                />
                <YAxis type="number" dataKey="y" hide />
                <ZAxis type="number" dataKey="z" range={[100, 100]} />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  content={(props: any) => {
                    if (!props.payload?.length) return null;
                    const data = props.payload[0].payload;
                    return (
                      <div className="bg-white p-2 shadow rounded border">
                        <p className="font-medium">{data.name}</p>
                        <p className="text-sm text-gray-600">
                          Risk: {(data.x * 100).toFixed(1)}%
                        </p>
                      </div>
                    );
                  }}
                />
                <Scatter
                  data={riskScatterData}
                  fill="#F59E0B"
                />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Risk Trends</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.risk_trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="high_risk"
                  stackId="a"
                  fill="#EF4444"
                  name="High Risk"
                />
                <Bar
                  dataKey="medium_risk"
                  stackId="a"
                  fill="#F59E0B"
                  name="Medium Risk"
                />
                <Bar
                  dataKey="low_risk"
                  stackId="a"
                  fill="#10B981"
                  name="Low Risk"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Risk Recommendations</h3>
        <div className="space-y-4">
          {data.recommendations.map((rec) => {
            const getBorderColor = (severity: string) => {
              switch (severity) {
                case 'high': return '#EF4444';
                case 'medium': return '#F59E0B';
                default: return '#10B981';
              }
            };

            const getSeverityClass = (severity: string) => {
              switch (severity) {
                case 'high': return 'bg-red-100 text-red-800';
                case 'medium': return 'bg-yellow-100 text-yellow-800';
                default: return 'bg-green-100 text-green-800';
              }
            };

            return (
              <div
                key={`${rec.endpoint}-${rec.type}`}
                className="border-l-4 p-4 bg-gray-50 rounded-r-md"
                style={{ borderColor: getBorderColor(rec.severity) }}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">{rec.endpoint}</h4>
                    <p className="text-gray-600 mt-1">{rec.description}</p>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${getSeverityClass(rec.severity)}`}
                  >
                    {rec.severity}
                  </span>
                </div>
                <div className="mt-3">
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Recommended Action: </span>
                    {rec.action}
                  </p>
                  <div className="flex items-center mt-2 text-sm text-gray-500">
                    <span className="mr-4">
                      Risk Score: {(rec.risk_score * 100).toFixed(1)}%
                    </span>
                    <span>
                      Confidence: {(rec.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RiskView;