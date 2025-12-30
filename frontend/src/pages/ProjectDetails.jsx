import { useState, useEffect } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Play, Settings, Loader2, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { projectsApi } from '../api';

const ProjectDetails = () => {
    const { id } = useParams();
    const location = useLocation();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Determine active tab from URL if possible, otherwise default to overview
    const pathParts = location.pathname.split('/');
    const tabFromUrl = pathParts[pathParts.length - 1] === id ? 'overview' : pathParts[pathParts.length - 1];
    const [activeTab, setActiveTab] = useState(tabFromUrl || 'overview');

    useEffect(() => {
        const fetchProject = async () => {
            try {
                setLoading(true);
                const data = await projectsApi.get(id);
                setProject(data);
            } catch (err) {
                console.error("Error fetching project details:", err);
                setError("Failed to load project manifest.");
            } finally {
                setLoading(false);
            }
        };

        fetchProject();
    }, [id]);

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'endpoints', label: 'API Endpoints' },
        { id: 'test-cases', label: 'Test Cases' },
        { id: 'runs', label: 'Runs' },
    ];

    const getStatusBadge = (status) => {
        const configs = {
            passed: 'bg-green-500/20 text-green-500 border-green-500',
            failed: 'bg-red-500/20 text-red-500 border-red-500',
            partial: 'bg-orange-500/20 text-orange-500 border-orange-500',
            running: 'bg-purple/20 text-purple border-purple',
        };

        return (
            <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wide border ${configs[status.toLowerCase()] || 'bg-zinc-500/20 text-zinc-400 border-zinc-700'}`}>
                {status}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 size={48} className="text-purple animate-spin" />
                    <p className="text-gray-400">Synchronizing project core...</p>
                </div>
            </div>
        );
    }

    if (error || !project) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-center p-8">
                <div>
                    <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Access Denied or Not Found</h2>
                    <p className="text-gray-400 mb-6">{error || "The requested project could not be localized."}</p>
                    <Link to="/projects" className="text-purple hover:underline flex items-center justify-center gap-2">
                        <ArrowLeft size={16} /> Return to Inventory
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="max-w-[1920px] mx-auto px-8 py-8">
                {/* project Header */}
                <div className="mb-8">
                    <Link to="/projects" className="inline-flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-4 group text-sm font-medium">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Inventory
                    </Link>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">{project.name}</h1>
                            <p className="text-gray-400 max-w-2xl">{project.description}</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-white/10 ${project.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-zinc-800 text-gray-400'}`}>
                                {project.status}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-8 border-b border-white/5 mb-8">
                    {tabs.map((tab) => (
                        <Link
                            key={tab.id}
                            to={tab.id === 'overview' ? `/project/${id}` : `/project/${id}/${tab.id}`}
                            onClick={() => setActiveTab(tab.id)}
                            className={`pb-4 px-2 text-sm font-semibold transition-all relative ${activeTab === tab.id
                                ? 'text-purple-light'
                                : 'text-zinc-500 hover:text-white'
                                }`}
                        >
                            {tab.label}
                            {activeTab === tab.id && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-light shadow-[0_0_10px_rgba(168,85,247,0.5)]"></span>
                            )}
                        </Link>
                    ))}
                </div>

                {/* Overview Tab Content */}
                {activeTab === 'overview' && (
                    <div className="animate-in fade-in duration-500">
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {/* API Endpoint Summary */}
                            <div className="bg-zinc-900 border border-white/5 rounded-xl p-6 hover:border-purple/30 transition-colors">
                                <h3 className="text-cyan-light text-xs font-bold uppercase tracking-widest mb-4">API Manifest</h3>
                                <div className="flex items-baseline gap-2 mb-2">
                                    <span className="text-4xl font-black text-white">{project.endpoints}</span>
                                    <span className="text-gray-500 text-sm">Endpoints</span>
                                </div>
                                <div className="mt-6">
                                    <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
                                        <span>System Coverage</span>
                                        <span>{project.coverage}%</span>
                                    </div>
                                    <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-purple to-purple-light rounded-full transition-all duration-1000"
                                            style={{ width: `${project.coverage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            {/* Test Execution summary */}
                            <div className="bg-zinc-900 border border-white/5 rounded-xl p-6 hover:border-purple/30 transition-colors">
                                <h3 className="text-cyan-light text-xs font-bold uppercase tracking-widest mb-4">Test Efficiency</h3>
                                <div className="flex items-baseline gap-2 mb-2">
                                    <span className="text-4xl font-black text-white">{project.stats?.testsCount || 0}</span>
                                    <span className="text-gray-500 text-sm">Case Count</span>
                                </div>
                                <div className="grid grid-cols-2 gap-2 mt-4 text-[10px] text-zinc-500 uppercase tracking-tighter">
                                    <div className="flex items-center gap-1.5 p-2 bg-black/40 rounded">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
                                        <span>Pass: {Math.round((project.stats?.passRate || 0) * (project.stats?.testsCount || 0) / 100)}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 p-2 bg-black/40 rounded">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                        <span>Fail: {project.stats?.failedCount || 0}</span>
                                    </div>
                                </div>
                            </div>

                            {/* AI Effectiveness */}
                            <div className="bg-zinc-900 border border-white/5 rounded-xl p-6 hover:border-purple/30 transition-colors relative overflow-hidden group">
                                <h3 className="text-cyan-light text-xs font-bold uppercase tracking-widest mb-4">AI Effectiveness</h3>
                                <div className="flex items-center gap-4">
                                    <div className="relative w-16 h-16">
                                        <svg className="w-16 h-16 transform -rotate-90">
                                            <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="none" className="text-zinc-800" />
                                            <circle
                                                cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="none"
                                                strokeDasharray={`${2 * Math.PI * 28}`}
                                                strokeDashoffset={`${2 * Math.PI * 28 * (1 - (project.stats?.passRate || 0) / 100)}`}
                                                className="text-purple group-hover:text-purple-light transition-colors" opacity="0.8"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center font-black text-sm text-purple-light">
                                            {project.stats?.passRate || 0}%
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-black text-white">{project.stats?.healedCount || 0}</p>
                                        <p className="text-xs text-zinc-500">Self-Healed</p>
                                    </div>
                                </div>
                            </div>

                            {/* Project DNA (Actions) */}
                            <div className="bg-zinc-900 border border-white/5 rounded-xl p-6 flex flex-col justify-between hover:border-purple/30 transition-colors">
                                <h3 className="text-cyan-light text-xs font-bold uppercase tracking-widest mb-2">Project Control</h3>
                                <div className="space-y-2">
                                    <Link
                                        to={`/project/${id}/endpoints`}
                                        className="flex items-center justify-between w-full px-4 py-2 bg-purple/10 border border-purple/30 hover:bg-purple/20 text-purple-light rounded text-xs font-bold transition-all"
                                    >
                                        <span>ANALYZE NODES</span>
                                        <ArrowLeft size={12} className="rotate-180" />
                                    </Link>
                                    <Link
                                        to={`/project/${id}/test-cases`}
                                        className="flex items-center justify-between w-full px-4 py-2 bg-cyan-light/10 border border-cyan-light/30 hover:bg-cyan-light/20 text-cyan-light rounded text-xs font-bold transition-all"
                                    >
                                        <span>EXECUTE OPS</span>
                                        <Play size={12} />
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Recent History */}
                        <div className="bg-zinc-900 border border-white/5 rounded-xl overflow-hidden shadow-2xl">
                            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-zinc-950">
                                <h3 className="text-lg font-black tracking-widest uppercase text-white">Recent Execution History</h3>
                                <Link to={`/project/${id}/runs`} className="text-purple-light text-xs font-bold hover:text-purple transition-all underline underline-offset-4 decoration-purple/30">
                                    VIEW FULL LOGS
                                </Link>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="border-b border-white/5 bg-black/40">
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Status</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Operation ID</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Scope</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Pass Rate</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Healed</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Stability</th>
                                            <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Timestamp</th>
                                            <th className="px-6 py-4"></th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {(project.recentRuns || []).length === 0 ? (
                                            <tr>
                                                <td colSpan="8" className="px-6 py-12 text-center text-zinc-600 italic text-sm">
                                                    No prior execution data detected in local indices.
                                                </td>
                                            </tr>
                                        ) : (
                                            project.recentRuns.map((run) => (
                                                <tr key={run.id} className="hover:bg-white/[0.02] transition-colors group">
                                                    <td className="px-6 py-4">
                                                        {getStatusBadge(run.status)}
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-purple-light text-xs font-mono font-bold">NODE-{run.id?.toString().padStart(6, '0')}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-white text-xs font-medium">Global</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-green-500 text-xs font-black">{run.passRate}%</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className="text-cyan-light text-xs font-bold">{run.healedCount}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="w-16 h-1 bg-zinc-800 rounded-full overflow-hidden">
                                                            <div className="h-full bg-cyan-light" style={{ width: `${run.passRate}%` }}></div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-zinc-500 text-[10px] uppercase font-bold">
                                                        {new Date(run.startTime).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <Link to={`/project/${id}/run/${run.id}`} className="text-white/20 group-hover:text-purple transition-all">
                                                            <Settings size={14} />
                                                        </Link>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProjectDetails;
