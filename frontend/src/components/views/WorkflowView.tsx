// import React, { useState, useEffect } from 'react';
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
//   BarChart,
//   Bar,
//   PieChart,
//   Pie,
//   Cell,
// } from 'recharts';
// import axios from 'axios';

// interface WorkflowConfig {
//   mern_app_path: string;
//   target_api_url?: string;
//   target_api_running: boolean;
//   max_test_cases: number;
//   enable_self_healing: boolean;
//   enable_rl_optimization: boolean;
//   test_execution_timeout: number;
//   coverage_threshold: number;
//   generate_final_report: boolean;
// }

// interface WorkflowResult {
//   workflow_id: string;
//   status: string;
//   execution_time: number;
//   success_rate: number;
//   executive_summary: {
//     endpoints_discovered: number;
//     components_discovered: number;
//     tests_generated: number;
//     coverage_achieved: number;
//     recommendations_count: number;
//   };
//   detailed_results: {
//     scan_results: any;
//     execution_results: any;
//     coverage_analysis: any;
//     recommendations: string[];
//     final_report: any;
//   };
// }

// interface WorkflowTemplate {
//   name: string;
//   description: string;
//   config: Partial<WorkflowConfig>;
// }

// const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

// const WorkflowView = () => {
//   const [config, setConfig] = useState<WorkflowConfig>({
//     mern_app_path: '',
//     target_api_running: false,
//     max_test_cases: 50,
//     enable_self_healing: true,
//     enable_rl_optimization: true,
//     test_execution_timeout: 300,
//     coverage_threshold: 0.8,
//     generate_final_report: true,
//   });

//   const [result, setResult] = useState<WorkflowResult | null>(null);
//   const [templates, setTemplates] = useState<Record<string, WorkflowTemplate>>({});
//   const [activeWorkflows, setActiveWorkflows] = useState<any[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [selectedTemplate, setSelectedTemplate] = useState<string>('');
//   const [showAdvanced, setShowAdvanced] = useState(false);

//   useEffect(() => {
//     fetchTemplates();
//     fetchActiveWorkflows();
//   }, []);

//   const fetchTemplates = async () => {
//     try {
//       const response = await axios.get('/api/workflow/workflow-templates');
//       setTemplates(response.data.templates);
//     } catch (err) {
//       console.error('Failed to fetch workflow templates:', err);
//     }
//   };

//   const fetchActiveWorkflows = async () => {
//     try {
//       const response = await axios.get('/api/workflow/active-workflows');
//       setActiveWorkflows(response.data.workflows);
//     } catch (err) {
//       console.error('Failed to fetch active workflows:', err);
//     }
//   };

//   const applyTemplate = (templateKey: string) => {
//     const template = templates[templateKey];
//     if (template) {
//       setConfig(prev => ({ ...prev, ...template.config }));
//       setSelectedTemplate(templateKey);
//     }
//   };

//   const executeWorkflow = async () => {
//     if (!config.mern_app_path) {
//       setError('Please provide a MERN application path');
//       return;
//     }

//     setLoading(true);
//     setError(null);
//     setResult(null);

//     try {
//       const formData = new FormData();
//       formData.append('mern_app_path', config.mern_app_path);
//       if (config.target_api_url) {
//         formData.append('target_api_url', config.target_api_url);
//       }
//       formData.append('target_api_running', config.target_api_running.toString());
//       formData.append('max_test_cases', config.max_test_cases.toString());
//       formData.append('enable_self_healing', config.enable_self_healing.toString());
//       formData.append('enable_rl_optimization', config.enable_rl_optimization.toString());
//       formData.append('test_execution_timeout', config.test_execution_timeout.toString());
//       formData.append('coverage_threshold', config.coverage_threshold.toString());
//       formData.append('generate_final_report', config.generate_final_report.toString());

//       const response = await axios.post('/api/workflow/execute-complete', formData, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//         timeout: 600000, // 10 minutes
//       });

//       setResult(response.data);
//       fetchActiveWorkflows();
//     } catch (err: any) {
//       setError(err.response?.data?.detail || err.message || 'Workflow execution failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const scanOnly = async () => {
//     if (!config.mern_app_path) {
//       setError('Please provide a MERN application path');
//       return;
//     }

//     setLoading(true);
//     setError(null);

//     try {
//       const formData = new FormData();
//       formData.append('mern_app_path', config.mern_app_path);
//       if (config.target_api_url) {
//         formData.append('target_api_url', config.target_api_url);
//       }
//       formData.append('target_api_running', config.target_api_running.toString());

//       const response = await axios.post('/api/workflow/mern-scan-only', formData, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       });

//       // Convert scan-only result to workflow result format for display
//       setResult({
//         workflow_id: 'scan_only',
//         status: 'scan_completed',
//         execution_time: 0,
//         success_rate: 0,
//         executive_summary: {
//           endpoints_discovered: response.data.summary.endpoints_discovered,
//           components_discovered: response.data.summary.components_discovered,
//           tests_generated: 0,
//           coverage_achieved: 0,
//           recommendations_count: response.data.summary.recommendations.length,
//         },
//         detailed_results: {
//           scan_results: response.data.scan_results,
//           execution_results: {},
//           coverage_analysis: {},
//           recommendations: response.data.summary.recommendations,
//           final_report: {},
//         },
//       });
//     } catch (err: any) {
//       setError(err.response?.data?.detail || err.message || 'Scan failed');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const renderExecutiveSummary = () => {
//     if (!result) return null;

//     const summaryData = [
//       { name: 'Endpoints', value: result.executive_summary.endpoints_discovered, color: COLORS[0] },
//       { name: 'Components', value: result.executive_summary.components_discovered, color: COLORS[1] },
//       { name: 'Tests Generated', value: result.executive_summary.tests_generated, color: COLORS[2] },
//       { name: 'Recommendations', value: result.executive_summary.recommendations_count, color: COLORS[3] },
//     ];

//     return (
//       <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
//         <h3 className="text-xl font-semibold mb-4">Executive Summary</h3>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div>
//             <div className="grid grid-cols-2 gap-4 mb-4">
//               <div className="text-center">
//                 <div className="text-2xl font-bold text-blue-600">
//                   {result.executive_summary.endpoints_discovered}
//                 </div>
//                 <div className="text-sm text-gray-600">Endpoints Discovered</div>
//               </div>
//               <div className="text-center">
//                 <div className="text-2xl font-bold text-green-600">
//                   {result.executive_summary.tests_generated}
//                 </div>
//                 <div className="text-sm text-gray-600">Tests Generated</div>
//               </div>
//               <div className="text-center">
//                 <div className="text-2xl font-bold text-purple-600">
//                   {(result.executive_summary.coverage_achieved * 100).toFixed(1)}%
//                 </div>
//                 <div className="text-sm text-gray-600">Coverage Achieved</div>
//               </div>
//               <div className="text-center">
//                 <div className="text-2xl font-bold text-orange-600">
//                   {result.success_rate ? (result.success_rate * 100).toFixed(1) : 0}%
//                 </div>
//                 <div className="text-sm text-gray-600">Success Rate</div>
//               </div>
//             </div>
//           </div>
//           <div className="h-64">
//             <ResponsiveContainer width="100%" height="100%">
//               <PieChart>
//                 <Pie
//                   data={summaryData.filter(d => d.value > 0)}
//                   dataKey="value"
//                   nameKey="name"
//                   cx="50%"
//                   cy="50%"
//                   outerRadius={80}
//                   label={({ name, value }) => `${name}: ${value}`}
//                 >
//                   {summaryData.map((entry, index) => (
//                     <Cell key={`cell-${index}`} fill={entry.color} />
//                   ))}
//                 </Pie>
//                 <Tooltip />
//               </PieChart>
//             </ResponsiveContainer>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   const renderRecommendations = () => {
//     if (!result?.detailed_results?.recommendations?.length) return null;

//     return (
//       <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
//         <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
//         <ul className="space-y-2">
//           {(result.detailed_results?.recommendations || []).map((rec, index) => (
//             <li key={index} className="flex items-start">
//               <span className="text-blue-500 mr-2">•</span>
//               <span className="text-gray-700">{rec}</span>
//             </li>
//           ))}
//         </ul>
//       </div>
//     );
//   };

//   return (
//     <div className="space-y-6">
//       <div className="bg-white p-6 rounded-lg shadow-sm">
//         <h2 className="text-2xl font-semibold mb-6">MERN AI Testing Platform</h2>
        
//         {/* Workflow Templates */}
//         <div className="mb-6">
//           <h3 className="text-lg font-semibold mb-3">Quick Start Templates</h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
//             {Object.entries(templates || {}).map(([key, template]) => (
//               <div
//                 key={key}
//                 className={`p-4 border rounded-lg cursor-pointer transition-colors ${
//                   selectedTemplate === key
//                     ? 'border-blue-500 bg-blue-50'
//                     : 'border-gray-200 hover:border-gray-300'
//                 }`}
//                 onClick={() => applyTemplate(key)}
//               >
//                 <div className="font-medium text-sm">{template.name}</div>
//                 <div className="text-xs text-gray-600 mt-1">{template.description}</div>
//               </div>
//             ))}
//           </div>
//         </div>

//         {/* Configuration Form */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               MERN Application Path *
//             </label>
//             <input
//               type="text"
//               value={config.mern_app_path}
//               onChange={(e) => setConfig(prev => ({ ...prev, mern_app_path: e.target.value }))}
//               placeholder="/path/to/your/mern/app"
//               className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Target API URL (Optional)
//             </label>
//             <input
//               type="url"
//               value={config.target_api_url || ''}
//               onChange={(e) => setConfig(prev => ({ ...prev, target_api_url: e.target.value }))}
//               placeholder="http://localhost:3000"
//               className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//             />
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
//           <div className="flex items-center">
//             <input
//               type="checkbox"
//               id="api-running"
//               checked={config.target_api_running}
//               onChange={(e) => setConfig(prev => ({ ...prev, target_api_running: e.target.checked }))}
//               className="mr-2"
//             />
//             <label htmlFor="api-running" className="text-sm text-gray-700">
//               Target API is Running
//             </label>
//           </div>

//           <div className="flex items-center">
//             <input
//               type="checkbox"
//               id="self-healing"
//               checked={config.enable_self_healing}
//               onChange={(e) => setConfig(prev => ({ ...prev, enable_self_healing: e.target.checked }))}
//               className="mr-2"
//             />
//             <label htmlFor="self-healing" className="text-sm text-gray-700">
//               Enable Self-Healing
//             </label>
//           </div>

//           <div className="flex items-center">
//             <input
//               type="checkbox"
//               id="rl-optimization"
//               checked={config.enable_rl_optimization}
//               onChange={(e) => setConfig(prev => ({ ...prev, enable_rl_optimization: e.target.checked }))}
//               className="mr-2"
//             />
//             <label htmlFor="rl-optimization" className="text-sm text-gray-700">
//               Enable RL Optimization
//             </label>
//           </div>
//         </div>

//         {/* Advanced Configuration */}
//         <div className="mt-4">
//           <button
//             onClick={() => setShowAdvanced(!showAdvanced)}
//             className="text-blue-600 hover:text-blue-700 text-sm font-medium"
//           >
//             {showAdvanced ? '▼' : '▶'} Advanced Configuration
//           </button>
//         </div>

//         {showAdvanced && (
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 p-4 bg-gray-50 rounded-lg">
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Max Test Cases
//               </label>
//               <input
//                 type="number"
//                 value={config.max_test_cases}
//                 onChange={(e) => setConfig(prev => ({ ...prev, max_test_cases: parseInt(e.target.value) }))}
//                 min="1"
//                 max="500"
//                 className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Timeout (seconds)
//               </label>
//               <input
//                 type="number"
//                 value={config.test_execution_timeout}
//                 onChange={(e) => setConfig(prev => ({ ...prev, test_execution_timeout: parseInt(e.target.value) }))}
//                 min="30"
//                 max="1800"
//                 className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Coverage Threshold
//               </label>
//               <input
//                 type="number"
//                 value={config.coverage_threshold}
//                 onChange={(e) => setConfig(prev => ({ ...prev, coverage_threshold: parseFloat(e.target.value) }))}
//                 min="0"
//                 max="1"
//                 step="0.1"
//                 className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
//               />
//             </div>
//           </div>
//         )}

//         {/* Action Buttons */}
//         <div className="flex gap-4 mt-6">
//           <button
//             onClick={executeWorkflow}
//             disabled={loading || !config.mern_app_path}
//             className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//           >
//             {loading ? 'Executing...' : 'Execute Complete Workflow'}
//           </button>

//           <button
//             onClick={scanOnly}
//             disabled={loading || !config.mern_app_path}
//             className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//           >
//             {loading ? 'Scanning...' : 'Scan Only'}
//           </button>
//         </div>

//         {/* Error Display */}
//         {error && (
//           <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-md">
//             <strong>Error:</strong> {error}
//           </div>
//         )}

//         {/* Loading Indicator */}
//         {loading && (
//           <div className="mt-4 p-4 bg-blue-50 text-blue-600 rounded-md">
//             <div className="flex items-center">
//               <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent mr-3"></div>
//               Executing workflow... This may take several minutes.
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Results */}
//       {result && (
//         <>
//           {renderExecutiveSummary()}
//           {renderRecommendations()}

//           {/* Detailed Results */}
//           <div className="bg-white p-6 rounded-lg shadow-sm">
//             <h3 className="text-lg font-semibold mb-4">Detailed Results</h3>
//             <div className="bg-gray-100 p-4 rounded-md">
//               <pre className="text-sm overflow-auto max-h-96">
//                 {JSON.stringify(result.detailed_results, null, 2)}
//               </pre>
//             </div>
//           </div>
//         </>
//       )}

//       {/* Active Workflows */}
//       {(activeWorkflows || []).length > 0 && (
//         <div className="bg-white p-6 rounded-lg shadow-sm">
//           <h3 className="text-lg font-semibold mb-4">Active Workflows</h3>
//           <div className="space-y-2">
//             {(activeWorkflows || []).map((workflow, index) => (
//               <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
//                 <div>
//                   <span className="font-medium">{workflow.workflow_id}</span>
//                   <span className="text-gray-600 text-sm ml-2">({workflow.status})</span>
//                 </div>
//                 <div className="text-sm text-gray-500">
//                   Progress: {(typeof workflow.progress === 'number' ? (workflow.progress * 100).toFixed(0) : '0')}%
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default WorkflowView;



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
} from 'recharts';
import axios from 'axios';

interface WorkflowConfig {
  mern_app_path: string;
  target_api_url?: string;
  target_api_running: boolean;
  max_test_cases: number;
  enable_self_healing: boolean;
  enable_rl_optimization: boolean;
  test_execution_timeout: number;
  coverage_threshold: number;
  generate_final_report: boolean;
}

interface WorkflowResult {
  workflow_id: string;
  status: string;
  execution_time: number;
  success_rate: number; // 0..1
  executive_summary: {
    endpoints_discovered: number;
    components_discovered: number;
    tests_generated: number;
    coverage_achieved: number; // 0..1
    recommendations_count: number;
  };
  detailed_results: {
    scan_results: any;
    execution_results: any;
    coverage_analysis: any;
    recommendations: string[];
    final_report: any;
  };
}

interface WorkflowTemplate {
  name: string;
  description: string;
  config: Partial<WorkflowConfig>;
}

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const WorkflowView: React.FC = () => {
  const [config, setConfig] = useState<WorkflowConfig>({
    mern_app_path: '',
    target_api_running: false,
    max_test_cases: 50,
    enable_self_healing: true,
    enable_rl_optimization: true,
    test_execution_timeout: 300,
    coverage_threshold: 0.8,
    generate_final_report: true,
  });

  const [result, setResult] = useState<WorkflowResult | null>(null);
  const [templates, setTemplates] = useState<Record<string, WorkflowTemplate>>({});
  const [activeWorkflows, setActiveWorkflows] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    fetchTemplates();
    fetchActiveWorkflows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTemplates = async () => {
    try {
      const response = await axios.get('/api/workflow/workflow-templates');
      // assume response.data.templates is an object mapping keys to templates
      setTemplates(response.data?.templates || {});
    } catch (err) {
      console.error('Failed to fetch workflow templates:', err);
    }
  };

  const fetchActiveWorkflows = async () => {
    try {
      const response = await axios.get('/api/workflow/active-workflows');
      setActiveWorkflows(response.data?.workflows || []);
    } catch (err) {
      console.error('Failed to fetch active workflows:', err);
    }
  };

  const applyTemplate = (templateKey: string) => {
    const template = templates[templateKey];
    if (template) {
      setConfig(prev => ({ ...prev, ...template.config }));
      setSelectedTemplate(templateKey);
    }
  };

  // Helper: decide whether to use JSON (no files) or FormData (if file upload needed).
  // Current UI doesn't upload files, so we'll send JSON by default.
  const executeWorkflow = async () => {
    if (!config.mern_app_path) {
      setError('Please provide a MERN application path');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const payload = {
        ...config,
      };

      const response = await axios.post('/api/workflow/execute-complete', payload, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 600000, // 10 minutes
      });

      setResult(response.data);
      await fetchActiveWorkflows();
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Workflow execution failed');
      console.error('executeWorkflow error:', err);
    } finally {
      setLoading(false);
    }
  };

  const scanOnly = async () => {
    if (!config.mern_app_path) {
      setError('Please provide a MERN application path');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        mern_app_path: config.mern_app_path,
        target_api_url: config.target_api_url,
        target_api_running: config.target_api_running,
      };

      const response = await axios.post('/api/workflow/mern-scan-only', payload, {
        headers: { 'Content-Type': 'application/json' },
      });

      // Convert scan-only result to workflow result format for display
      setResult({
        workflow_id: response.data?.workflow_id || 'scan_only',
        status: response.data?.status || 'scan_completed',
        execution_time: response.data?.execution_time ?? 0,
        success_rate: response.data?.success_rate ?? 0,
        executive_summary: {
          endpoints_discovered: response.data?.summary?.endpoints_discovered ?? response.data?.summary?.endpoints_count ?? 0,
          components_discovered: response.data?.summary?.components_discovered ?? 0,
          tests_generated: response.data?.summary?.tests_generated ?? 0,
          coverage_achieved: response.data?.summary?.coverage_achieved ?? 0,
          recommendations_count: (response.data?.summary?.recommendations || []).length,
        },
        detailed_results: {
          scan_results: response.data?.scan_results || response.data?.summary || {},
          execution_results: {},
          coverage_analysis: {},
          recommendations: response.data?.summary?.recommendations || [],
          final_report: {},
        },
      });
    } catch (err: any) {
      setError(err?.response?.data?.detail || err?.message || 'Scan failed');
      console.error('scanOnly error:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderExecutiveSummary = () => {
    if (!result) return null;

    const summaryData = [
      { name: 'Endpoints', value: result.executive_summary.endpoints_discovered ?? 0, color: COLORS[0] },
      { name: 'Components', value: result.executive_summary.components_discovered ?? 0, color: COLORS[1] },
      { name: 'Tests Generated', value: result.executive_summary.tests_generated ?? 0, color: COLORS[2] },
      { name: 'Recommendations', value: result.executive_summary.recommendations_count ?? 0, color: COLORS[3] },
    ];

    const coveragePercent = ((result.executive_summary.coverage_achieved ?? 0) * 100).toFixed(1);
    const successPercent = ((result.success_rate ?? 0) * 100).toFixed(1);

    return (
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h3 className="text-xl font-semibold mb-4">Executive Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {result.executive_summary.endpoints_discovered ?? 0}
                </div>
                <div className="text-sm text-gray-600">Endpoints Discovered</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {result.executive_summary.tests_generated ?? 0}
                </div>
                <div className="text-sm text-gray-600">Tests Generated</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {coveragePercent}%
                </div>
                <div className="text-sm text-gray-600">Coverage Achieved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {successPercent}%
                </div>
                <div className="text-sm text-gray-600">Success Rate</div>
              </div>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={summaryData.filter(d => (d.value ?? 0) > 0)}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={({ name, value }) => `${name}: ${value}`}
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
      </div>
    );
  };

  const renderRecommendations = () => {
    if (!result?.detailed_results?.recommendations?.length) return null;

    return (
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
        <ul className="space-y-2">
          {(result.detailed_results?.recommendations || []).map((rec, index) => (
            <li key={index} className="flex items-start">
              <span className="text-blue-500 mr-2">•</span>
              <span className="text-gray-700">{rec}</span>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <h2 className="text-2xl font-semibold mb-6">MERN AI Testing Platform</h2>

        {/* Workflow Templates */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-3">Quick Start Templates</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(templates || {}).map(([key, template]) => (
              <div
                key={key}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedTemplate === key ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => applyTemplate(key)}
              >
                <div className="font-medium text-sm">{template.name}</div>
                <div className="text-xs text-gray-600 mt-1">{template.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Configuration Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">MERN Application Path *</label>
            <input
              type="text"
              value={config.mern_app_path}
              onChange={(e) => setConfig(prev => ({ ...prev, mern_app_path: e.target.value }))}
              placeholder="/path/to/your/mern/app"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Target API URL (Optional)</label>
            <input
              type="url"
              value={config.target_api_url || ''}
              onChange={(e) => setConfig(prev => ({ ...prev, target_api_url: e.target.value || undefined }))}
              placeholder="http://localhost:3000"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="api-running"
              checked={config.target_api_running}
              onChange={(e) => setConfig(prev => ({ ...prev, target_api_running: e.target.checked }))}
              className="mr-2"
            />
            <label htmlFor="api-running" className="text-sm text-gray-700">
              Target API is Running
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="self-healing"
              checked={config.enable_self_healing}
              onChange={(e) => setConfig(prev => ({ ...prev, enable_self_healing: e.target.checked }))}
              className="mr-2"
            />
            <label htmlFor="self-healing" className="text-sm text-gray-700">
              Enable Self-Healing
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="rl-optimization"
              checked={config.enable_rl_optimization}
              onChange={(e) => setConfig(prev => ({ ...prev, enable_rl_optimization: e.target.checked }))}
              className="mr-2"
            />
            <label htmlFor="rl-optimization" className="text-sm text-gray-700">
              Enable RL Optimization
            </label>
          </div>
        </div>

        {/* Advanced Configuration */}
        <div className="mt-4">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium"
          >
            {showAdvanced ? '▼' : '▶'} Advanced Configuration
          </button>
        </div>

        {showAdvanced && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 p-4 bg-gray-50 rounded-lg">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Test Cases</label>
              <input
                type="number"
                value={config.max_test_cases}
                onChange={(e) =>
                  setConfig(prev => ({ ...prev, max_test_cases: Number.isNaN(Number(e.target.value)) ? prev.max_test_cases : Math.max(1, Math.min(500, Number(e.target.value))) }))
                }
                min={1}
                max={500}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Timeout (seconds)</label>
              <input
                type="number"
                value={config.test_execution_timeout}
                onChange={(e) =>
                  setConfig(prev => ({ ...prev, test_execution_timeout: Number.isNaN(Number(e.target.value)) ? prev.test_execution_timeout : Math.max(30, Math.min(1800, Number(e.target.value))) }))
                }
                min={30}
                max={1800}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Coverage Threshold</label>
              <input
                type="number"
                value={config.coverage_threshold}
                onChange={(e) =>
                  setConfig(prev => ({ ...prev, coverage_threshold: Number.isNaN(Number(e.target.value)) ? prev.coverage_threshold : Math.max(0, Math.min(1, Number(e.target.value))) }))
                }
                min={0}
                max={1}
                step={0.1}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={executeWorkflow}
            disabled={loading || !config.mern_app_path}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Executing...' : 'Execute Complete Workflow'}
          </button>

          <button
            onClick={scanOnly}
            disabled={loading || !config.mern_app_path}
            className="px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Scanning...' : 'Scan Only'}
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-600 rounded-md">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="mt-4 p-4 bg-blue-50 text-blue-600 rounded-md">
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent mr-3"></div>
              Executing workflow... This may take several minutes.
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {result && (
        <>
          {renderExecutiveSummary()}
          {renderRecommendations()}

          {/* Detailed Results */}
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Detailed Results</h3>
            <div className="bg-gray-100 p-4 rounded-md">
              <pre className="text-sm overflow-auto max-h-96">
                {JSON.stringify(result.detailed_results, null, 2)}
              </pre>
            </div>
          </div>
        </>
      )}

      {/* Active Workflows */}
      {(activeWorkflows || []).length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4">Active Workflows</h3>
          <div className="space-y-2">
            {(activeWorkflows || []).map((workflow, index) => (
              <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                <div>
                  <span className="font-medium">{workflow.workflow_id ?? `wf-${index}`}</span>
                  <span className="text-gray-600 text-sm ml-2">({workflow.status ?? 'unknown'})</span>
                </div>
                <div className="text-sm text-gray-500">
                  Progress:{' '}
                  {typeof workflow.progress === 'number'
                    ? `${Math.round(Math.max(0, Math.min(1, workflow.progress)) * 100)}%`
                    : 'N/A'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default WorkflowView;
