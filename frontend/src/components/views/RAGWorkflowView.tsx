import React, { useState, useEffect } from 'react';

interface RAGStats {
  workflow_stats: {
    total_queries: number;
    successful_retrievals: number;
    failed_retrievals: number;
    average_retrieval_time: number;
    knowledge_base_size: number;
  };
  knowledge_base_stats: {
    total_entries: number;
    unique_endpoints: number;
    recent_entries: number;
  };
  embedding_model: string;
  embedding_dimension: number;
  system_status: string;
}

interface RAGQueryResult {
  status: string;
  query: string;
  answer?: string;
  retrieved_chunks: number;
  reranked_chunks: number;
  context_length: number;
  processing_time_seconds: number;
  sources: Array<{
    file: string;
    type: string;
    score: number;
    chunk_id: string;
  }>;
}

const RAGWorkflowView: React.FC = () => {
  const [ragStats, setRagStats] = useState<RAGStats | null>(null);
  const [query, setQuery] = useState('');
  const [queryResult, setQueryResult] = useState<RAGQueryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [ingestionPath, setIngestionPath] = useState('');
  const [ingestionLoading, setIngestionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('query');

  useEffect(() => {
    fetchRAGStats();
  }, []);

  const fetchRAGStats = async () => {
    try {
      const response = await fetch('/api/workflow/rag/stats');
      const data = await response.json();
      setRagStats(data);
    } catch (error) {
      console.error('Error fetching RAG stats:', error);
    }
  };

  const initializeRAG = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/workflow/rag/initialize', {
        method: 'POST',
      });
      const result = await response.json();
      console.log('RAG initialized:', result);
      await fetchRAGStats();
    } catch (error) {
      console.error('Error initializing RAG:', error);
    } finally {
      setLoading(false);
    }
  };

  const queryRAG = async () => {
    if (!query.trim()) return;

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('query', query);
      formData.append('max_results', '5');
      formData.append('include_ranking_details', 'true');

      const response = await fetch('/api/workflow/rag/query', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      setQueryResult(result);
    } catch (error) {
      console.error('Error querying RAG:', error);
    } finally {
      setLoading(false);
    }
  };

  const ingestMernApp = async () => {
    if (!ingestionPath.trim()) return;

    try {
      setIngestionLoading(true);
      const formData = new FormData();
      formData.append('mern_app_path', ingestionPath);

      const response = await fetch('/api/workflow/rag/ingest-mern-app', {
        method: 'POST',
        body: formData,
      });
      const result = await response.json();
      console.log('Ingestion result:', result);
      await fetchRAGStats();
    } catch (error) {
      console.error('Error ingesting MERN app:', error);
    } finally {
      setIngestionLoading(false);
    }
  };

  const renderWorkflowDiagram = () => (
    <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
      <h3 className="text-lg font-semibold mb-4">RAG Workflow Architecture</h3>
      <div className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
        <div className="flex flex-col items-center space-y-2">
          <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center">
            <span className="text-blue-600 font-semibold">Query</span>
          </div>
          <span className="text-sm text-gray-600">User Question</span>
        </div>
        
        <div className="flex-1 mx-4 border-t-2 border-dashed border-gray-300 relative">
          <div className="absolute -top-2 right-1/2 transform translate-x-1/2">
            <span className="text-xs text-gray-500">→</span>
          </div>
        </div>

        <div className="flex flex-col items-center space-y-2">
          <div className="w-16 h-16 bg-purple-100 rounded-lg flex items-center justify-center">
            <span className="text-purple-600 font-semibold">Embed</span>
          </div>
          <span className="text-sm text-gray-600">Vector Embeddings</span>
        </div>

        <div className="flex-1 mx-4 border-t-2 border-dashed border-gray-300"></div>

        <div className="flex flex-col items-center space-y-2">
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
            <span className="text-gray-600 font-semibold">VectorDB</span>
          </div>
          <span className="text-sm text-gray-600">ChromaDB</span>
        </div>

        <div className="flex-1 mx-4 border-t-2 border-dashed border-gray-300"></div>

        <div className="flex flex-col items-center space-y-2">
          <div className="w-16 h-16 bg-yellow-100 rounded-lg flex items-center justify-center">
            <span className="text-yellow-600 font-semibold">Top-k</span>
          </div>
          <span className="text-sm text-gray-600">Retrieval</span>
        </div>

        <div className="flex-1 mx-4 border-t-2 border-dashed border-gray-300"></div>

        <div className="flex flex-col items-center space-y-2">
          <div className="w-16 h-16 bg-orange-100 rounded-lg flex items-center justify-center">
            <span className="text-orange-600 font-semibold">Rerank</span>
          </div>
          <span className="text-sm text-gray-600">Re-ranker</span>
        </div>

        <div className="flex-1 mx-4 border-t-2 border-dashed border-gray-300"></div>

        <div className="flex flex-col items-center space-y-2">
          <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center">
            <span className="text-green-600 font-semibold">LLM</span>
          </div>
          <span className="text-sm text-gray-600">Generation</span>
        </div>

        <div className="flex-1 mx-4 border-t-2 border-dashed border-gray-300"></div>

        <div className="flex flex-col items-center space-y-2">
          <div className="w-16 h-16 bg-teal-100 rounded-lg flex items-center justify-center">
            <span className="text-teal-600 font-semibold">Answer</span>
          </div>
          <span className="text-sm text-gray-600">Response</span>
        </div>
      </div>
    </div>
  );

  const renderStatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <h4 className="font-semibold text-gray-700">Knowledge Base</h4>
        <p className="text-2xl font-bold text-blue-600">
          {ragStats?.knowledge_base_stats.total_entries || 0}
        </p>
        <p className="text-sm text-gray-500">Total Entries</p>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow">
        <h4 className="font-semibold text-gray-700">Total Queries</h4>
        <p className="text-2xl font-bold text-green-600">
          {ragStats?.workflow_stats.total_queries || 0}
        </p>
        <p className="text-sm text-gray-500">Processed</p>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow">
        <h4 className="font-semibold text-gray-700">Success Rate</h4>
        <p className="text-2xl font-bold text-purple-600">
          {ragStats?.workflow_stats.total_queries > 0 
            ? Math.round((ragStats?.workflow_stats.successful_retrievals / ragStats?.workflow_stats.total_queries) * 100)
            : 0}%
        </p>
        <p className="text-sm text-gray-500">Successful Retrievals</p>
      </div>
      
      <div className="bg-white p-4 rounded-lg shadow">
        <h4 className="font-semibold text-gray-700">Avg Response Time</h4>
        <p className="text-2xl font-bold text-orange-600">
          {ragStats?.workflow_stats.average_retrieval_time?.toFixed(2) || 0}s
        </p>
        <p className="text-sm text-gray-500">Processing Time</p>
      </div>
    </div>
  );

  const renderQueryInterface = () => (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Query RAG System</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ask a question about your MERN application:
          </label>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            placeholder="e.g., How do I test user authentication endpoints? What are the validation rules for user registration?"
          />
        </div>
        
        <button
          onClick={queryRAG}
          disabled={loading || !query.trim()}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Processing...' : 'Query RAG System'}
        </button>
      </div>

      {queryResult && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold mb-2">Query Result:</h4>
          <div className="space-y-2">
            <p><strong>Status:</strong> {queryResult.status}</p>
            <p><strong>Processing Time:</strong> {queryResult.processing_time_seconds?.toFixed(3)}s</p>
            <p><strong>Retrieved Chunks:</strong> {queryResult.retrieved_chunks}</p>
            <p><strong>Context Length:</strong> {queryResult.context_length}</p>
            
            {queryResult.answer && (
              <div className="bg-white p-3 rounded border-l-4 border-blue-500">
                <p><strong>Answer:</strong></p>
                <p className="mt-1 whitespace-pre-wrap">{queryResult.answer}</p>
              </div>
            )}

            {queryResult.sources && queryResult.sources.length > 0 && (
              <div>
                <p><strong>Sources:</strong></p>
                <ul className="list-disc pl-5 space-y-1">
                  {queryResult.sources.map((source, index) => (
                    <li key={index} className="text-sm">
                      {source.file} ({source.type}) - Score: {source.score}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  const renderIngestionInterface = () => (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Ingest MERN Application</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            MERN Application Path:
          </label>
          <input
            type="text"
            value={ingestionPath}
            onChange={(e) => setIngestionPath(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="e.g., /path/to/mern/application"
          />
        </div>
        
        <button
          onClick={ingestMernApp}
          disabled={ingestionLoading || !ingestionPath.trim()}
          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {ingestionLoading ? 'Ingesting...' : 'Ingest Application'}
        </button>
        
        <div className="text-sm text-gray-600">
          <p><strong>Note:</strong> This will scan your MERN application and add its content to the RAG knowledge base.</p>
          <p>Supported files: .js, .jsx, .ts, .tsx, .py, .json, .md, .txt, .yaml</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">RAG Workflow System</h1>
        <p className="text-gray-600">
          Retrieval Augmented Generation for MERN AI Testing Platform
        </p>
      </div>

      {!ragStats && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                RAG system not initialized. 
                <button 
                  onClick={initializeRAG}
                  className="ml-2 font-medium text-yellow-700 underline hover:text-yellow-600"
                >
                  Initialize now
                </button>
              </p>
            </div>
          </div>
        </div>
      )}

      {renderWorkflowDiagram()}
      
      {ragStats && renderStatsCards()}

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('query')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'query'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Query System
            </button>
            <button
              onClick={() => setActiveTab('ingest')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'ingest'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Ingest Data
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'stats'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              System Status
            </button>
          </nav>
        </div>
      </div>

      <div className="space-y-6">
        {activeTab === 'query' && renderQueryInterface()}
        {activeTab === 'ingest' && renderIngestionInterface()}
        {activeTab === 'stats' && ragStats && (
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-4">System Statistics</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-2">Knowledge Base Stats</h4>
                <ul className="space-y-1 text-sm">
                  <li>Total Entries: {ragStats.knowledge_base_stats.total_entries}</li>
                  <li>Unique Endpoints: {ragStats.knowledge_base_stats.unique_endpoints}</li>
                  <li>Recent Entries (24h): {ragStats.knowledge_base_stats.recent_entries}</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">System Configuration</h4>
                <ul className="space-y-1 text-sm">
                  <li>Embedding Model: {ragStats.embedding_model}</li>
                  <li>Embedding Dimension: {ragStats.embedding_dimension}</li>
                  <li>Status: <span className={`px-2 py-1 rounded text-xs ${
                    ragStats.system_status === 'operational' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>{ragStats.system_status}</span></li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RAGWorkflowView;