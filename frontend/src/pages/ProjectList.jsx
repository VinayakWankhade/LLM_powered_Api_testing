import { Search, Filter, Plus, ArrowUpDown, Eye, Play, MoreVertical } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const ProjectList = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const projects = [
        {
            id: 1,
            icon: '🔐',
            name: 'QuantumLeap API',
            description: 'Main backend service for user authentication',
            status: 'Active',
            statusColor: 'green',
            lastActivity: '2025-11-22 14:30 UTC',
            apis: 124,
            testSuccess: 98.5,
            trend: 'up',
            healing: 8,
        },
        {
            id: 2,
            icon: '🌐',
            name: 'NebulaFrontEnd',
            description: 'Customer-facing web application',
            status: 'Scanning',
            statusColor: 'orange',
            lastActivity: '2025-11-21 09:15 UTC',
            apis: 87,
            testSuccess: 92.1,
            trend: 'down',
            healing: 2,
        },
        {
            id: 3,
            icon: '📊',
            name: 'OrionDataPipeline',
            description: 'ETL services and data warehousing',
            status: 'Failed',
            statusColor: 'red',
            lastActivity: '2025-11-20 18:00 UTC',
            apis: 256,
            testSuccess: 45.0,
            trend: 'down',
            healing: 0,
        },
    ];

    const getStatusBadge = (status, color) => {
        const colors = {
            green: 'bg-green-500/20 text-green-500 border-green-500',
            orange: 'bg-orange-500/20 text-orange-500 border-orange-500',
            red: 'bg-red-500/20 text-red-500 border-red-500',
        };

        return (
            <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wide border ${colors[color]}`}>
                {status}
            </span>
        );
    };

    const getTrendChart = (trend) => {
        if (trend === 'up') {
            return (
                <svg width="60" height="20" viewBox="0 0 60 20" className="text-green-500">
                    <polyline
                        points="0,15 15,12 30,8 45,5 60,2"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    />
                </svg>
            );
        } else {
            return (
                <svg width="60" height="20" viewBox="0 0 60 20" className="text-red-500">
                    <polyline
                        points="0,5 15,8 30,12 45,15 60,18"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                    />
                </svg>
            );
        }
    };

    return (
        <div className="min-h-screen bg-black">
            <div className="max-w-[1920px] mx-auto px-8 py-8">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm mb-6">
                    <Link to="/dashboard" className="text-gray-500 hover:text-white transition-colors">Dashboard</Link>
                    <span className="text-gray-600">/</span>
                    <span className="text-white font-medium">Projects</span>
                </div>

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-purple-light mb-2">Project List</h1>
                </div>

                {/* Controls Bar */}
                <div className="flex items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3 flex-1">
                        {/* Search */}
                        <div className="relative flex-1 max-w-md">
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Search projects..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/10 transition-all"
                            />
                        </div>

                        {/* Search Button */}
                        <button className="px-6 py-2.5 bg-purple hover:bg-purple-dark text-white font-semibold rounded-lg transition-all">
                            Search
                        </button>

                        {/* Filters */}
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-800 hover:border-purple text-white rounded-lg transition-all">
                            <Filter size={18} />
                            <span className="font-medium">Filters</span>
                            <span className="ml-1 px-2 py-0.5 bg-purple text-white text-xs font-bold rounded-full">2</span>
                        </button>
                    </div>

                    {/* Add New Project */}
                    <Link
                        to="/add-project"
                        className="flex items-center gap-2 px-6 py-2.5 bg-purple hover:bg-purple-dark text-white font-semibold rounded-lg transition-all hover:shadow-glow-purple"
                    >
                        <Plus size={18} />
                        Add New Project
                    </Link>
                </div>

                {/* Table */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-zinc-800 bg-zinc-950">
                                <th className="text-left px-6 py-4">
                                    <button className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-white transition-colors">
                                        Project Name
                                        <ArrowUpDown size={14} />
                                    </button>
                                </th>
                                <th className="text-left px-6 py-4">
                                    <button className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-white transition-colors">
                                        Status
                                        <ArrowUpDown size={14} />
                                    </button>
                                </th>
                                <th className="text-left px-6 py-4">
                                    <button className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-white transition-colors">
                                        Last Activity
                                        <ArrowUpDown size={14} />
                                    </button>
                                </th>
                                <th className="text-left px-6 py-4">
                                    <button className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-white transition-colors">
                                        APIs
                                        <ArrowUpDown size={14} />
                                    </button>
                                </th>
                                <th className="text-left px-6 py-4">
                                    <button className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-white transition-colors">
                                        Test Success
                                        <ArrowUpDown size={14} />
                                    </button>
                                </th>
                                <th className="text-left px-6 py-4">
                                    <button className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-white transition-colors">
                                        Healing
                                        <ArrowUpDown size={14} />
                                    </button>
                                </th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {projects.map((project) => (
                                <tr key={project.id} className="border-b border-zinc-800 hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-4">
                                        <Link to={`/project/${project.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                                            <div className="w-10 h-10 rounded-lg bg-purple/20 border border-purple/30 flex items-center justify-center flex-shrink-0 text-xl">
                                                {project.icon}
                                            </div>
                                            <div>
                                                <p className="text-white font-semibold text-sm">{project.name}</p>
                                                <p className="text-gray-500 text-xs">{project.description}</p>
                                            </div>
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4">
                                        {getStatusBadge(project.status, project.statusColor)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-gray-400 text-sm">{project.lastActivity}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-white text-sm font-medium">{project.apis}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <span className="text-white text-sm font-medium">{project.testSuccess}%</span>
                                            {getTrendChart(project.trend)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-white text-sm font-medium">{project.healing}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <Link
                                                to={`/project/${project.id}`}
                                                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-gray-400 hover:text-white"
                                                title="View Project"
                                            >
                                                <Eye size={16} />
                                            </Link>
                                            <Link
                                                to={`/project/${project.id}/runs`}
                                                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-gray-400 hover:text-white"
                                                title="Run Tests"
                                            >
                                                <Play size={16} />
                                            </Link>
                                            <Link
                                                to={`/project/${project.id}/settings`}
                                                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-gray-400 hover:text-white"
                                                title="Settings"
                                            >
                                                <MoreVertical size={16} />
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t border-zinc-800 flex items-center justify-between">
                        <p className="text-gray-400 text-sm">Showing 1-10 of 124 projects</p>
                        <div className="flex items-center gap-2">
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
                                13
                            </button>
                            <button className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-gray-400 hover:text-white rounded-lg transition-all text-sm">
                                ›
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectList;
