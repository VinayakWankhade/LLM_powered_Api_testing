import { Search, ChevronLeft, ChevronRight, Eye, Play, AlertCircle } from 'lucide-react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const ProjectsTable = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const projects = [
        {
            id: 1,
            name: 'E-Commerce API',
            description: 'Payment & Inventory',
            status: 'Active',
            statusColor: 'green',
            endpoints: 24,
            coverage: 92,
            lastRun: '2h ago',
        },
        {
            id: 2,
            name: 'User Management',
            description: 'Auth & Profiles',
            status: 'Scanning',
            statusColor: 'orange',
            endpoints: 18,
            coverage: 76,
            lastRun: '5h ago',
        },
        {
            id: 3,
            name: 'Analytics Engine',
            description: 'Data Processing',
            status: 'Error',
            statusColor: 'red',
            endpoints: 11,
            coverage: 45,
            lastRun: '1d ago',
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

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Active Projects</h3>
                <Link
                    to="/projects"
                    className="px-4 py-2 bg-purple hover:bg-purple-dark text-white text-sm font-semibold rounded-lg transition-all hover:shadow-glow-purple flex items-center gap-2"
                >
                    <Eye size={16} />
                    View All Projects
                </Link>
            </div>

            {/* Search */}
            <div className="p-6 border-b border-zinc-800">
                <div className="relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search projects..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/10 transition-all"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-zinc-800">
                            <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Project Name
                            </th>
                            <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Status
                            </th>
                            <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Endpoints
                            </th>
                            <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Coverage
                            </th>
                            <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Last Run
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
                                        <div className="w-8 h-8 rounded-lg bg-purple/20 border border-purple/30 flex items-center justify-center flex-shrink-0">
                                            <span className="text-purple-light text-sm">📁</span>
                                        </div>
                                        <div>
                                            <p className="text-white font-medium text-sm">{project.name}</p>
                                            <p className="text-gray-500 text-xs">{project.description}</p>
                                        </div>
                                    </Link>
                                </td>
                                <td className="px-6 py-4">
                                    {getStatusBadge(project.status, project.statusColor)}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-white text-sm">{project.endpoints}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 h-2 bg-zinc-800 rounded-full overflow-hidden max-w-[100px]">
                                            <div
                                                className="h-full bg-gradient-to-r from-cyan-light to-purple rounded-full transition-all"
                                                style={{ width: `${project.coverage}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-white text-sm font-medium">{project.coverage}%</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-gray-400 text-sm">{project.lastRun}</span>
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
                                        {project.status === 'Error' && (
                                            <Link
                                                to={`/project/${project.id}/settings`}
                                                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-red-500 hover:text-red-400"
                                                title="View Errors"
                                            >
                                                <AlertCircle size={16} />
                                            </Link>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-zinc-800 flex items-center justify-center gap-2">
                <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed">
                    <ChevronLeft size={16} />
                </button>
                {[1, 2, 3].map((page) => (
                    <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${currentPage === page
                            ? 'bg-purple text-white'
                            : 'text-gray-400 hover:bg-zinc-800 hover:text-white'
                            }`}
                    >
                        {page}
                    </button>
                ))}
                <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-gray-400 hover:text-white">
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
};

export default ProjectsTable;
