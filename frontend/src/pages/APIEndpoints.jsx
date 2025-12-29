import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Search, Filter, RefreshCw, FileText, Eye, CheckCircle, AlertTriangle, Clock } from 'lucide-react';

const APIEndpoints = () => {
    const { id } = useParams();
    const [searchQuery, setSearchQuery] = useState('');

    const stats = [
        { label: 'Total Endpoints', value: '152', color: 'white' },
        { label: 'Scanned', value: '128', color: 'green' },
        { label: 'Unscanned', value: '24', color: 'gray' },
        { label: 'Errors', value: '2', color: 'red' },
        { label: 'Warnings', value: '5', color: 'orange' },
    ];

    const endpoints = [
        {
            id: 1,
            method: 'GET',
            methodColor: 'green',
            path: '/api/v1/users/{userId}/profile',
            status: 'Scanned',
            statusColor: 'green',
            statusIcon: CheckCircle,
        },
        {
            id: 2,
            method: 'POST',
            methodColor: 'cyan',
            path: '/api/v1/users/',
            status: 'Scanned',
            statusColor: 'green',
            statusIcon: CheckCircle,
        },
        {
            id: 3,
            method: 'PUT',
            methodColor: 'orange',
            path: '/api/v1/posts/{postId}',
            status: 'Unscanned',
            statusColor: 'gray',
            statusIcon: Clock,
        },
        {
            id: 4,
            method: 'DELETE',
            methodColor: 'red',
            path: '/api/v1/posts/{postId}/comment/{commentId}',
            status: 'Error',
            statusColor: 'red',
            statusIcon: AlertTriangle,
        },
        {
            id: 5,
            method: 'GET',
            methodColor: 'green',
            path: '/api/v1/auth/status',
            status: 'Warning',
            statusColor: 'orange',
            statusIcon: AlertTriangle,
        },
        {
            id: 6,
            method: 'POST',
            methodColor: 'cyan',
            path: '/api/v1/auth/login',
            status: 'Unscanned',
            statusColor: 'gray',
            statusIcon: Clock,
        },
    ];

    const getMethodBadge = (method, color) => {
        const colors = {
            green: 'bg-green-500/20 text-green-500 border-green-500',
            cyan: 'bg-cyan-light/20 text-cyan-light border-cyan-light',
            orange: 'bg-orange-500/20 text-orange-500 border-orange-500',
            red: 'bg-red-500/20 text-red-500 border-red-500',
        };

        return (
            <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wide border ${colors[color]}`}>
                {method}
            </span>
        );
    };

    const getStatusBadge = (status, color, Icon) => {
        const colors = {
            green: 'bg-green-500/20 text-green-500 border-green-500',
            gray: 'bg-gray-500/20 text-gray-400 border-gray-500',
            red: 'bg-red-500/20 text-red-500 border-red-500',
            orange: 'bg-orange-500/20 text-orange-500 border-orange-500',
        };

        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wide border ${colors[color]}`}>
                <Icon size={12} />
                {status}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-black">
            <div className="max-w-[1920px] mx-auto px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-1">
                                Project: QuantumLeap_AI
                                <Link to={`/project/${id}`} className="ml-3 text-purple-light text-sm font-medium hover:text-purple transition-colors">
                                    Project Dashboard
                                </Link>
                            </h1>
                            <p className="text-gray-400 text-sm">API Endpoint Analysis & Test Generation</p>
                        </div>
                    </div>

                    {/* Stats Bar */}
                    <div className="flex items-center gap-6">
                        {stats.map((stat, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <span className="text-gray-400 text-sm">{stat.label}</span>
                                <span className={`text-${stat.color}-500 text-2xl font-bold`}>
                                    {stat.value}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Controls Bar */}
                <div className="flex items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3 flex-1">
                        {/* Search */}
                        <div className="relative flex-1 max-w-md">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search by path..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/10 transition-all"
                            />
                        </div>

                        {/* Filter by Method */}
                        <select className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/10 transition-all appearance-none cursor-pointer">
                            <option>Filter by Method</option>
                            <option>GET</option>
                            <option>POST</option>
                            <option>PUT</option>
                            <option>DELETE</option>
                        </select>

                        {/* Filter by Status */}
                        <select className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/10 transition-all appearance-none cursor-pointer">
                            <option>Filter by Status</option>
                            <option>Scanned</option>
                            <option>Unscanned</option>
                            <option>Error</option>
                            <option>Warning</option>
                        </select>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                        <button className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 hover:border-purple text-white rounded-lg transition-all flex items-center gap-2">
                            <FileText size={18} />
                            <span className="font-medium">Bulk Actions</span>
                        </button>
                        <button className="px-4 py-2.5 bg-cyan-light hover:bg-cyan text-black font-semibold rounded-lg transition-all flex items-center gap-2 hover:shadow-glow-cyan">
                            <RefreshCw size={18} />
                            Rescan Codebase
                        </button>
                        <button className="px-4 py-2.5 bg-purple hover:bg-purple-dark text-white font-semibold rounded-lg transition-all flex items-center gap-2 hover:shadow-glow-purple">
                            <FileText size={18} />
                            Generate Tests for Selected
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-zinc-800 bg-zinc-950">
                                <th className="text-left px-6 py-4 w-12">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 bg-zinc-800 border-zinc-700 rounded text-purple focus:ring-2 focus:ring-purple/10"
                                    />
                                </th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-purple-light uppercase tracking-wider">
                                    METHOD
                                </th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-purple-light uppercase tracking-wider">
                                    ENDPOINT PATH
                                </th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-purple-light uppercase tracking-wider">
                                    SCAN STATUS
                                </th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-purple-light uppercase tracking-wider">
                                    ACTIONS
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {endpoints.map((endpoint) => (
                                <tr key={endpoint.id} className="border-b border-zinc-800 hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 bg-zinc-800 border-zinc-700 rounded text-purple focus:ring-2 focus:ring-purple/10"
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        {getMethodBadge(endpoint.method, endpoint.methodColor)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-white text-sm font-mono">{endpoint.path}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {getStatusBadge(endpoint.status, endpoint.statusColor, endpoint.statusIcon)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="text-purple-light text-sm font-medium hover:text-purple transition-colors flex items-center gap-1">
                                            <Eye size={14} />
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    <div className="px-6 py-4 border-t border-zinc-800 flex items-center justify-center gap-2">
                        <button className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-gray-400 hover:text-white rounded-lg transition-all text-sm">
                            ‹
                        </button>
                        <button className="px-3 py-1.5 bg-purple text-white rounded-lg text-sm font-medium">
                            1
                        </button>
                        <button className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-gray-400 hover:text-white rounded-lg transition-all text-sm">
                            2
                        </button>
                        <button className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-gray-400 hover:text-white rounded-lg transition-all text-sm">
                            3
                        </button>
                        <span className="px-2 text-gray-500">...</span>
                        <button className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-gray-400 hover:text-white rounded-lg transition-all text-sm">
                            12
                        </button>
                        <button className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-gray-400 hover:text-white rounded-lg transition-all text-sm">
                            ›
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default APIEndpoints;
