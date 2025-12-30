import { Search, Filter, Plus, ArrowUpDown, Eye, Play, MoreVertical, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { projectsApi } from '../api';

const ProjectList = () => {
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
                setProjects(data || []);
            } catch (err) {
                console.error("Failed to load project list:", err);
                setError("Could not retrieve projects from the server.");
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

        const config = statusConfigs[status?.toLowerCase()] || statusConfigs['idle'];

        return (
            <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wide border ${config}`}>
                {status || 'Unknown'}
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

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-black">
            <div className="max-w-[1920px] mx-auto px-8 py-8">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm mb-6">
                    <Link to="/" className="text-gray-500 hover:text-white transition-colors">Dashboard</Link>
                    <span className="text-gray-600">/</span>
                    <span className="text-white font-medium">Projects</span>
                </div>

                {/* Header */}
                <div className="mb-8 overflow-hidden">
                    <h1 className="text-4xl font-bold text-purple-light mb-2">Project List</h1>
                    {error && <p className="text-red-500 font-medium">{error}</p>}
                </div>

                {/* Controls Bar */}
                <div className="flex items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3 flex-1">
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
                    </div>

                    <Link
                        to="/add-project"
                        className="flex items-center gap-2 px-6 py-2.5 bg-purple hover:bg-purple-dark text-white font-semibold rounded-lg transition-all hover:shadow-glow-purple"
                    >
                        <Plus size={18} />
                        Add New Project
                    </Link>
                </div>

                {/* Table */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden min-h-[400px]">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center p-32 gap-4">
                            <Loader2 size={48} className="text-purple animate-spin" />
                            <p className="text-gray-400 font-medium">Fetching project inventory...</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-zinc-800 bg-zinc-950">
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Project Name</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Last Activity</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">APIs</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Test Success</th>
                                    <th className="px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProjects.map((project) => (
                                    <tr key={project.id} className="border-b border-zinc-800 hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4">
                                            <Link to={`/project/${project.id}`} className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-purple/20 border border-purple/30 flex items-center justify-center text-xl">
                                                    📁
                                                </div>
                                                <div>
                                                    <p className="text-white font-semibold text-sm">{project.name}</p>
                                                    <p className="text-gray-500 text-xs line-clamp-1">{project.description}</p>
                                                </div>
                                            </Link>
                                        </td>
                                        <td className="px-6 py-4">{getStatusBadge(project.status)}</td>
                                        <td className="px-6 py-4">
                                            <span className="text-gray-400 text-sm">
                                                {project.lastActivity ? new Date(project.lastActivity).toLocaleString() : 'Never'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-white text-sm font-medium">{project.endpoints}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <span className="text-white text-sm font-medium">{project.coverage}%</span>
                                                {getTrendChart(project.trend)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <Link to={`/project/${project.id}`} className="p-2 hover:bg-zinc-800 rounded-lg text-gray-400 hover:text-white"><Eye size={16} /></Link>
                                                <Link to={`/project/${project.id}/runs`} className="p-2 hover:bg-zinc-800 rounded-lg text-gray-400 hover:text-white"><Play size={16} /></Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {/* Footer */}
                    {!loading && (
                        <div className="px-6 py-4 border-t border-zinc-800 flex items-center justify-between">
                            <p className="text-gray-400 text-sm">Showing {filteredProjects.length} projects</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ProjectList;
