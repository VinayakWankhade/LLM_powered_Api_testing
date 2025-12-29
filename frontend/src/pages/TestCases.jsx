import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Search, ArrowLeft, Play, Trash2, CheckCircle } from 'lucide-react';

const TestCases = () => {
    const { id } = useParams();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Statuses');
    const [priorityFilter, setPriorityFilter] = useState('All Priorities');
    const [showOnlyUnresolved, setShowOnlyUnresolved] = useState(false);

    const testCases = [
        {
            id: 'TC-08152',
            description: 'Validate user login with correct credentials.',
            status: 'Approved',
            statusColor: 'green',
            priority: 'High',
            priorityColor: 'red',
            type: 'Functional',
            lastModified: '2025-10-11',
        },
        {
            id: 'TC-08153',
            description: 'Check response for invalid password during login.',
            status: 'Draft',
            statusColor: 'cyan',
            priority: 'High',
            priorityColor: 'red',
            type: 'Security',
            lastModified: '2025-10-10',
        },
        {
            id: 'TC-08154',
            description: 'Verify password reset flow via email link.',
            status: 'Pending Review',
            statusColor: 'orange',
            priority: 'Medium',
            priorityColor: 'orange',
            type: 'Functional',
            lastModified: '2025-10-09',
        },
        {
            id: 'TC-08155',
            description: 'Assess API performance under high load conditions.',
            status: 'Approved',
            statusColor: 'green',
            priority: 'Medium',
            priorityColor: 'orange',
            type: 'Performance',
            lastModified: '2025-10-08',
        },
        {
            id: 'TC-08156',
            description: 'SQL Injection vulnerability check on search endpoint.',
            status: 'Blocked',
            statusColor: 'gray',
            priority: 'High',
            priorityColor: 'red',
            type: 'Security',
            lastModified: '2025-10-07',
        },
        {
            id: 'TC-08157',
            description: 'Verify correct data rendering on user dashboard.',
            status: 'Draft',
            statusColor: 'cyan',
            priority: 'Low',
            priorityColor: 'yellow',
            type: 'UI/UX',
            lastModified: '2025-10-06',
        },
    ];

    const getStatusBadge = (status, color) => {
        const colors = {
            green: 'bg-green-500 text-white',
            cyan: 'bg-cyan-light text-black',
            orange: 'bg-orange-500 text-white',
            gray: 'bg-gray-600 text-white',
        };

        return (
            <span className={`inline-flex items-center px-3 py-1 rounded text-xs font-semibold uppercase tracking-wide ${colors[color]}`}>
                {status}
            </span>
        );
    };

    const getPriorityBadge = (priority, color) => {
        const colors = {
            red: 'bg-red-600 text-white',
            orange: 'bg-orange-500 text-white',
            yellow: 'bg-yellow-500 text-black',
        };

        return (
            <span className={`inline-flex items-center px-3 py-1 rounded text-xs font-bold uppercase tracking-wide ${colors[color]}`}>
                {priority}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-black">
            <div className="max-w-[1920px] mx-auto px-8 py-8">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm mb-6 text-gray-400">
                    <Link to="/dashboard" className="hover:text-white transition-colors">Home</Link>
                    <span>/</span>
                    <Link to={`/project/${id}`} className="hover:text-white transition-colors">Project Zeta</Link>
                    <span>/</span>
                    <Link to={`/project/${id}/endpoints`} className="hover:text-white transition-colors">API Endpoints</Link>
                    <span>/</span>
                    <span className="text-white">Generated Test Cases</span>
                </div>

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-4xl font-bold text-white">Generated Test Cases</h1>
                    <div className="flex items-center gap-3">
                        <Link
                            to={`/project/${id}/endpoints`}
                            className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-800 hover:border-purple text-white rounded-lg transition-all"
                        >
                            <ArrowLeft size={18} />
                            Back to API Endpoints
                        </Link>
                        <button className="flex items-center gap-2 px-6 py-2.5 bg-purple hover:bg-purple-dark text-white font-semibold rounded-lg transition-all hover:shadow-glow-purple">
                            <Play size={18} />
                            Execute Selected Tests
                        </button>
                    </div>
                </div>

                {/* Filters Bar */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        {/* Search */}
                        <div className="relative md:col-span-2">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search by ID, description, type..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/10 transition-all"
                            />
                        </div>

                        {/* Search Button */}
                        <button className="px-6 py-2.5 bg-purple hover:bg-purple-dark text-white font-semibold rounded-lg transition-all">
                            Search
                        </button>

                        {/* Status Filter */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/10 transition-all appearance-none cursor-pointer"
                        >
                            <option>All Statuses</option>
                            <option>Approved</option>
                            <option>Draft</option>
                            <option>Pending Review</option>
                            <option>Blocked</option>
                        </select>
                    </div>

                    <div className="flex items-center justify-between">
                        {/* Priority Filter */}
                        <select
                            value={priorityFilter}
                            onChange={(e) => setPriorityFilter(e.target.value)}
                            className="px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/10 transition-all appearance-none cursor-pointer"
                        >
                            <option>All Priorities</option>
                            <option>High</option>
                            <option>Medium</option>
                            <option>Low</option>
                        </select>

                        {/* Show Only Unresolved */}
                        <label className="flex items-center gap-3 cursor-pointer">
                            <span className="text-white text-sm">Show only unresolved</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={showOnlyUnresolved}
                                    onChange={(e) => setShowOnlyUnresolved(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple/10 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple"></div>
                            </label>
                        </label>
                    </div>
                </div>

                {/* Bulk Actions & Active Filters */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <span className="text-gray-400 text-sm font-medium">Bulk Actions:</span>
                        <button className="flex items-center gap-2 px-4 py-2 bg-green-500/20 border border-green-500 hover:bg-green-500/30 text-green-500 text-sm font-semibold rounded-lg transition-all">
                            <CheckCircle size={16} />
                            Approve Selected
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-red-500/20 border border-red-500 hover:bg-red-500/30 text-red-500 text-sm font-semibold rounded-lg transition-all">
                            <Trash2 size={16} />
                            Delete Selected
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-sm">Active Filters:</span>
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-purple/20 text-purple-light border border-purple/30 rounded-lg text-sm">
                            Status: Approved
                            <button className="hover:text-white transition-colors">×</button>
                        </span>
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-purple/20 text-purple-light border border-purple/30 rounded-lg text-sm">
                            Priority: High
                            <button className="hover:text-white transition-colors">×</button>
                        </span>
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
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    TEST CASE ID
                                </th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    DESCRIPTION
                                </th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    STATUS
                                </th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    PRIORITY
                                </th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    TYPE
                                </th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    LAST MODIFIED
                                </th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    ACTIONS
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {testCases.map((testCase) => (
                                <tr key={testCase.id} className="border-b border-zinc-800 hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 bg-zinc-800 border-zinc-700 rounded text-purple focus:ring-2 focus:ring-purple/10"
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-white text-sm font-mono">{testCase.id}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-white text-sm">{testCase.description}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {getStatusBadge(testCase.status, testCase.statusColor)}
                                    </td>
                                    <td className="px-6 py-4">
                                        {getPriorityBadge(testCase.priority, testCase.priorityColor)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-gray-400 text-sm">{testCase.type}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-gray-400 text-sm">{testCase.lastModified}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button className="text-cyan-light text-sm font-medium hover:text-cyan transition-colors">
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
                        <button className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-gray-400 hover:text-white rounded-lg transition-all text-sm">
                            Page 1
                        </button>
                        <button className="px-3 py-1.5 bg-purple text-white rounded-lg text-sm font-medium">
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

export default TestCases;
