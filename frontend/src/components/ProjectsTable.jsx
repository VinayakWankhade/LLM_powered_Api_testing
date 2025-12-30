import { Search, ChevronLeft, ChevronRight, Eye, Play, AlertCircle, Loader2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { projectsApi } from '../api';

const ProjectsTable = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                setLoading(true);
                const data = await projectsApi.list();
                setProjects(data);
            } catch (err) {
                console.error("Error loading projects:", err);
                setError("Failed to synchronize project data.");
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    const getStatusBadge = (status) => {
        const statusConfigs = {
            'active': 'bg-green-500/20 text-green-500 border-green-500',
            'scanning': 'bg-orange-500/20 text-orange-500 border-orange-500',
            'error': 'bg-red-500/20 text-red-500 border-red-500',
            'idle': 'bg-zinc-500/20 text-zinc-500 border-zinc-500',
        };

        const config = statusConfigs[status.toLowerCase()] || statusConfigs['idle'];

        return (
            <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wide border ${config}`}>
                {status}
            </span>
        );
    };

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

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
            <div className="overflow-x-auto min-h-[300px]">
                {loading ? (
                    <div className="flex flex-col items-center justify-center p-20 gap-4">
                        <Loader2 size={32} className="text-purple animate-spin" />
                        <p className="text-gray-500 text-sm">Loading project manifest...</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center p-20 text-center">
                        <AlertCircle size={32} className="text-red-500 mb-2" />
                        <p className="text-red-500 font-medium">{error}</p>
                    </div>
                ) : filteredProjects.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-20 text-center">
                        <p className="text-gray-500">No projects found. Create your first project to get started.</p>
                        <Link to="/add-project" className="mt-4 text-purple hover:text-purple-light underline">
                            Add New Project
                        </Link>
                    </div>
                ) : (
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
                            {filteredProjects.map((project) => (
                                <tr key={project.id} className="border-b border-zinc-800 hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-4">
                                        <Link to={`/project/${project.id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
                                            <div className="w-8 h-8 rounded-lg bg-purple/20 border border-purple/30 flex items-center justify-center flex-shrink-0">
                                                <span className="text-purple-light text-sm">📁</span>
                                            </div>
                                            <div>
                                                <p className="text-white font-medium text-sm">{project.name}</p>
                                                <p className="text-gray-500 text-xs line-clamp-1">{project.description}</p>
                                            </div>
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4">
                                        {getStatusBadge(project.status)}
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
                                        <span className="text-gray-400 text-sm">
                                            {project.lastActivity ? new Date(project.lastActivity).toLocaleDateString() : 'Never'}
                                        </span>
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
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Pagination */}
            <div className="p-4 border-t border-zinc-800 flex items-center justify-center gap-2">
                <button
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(p => p - 1)}
                    className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-gray-400 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ChevronLeft size={16} />
                </button>
                <button className="px-3 py-1.5 rounded-lg text-sm font-medium bg-purple text-white">
                    {currentPage}
                </button>
                <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-gray-400 hover:text-white">
                    <ChevronRight size={16} />
                </button>
            </div>
        </div>
    );
};

export default ProjectsTable;
