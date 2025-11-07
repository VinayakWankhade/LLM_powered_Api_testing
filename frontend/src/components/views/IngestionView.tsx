import React, { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import axios from 'axios';

interface IngestionStats {
  status: string;
  knowledge_base: {
    total_entries: number;
    unique_endpoints: number;
    recent_entries: number;
    collection_created: string;
  };
}

interface IngestionResult {
  message: string;
  processed_specs: number;
  processed_docs: number;
  processed_logs: number;
  analyzed_paths: number;
  chunks_created: number;
  embeddings_generated: number;
  processing_time: number;
}

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444'];

const IngestionView = () => {
  const [stats, setStats] = useState<IngestionStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<IngestionResult | null>(null);
  
  // File upload states
  const [specFiles, setSpecFiles] = useState<FileList | null>(null);
  const [docFiles, setDocFiles] = useState<FileList | null>(null);
  const [logFiles, setLogFiles] = useState<FileList | null>(null);
  const [codebasePaths, setCodebasePaths] = useState<string>('');
  const [usingMockData, setUsingMockData] = useState(false);
  
  const fetchStats = async () => {
    try {
      const response = await axios.get<IngestionStats>('/ingest/status');
      setStats(response.data);
      setUsingMockData(false);
    } catch (err) {
      console.error('Backend not available, using mock data:', err);
      // Use mock data when backend is not available
      setStats(getMockIngestionStats());
      setUsingMockData(true);
    }
  };

  const getMockIngestionStats = (): IngestionStats => ({
    status: 'active',
    knowledge_base: {
      total_entries: 247,
      unique_endpoints: 12,
      recent_entries: 42,
      collection_created: new Date().toISOString()
    }
  });

  const handleBatchIngest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      
      // Add spec files
      if (specFiles) {
        Array.from(specFiles).forEach(file => {
          formData.append('specs', file);
        });
      }
      
      // Add doc files
      if (docFiles) {
        Array.from(docFiles).forEach(file => {
          formData.append('docs', file);
        });
      }
      
      // Add log files
      if (logFiles) {
        Array.from(logFiles).forEach(file => {
          formData.append('logs', file);
        });
      }
      
      // Add codebase paths
      if (codebasePaths.trim()) {
        formData.append('codebase_paths', codebasePaths);
      }
      
      const response = await axios.post<IngestionResult>('/ingest/batch', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setResult(response.data);
      
      // Reset form
      setSpecFiles(null);
      setDocFiles(null);
      setLogFiles(null);
      setCodebasePaths('');
      
      // Refresh stats
      fetchStats();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to process ingestion');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSpecIngest = async (files: FileList) => {
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      Array.from(files).forEach(file => {
        formData.append('files', file);
      });
      
      const response = await axios.post<IngestionResult>('/ingest/specs', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setResult(response.data);
      fetchStats();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to ingest specifications');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCodebaseIngest = async (paths: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('paths', paths);
      
      const response = await axios.post<IngestionResult>('/ingest/codebase', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setResult(response.data);
      fetchStats();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to analyze codebase');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Load stats on component mount
  React.useEffect(() => {
    fetchStats();
  }, []);

  const statsChartData = stats ? [
    { name: 'Total Entries', value: stats.knowledge_base.total_entries, color: COLORS[0] },
    { name: 'Recent Entries', value: stats.knowledge_base.recent_entries, color: COLORS[1] },
    { name: 'Unique Endpoints', value: stats.knowledge_base.unique_endpoints, color: COLORS[2] },
  ] : [];

  const resultChartData = result ? [
    { name: 'Specs', value: result.processed_specs },
    { name: 'Docs', value: result.processed_docs },
    { name: 'Logs', value: result.processed_logs },
    { name: 'Paths', value: result.analyzed_paths },
  ] : [];

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
                <strong>Demo Mode:</strong> Backend is not available. Displaying sample data to demonstrate the interface. File uploads will not work.
              </p>
            </div>
          </div>
        </div>
      )}
      {/* Knowledge Base Status */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800">Total Entries</h3>
            <p className="text-3xl font-bold text-blue-600 mt-2">
              {stats.knowledge_base.total_entries.toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800">Recent Entries</h3>
            <p className="text-3xl font-bold text-green-600 mt-2">
              {stats.knowledge_base.recent_entries.toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800">Unique Endpoints</h3>
            <p className="text-3xl font-bold text-purple-600 mt-2">
              {stats.knowledge_base.unique_endpoints}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold text-gray-800">Status</h3>
            <p className="text-3xl font-bold text-orange-600 mt-2">
              {stats.status}
            </p>
          </div>
        </div>
      )}

      {/* Batch Ingestion Form */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Batch Data Ingestion</h3>
        <form onSubmit={handleBatchIngest} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                API Specifications (OpenAPI/Swagger)
              </label>
              <input
                type="file"
                multiple
                accept=".yaml,.yml,.json"
                onChange={(e) => setSpecFiles(e.target.files)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: .yaml, .yml, .json
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Documentation Files
              </label>
              <input
                type="file"
                multiple
                accept=".md,.html,.txt"
                onChange={(e) => setDocFiles(e.target.files)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: .md, .html, .txt
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Log Files
              </label>
              <input
                type="file"
                multiple
                accept=".log,.txt"
                onChange={(e) => setLogFiles(e.target.files)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Supported formats: .log, .txt
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Codebase Paths (Optional)
              </label>
              <input
                type="text"
                value={codebasePaths}
                onChange={(e) => setCodebasePaths(e.target.value)}
                placeholder="/path/to/code1,/path/to/code2"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                Comma-separated paths to analyze
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Start Batch Ingestion'}
            </button>
            
            <button
              type="button"
              onClick={fetchStats}
              className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors duration-200"
            >
              Refresh Stats
            </button>
          </div>
        </form>

        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-md">
            {error}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h4 className="font-semibold mb-3">Quick Spec Upload</h4>
          <input
            type="file"
            multiple
            accept=".yaml,.yml,.json"
            onChange={(e) => e.target.files && handleSpecIngest(e.target.files)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
          />
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h4 className="font-semibold mb-3">Quick Codebase Analysis</h4>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="/path/to/code"
              onChange={(e) => setCodebasePaths(e.target.value)}
              className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm"
            />
            <button
              onClick={() => handleCodebaseIngest(codebasePaths)}
              disabled={!codebasePaths.trim() || loading}
              className="px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm disabled:opacity-50"
            >
              Analyze
            </button>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h4 className="font-semibold mb-3">Knowledge Base Info</h4>
          {stats && (
            <div className="text-sm space-y-1">
              <p>Created: {new Date(stats.knowledge_base.collection_created).toLocaleDateString()}</p>
              <p>Status: <span className="font-medium text-green-600">{stats.status}</span></p>
            </div>
          )}
        </div>
      </div>

      {/* Charts */}
      {(stats || result) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stats && (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Knowledge Base Overview</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statsChartData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {statsChartData.map((entry, index) => (
                        <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
          
          {result && (
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Last Ingestion Results</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={resultChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#6366F1" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ingestion Results */}
      {result && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Ingestion Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Processed Files</h4>
              <div className="space-y-1 text-sm">
                <p>Specifications: {result.processed_specs}</p>
                <p>Documents: {result.processed_docs}</p>
                <p>Logs: {result.processed_logs}</p>
                <p>Code Paths: {result.analyzed_paths}</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Generated Content</h4>
              <div className="space-y-1 text-sm">
                <p>Chunks Created: {result.chunks_created?.toLocaleString() || 'N/A'}</p>
                <p>Embeddings: {result.embeddings_generated?.toLocaleString() || 'N/A'}</p>
                <p>Processing Time: {result.processing_time?.toFixed(2) || 'N/A'}s</p>
              </div>
            </div>
            <div>
              <h4 className="font-medium text-gray-700 mb-2">Status</h4>
              <div className="space-y-1 text-sm">
                <p className="text-green-600 font-medium">{result.message}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IngestionView;