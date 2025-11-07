import { useState } from 'react';
import {
  BarChart,
  Bar,
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

interface TestCase {
  test_id: string;
  type: string;
  description: string;
  endpoint: string;
  method: string;
  input_data: Record<string, any>;
  expected_output: Record<string, any>;
  tags: string[];
}

interface GenerationRequest {
  endpoint: string;
  method: string;
  parameters: Record<string, any>;
  context_query?: string;
  top_k: number;
}

interface GenerationResponse {
  total: number;
  tests: TestCase[];
  metadata: {
    generation_stats: {
      raw_generated: number;
      validated: number;
      final_optimized: number;
    };
    validation_summary: Record<string, any>;
    coverage_analysis: Record<string, any>;
    quality_analysis: Record<string, any>;
    recommendations: string[];
    context_used: number;
    optimizer_coverage: Record<string, any>;
  };
}

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const TestGenerationView = () => {
  console.log('TestGenerationView component is rendering');
  const [generationForm, setGenerationForm] = useState<GenerationRequest>({
    endpoint: '',
    method: 'GET',
    parameters: {},
    context_query: '',
    top_k: 6,
  });
  const [parameterInput, setParameterInput] = useState({ key: '', value: '' });
  const [generatedTests, setGeneratedTests] = useState<GenerationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addParameter = () => {
    if (parameterInput.key && parameterInput.value) {
      setGenerationForm({
        ...generationForm,
        parameters: {
          ...generationForm.parameters,
          [parameterInput.key]: parameterInput.value,
        },
      });
      setParameterInput({ key: '', value: '' });
    }
  };

  const removeParameter = (key: string) => {
    const newParameters = { ...generationForm.parameters };
    delete newParameters[key];
    setGenerationForm({ ...generationForm, parameters: newParameters });
  };

  const generateTests = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post<GenerationResponse>('/generate/tests', generationForm);
      setGeneratedTests(response.data);
    } catch (err) {
      setError('Failed to generate tests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const executeTests = async () => {
    if (!generatedTests) return;
    
    try {
      setLoading(true);
      const executeRequest = {
        tests: generatedTests.tests,
        max_parallel: 10,
        retry_attempts: 3,
        optimize: true,
      };
      
      const response = await axios.post('/execute/run', executeRequest);
      console.log('Tests executed:', response.data);
      // You could add a success message or redirect here
    } catch (err) {
      setError('Failed to execute tests');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Transform data for charts
  const testTypeData = generatedTests?.tests.reduce((acc, test) => {
    acc[test.type] = (acc[test.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const typeChartData = Object.entries(testTypeData || {}).map(([type, count]) => ({
    type,
    count,
  }));

  const generationStatsData = generatedTests?.metadata.generation_stats
    ? [
        { name: 'Raw Generated', value: generatedTests.metadata.generation_stats.raw_generated },
        { name: 'Validated', value: generatedTests.metadata.generation_stats.validated },
        { name: 'Final Optimized', value: generatedTests.metadata.generation_stats.final_optimized },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Test Generation Form */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Generate Test Cases</h3>
        <form onSubmit={generateTests} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Endpoint
              </label>
              <input
                type="text"
                value={generationForm.endpoint}
                onChange={(e) => setGenerationForm({ ...generationForm, endpoint: e.target.value })}
                placeholder="/api/users"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                HTTP Method
              </label>
              <select
                value={generationForm.method}
                onChange={(e) => setGenerationForm({ ...generationForm, method: e.target.value })}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
                <option value="PATCH">PATCH</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Context Query (Optional)
            </label>
            <input
              type="text"
              value={generationForm.context_query || ''}
              onChange={(e) => setGenerationForm({ ...generationForm, context_query: e.target.value })}
              placeholder="user authentication validation"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Top K Context Documents
            </label>
            <input
              type="number"
              value={generationForm.top_k}
              onChange={(e) => setGenerationForm({ ...generationForm, top_k: parseInt(e.target.value) })}
              min="1"
              max="20"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Parameters Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Parameters
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={parameterInput.key}
                  onChange={(e) => setParameterInput({ ...parameterInput, key: e.target.value })}
                  placeholder="Parameter name"
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  value={parameterInput.value}
                  onChange={(e) => setParameterInput({ ...parameterInput, value: e.target.value })}
                  placeholder="Parameter type (e.g., string, number)"
                  className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={addParameter}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200"
                >
                  Add
                </button>
              </div>
              
              {/* Display current parameters */}
              <div className="space-y-1">
                {Object.entries(generationForm.parameters).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-md">
                    <span className="text-sm">
                      <strong>{key}:</strong> {value}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeParameter(key)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200 disabled:opacity-50"
            >
              {loading ? 'Generating...' : 'Generate Tests'}
            </button>
            
            {generatedTests && (
              <button
                type="button"
                onClick={executeTests}
                disabled={loading}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
              >
                Execute Tests
              </button>
            )}
          </div>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-md">
            {error}
          </div>
        )}
      </div>

      {/* Generation Results */}
      {generatedTests && (
        <>
          {/* Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800">Total Generated</h3>
              <p className="text-3xl font-bold text-indigo-600 mt-2">
                {generatedTests.total}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800">Validated</h3>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {generatedTests.metadata.generation_stats.validated}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800">Context Used</h3>
              <p className="text-3xl font-bold text-purple-600 mt-2">
                {generatedTests.metadata.context_used}
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800">Recommendations</h3>
              <p className="text-3xl font-bold text-orange-600 mt-2">
                {generatedTests.metadata.recommendations.length}
              </p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Test Types Distribution</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={typeChartData}
                      dataKey="count"
                      nameKey="type"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {typeChartData.map((entry, index) => (
                        <Cell key={entry.type} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Generation Pipeline</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={generationStatsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#6366F1" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Generated Tests Table */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Generated Test Cases</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Test ID
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tags
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {generatedTests.tests.map((test) => (
                    <tr key={test.test_id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {test.test_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          test.type === 'functional' ? 'bg-blue-100 text-blue-800' :
                          test.type === 'security' ? 'bg-red-100 text-red-800' :
                          test.type === 'performance' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {test.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {test.description}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span className="font-medium">{test.method}</span> {test.endpoint}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {test.tags.join(', ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recommendations */}
          {generatedTests.metadata.recommendations.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
              <ul className="space-y-2">
                {generatedTests.metadata.recommendations.map((recommendation, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-indigo-600 mr-2">•</span>
                    <span className="text-gray-700">{recommendation}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TestGenerationView;