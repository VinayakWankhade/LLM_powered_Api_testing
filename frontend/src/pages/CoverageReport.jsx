import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Search, ChevronDown, Eye } from 'lucide-react';

const CoverageReport = () => {
    const { id, runId } = useParams();
    const [methodFilter, setMethodFilter] = useState('All Methods');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [searchQuery, setSearchQuery] = useState('');

    const coverageStats = [
        { label: 'Overall API Coverage', value: '85%', subtext: '+12% from last week', color: 'purple', icon: '📊' },
        { label: 'Endpoints Covered', value: '150/175', subtext: '25 endpoints remaining', color: 'cyan', icon: '🔌' },
        { label: 'Methods Covered', value: '342', subtext: 'GET, POST, PUT, DELETE', color: 'orange', icon: '</>' },
        { label: 'Parameters Covered', value: '1,247', subtext: 'Input & Output params', color: 'blue', icon: '{x}' },
    ];

    const criticalGaps = [
        { path: '/api/v1/admin/delete', risk: 'High Risk', category: 'Admin Operations', coverage: '0%' },
        { path: '/api/v1/payments/process', risk: 'High Risk', category: 'Financial Operations', coverage: '15%' },
        { path: '/api/v1/auth/reset-password', risk: 'Medium Risk', category: 'Authentication', coverage: '8%' },
    ];

    const endpoints = [
        {
            path: '/api/v1/users',
            methods: ['GET', 'POST', 'PUT'],
            methodCount: '3/4 methods',
            coverage: 75,
            paramCoverage: 82,
            params: '18/22 params',
        },
        {
            path: '/api/v1/projects',
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            methodCount: '4/4 methods',
            coverage: 95,
            paramCoverage: 88,
            params: '15/17 params',
        },
        {
            path: '/api/v1/admin/delete',
            methods: ['DELETE'],
            methodCount: '0/1 methods',
            coverage: 0,
            paramCoverage: 0,
            params: '0/5 params',
        },
    ];

    const inputParams = [
        { name: 'user_id', type: 'Required • Integer', coverage: 100, testValues: '25 test values', color: 'green' },
        { name: 'email', type: 'Required • String', coverage: 60, testValues: '12 test values', color: 'orange' },
        { name: 'profile_image', type: 'Optional • File', coverage: 0, testValues: '0 test values', color: 'red' },
        { name: 'permissions', type: 'Optional • Array', coverage: 85, testValues: '17 test values', color: 'green' },
    ];

    const outputParams = [
        { name: 'id', type: 'Always • Integer', coverage: 100, status: 'Validated', color: 'green' },
        { name: 'created_at', type: 'Always • DateTime', coverage: 100, status: 'Validated', color: 'green' },
        { name: 'metadata', type: 'Conditional • Object', coverage: 45, status: 'Partial validation', color: 'orange' },
        { name: 'error_details', type: 'Error only • Object', coverage: 0, status: 'Not validated', color: 'red' },
    ];

    const getMethodBadge = (method) => {
        const colors = {
            GET: 'bg-green-500',
            POST: 'bg-green-400',
            PUT: 'bg-orange-500',
            DELETE: 'bg-red-500',
        };
        return (
            <span className={`px-2 py-0.5 ${colors[method]} text-white text-xs font-bold rounded`}>
                {method}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-black">
            <div className="max-w-[1920px] mx-auto px-8 py-8">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm mb-6 text-gray-400">
                    <Link to="/dashboard" className="hover:text-white transition-colors">Project</Link>
                    <span>/</span>
                    <Link to={`/project/${id}/runs`} className="hover:text-white transition-colors">Test Run</Link>
                    <span>/</span>
                    <span className="text-white">Coverage Report</span>
                </div>

                {/* Back Button */}
                <Link
                    to={`/project/${id}/run/${runId}`}
                    className="inline-flex items-center gap-2 text-cyan-light hover:text-cyan transition-colors mb-6"
                >
                    <ArrowLeft size={18} />
                    Back
                </Link>

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-4xl font-bold text-white">Project Coverage Report</h1>
                    <select className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-purple">
                        <option>Last Run</option>
                        <option>Last Week</option>
                        <option>Last Month</option>
                    </select>
                </div>

                {/* Coverage Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {coverageStats.map((stat, index) => (
                        <div key={index} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-gray-400">{stat.label}</span>
                                <span className="text-2xl">{stat.icon}</span>
                            </div>
                            <div className={`text-3xl font-bold text-${stat.color}-500 mb-1`}>{stat.value}</div>
                            <div className="text-xs text-gray-500">{stat.subtext}</div>
                        </div>
                    ))}
                </div>

                {/* Critical Coverage Gaps */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <span className="text-red-500 text-2xl">⚠</span>
                            <h2 className="text-xl font-bold text-red-500">Critical Coverage Gaps</h2>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-orange-500 text-sm font-semibold">3 critical endpoints need immediate attention</span>
                            <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-all">
                                + Generate Tests for Gaps
                            </button>
                        </div>
                    </div>

                    <div className="space-y-3">
                        {criticalGaps.map((gap, index) => (
                            <div key={index} className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-lg">
                                <div className="flex items-center gap-4 flex-1">
                                    <span className="text-red-500 text-xl">●</span>
                                    <div className="flex-1">
                                        <div className="text-white font-mono text-sm mb-1">{gap.path}</div>
                                        <div className="text-gray-400 text-xs">{gap.risk} - {gap.category}</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="w-32 h-2 bg-zinc-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-red-500" style={{ width: gap.coverage }}></div>
                                    </div>
                                    <span className="text-red-500 text-sm font-semibold w-12 text-right">{gap.coverage}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Endpoint Coverage Details */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8">
                    <h2 className="text-xl font-bold text-white mb-6">Endpoint Coverage Details</h2>

                    {/* Filters */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <select
                            value={methodFilter}
                            onChange={(e) => setMethodFilter(e.target.value)}
                            className="px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-purple"
                        >
                            <option>All Methods</option>
                            <option>GET</option>
                            <option>POST</option>
                            <option>PUT</option>
                            <option>DELETE</option>
                        </select>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-purple"
                        >
                            <option>All Status</option>
                            <option>Covered</option>
                            <option>Partial</option>
                            <option>Not Covered</option>
                        </select>

                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search endpoints..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-2 pl-10 bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-purple"
                            />
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-zinc-800">
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            Endpoint Path
                                            <ChevronDown size={14} />
                                        </div>
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            Methods
                                            <ChevronDown size={14} />
                                        </div>
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            Coverage
                                            <ChevronDown size={14} />
                                        </div>
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        <div className="flex items-center gap-2">
                                            Parameters
                                            <ChevronDown size={14} />
                                        </div>
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {endpoints.map((endpoint, index) => (
                                    <tr key={index} className="border-b border-zinc-800 hover:bg-white/[0.02] transition-colors">
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2">
                                                <ChevronDown size={16} className="text-gray-500" />
                                                <span className="text-white font-mono text-sm">{endpoint.path}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-2">
                                                {endpoint.methods.map((method, i) => (
                                                    <span key={i}>{getMethodBadge(method)}</span>
                                                ))}
                                                <span className="text-gray-400 text-xs ml-2">{endpoint.methodCount}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-24 h-2 bg-zinc-800 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full ${endpoint.coverage >= 80 ? 'bg-blue-500' : endpoint.coverage >= 50 ? 'bg-purple-500' : 'bg-red-500'}`}
                                                            style={{ width: `${endpoint.coverage}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-white text-sm font-semibold">{endpoint.coverage}%</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-24 h-2 bg-zinc-800 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full ${endpoint.paramCoverage >= 80 ? 'bg-purple-500' : endpoint.paramCoverage >= 50 ? 'bg-blue-500' : 'bg-red-500'}`}
                                                            style={{ width: `${endpoint.paramCoverage}%` }}
                                                        ></div>
                                                    </div>
                                                    <span className="text-white text-sm font-semibold">{endpoint.paramCoverage}%</span>
                                                </div>
                                                <div className="text-gray-400 text-xs">{endpoint.params}</div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
                                                <Eye size={18} className="text-gray-400" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Parameter Coverage Analysis */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <h2 className="text-xl font-bold text-white mb-6">Parameter Coverage Analysis</h2>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Input Parameters */}
                        <div>
                            <h3 className="text-lg font-semibold text-purple-light mb-4">Input Parameters</h3>
                            <div className="space-y-3">
                                {inputParams.map((param, index) => (
                                    <div key={index} className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <div>
                                                <div className="text-white font-mono text-sm mb-1">{param.name}</div>
                                                <div className="text-gray-400 text-xs">{param.type}</div>
                                            </div>
                                            <span className={`text-${param.color}-500 text-sm font-semibold`}>{param.coverage}%</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                                                <div className={`h-full bg-${param.color}-500`} style={{ width: `${param.coverage}%` }}></div>
                                            </div>
                                            <span className="text-gray-500 text-xs">{param.testValues}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Output Parameters */}
                        <div>
                            <h3 className="text-lg font-semibold text-cyan-light mb-4">Output Parameters</h3>
                            <div className="space-y-3">
                                {outputParams.map((param, index) => (
                                    <div key={index} className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <div>
                                                <div className="text-white font-mono text-sm mb-1">{param.name}</div>
                                                <div className="text-gray-400 text-xs">{param.type}</div>
                                            </div>
                                            <span className={`text-${param.color}-500 text-sm font-semibold`}>{param.coverage}%</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden">
                                                <div className={`h-full bg-${param.color}-500`} style={{ width: `${param.coverage}%` }}></div>
                                            </div>
                                            <span className="text-gray-500 text-xs">{param.status}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Coverage Summary */}
                    <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-zinc-800">
                        <div className="text-center">
                            <div className="text-3xl font-bold text-green-500 mb-1">82%</div>
                            <div className="text-sm text-gray-400">Required Parameters</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-orange-500 mb-1">65%</div>
                            <div className="text-sm text-gray-400">Optional Parameters</div>
                        </div>
                        <div className="text-center">
                            <div className="text-3xl font-bold text-cyan-light mb-1">73%</div>
                            <div className="text-sm text-gray-400">Output Validation</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoverageReport;
