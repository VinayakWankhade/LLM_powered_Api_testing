import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Search, ChevronDown, Eye, Loader2, AlertTriangle, CheckCircle, BarChart2, Globe, Shield } from 'lucide-react';
import { analyticsApi, endpointsApi, projectsApi } from '../api';

const CoverageReport = () => {
    const { id } = useParams();
    const [analytics, setAnalytics] = useState(null);
    const [endpoints, setEndpoints] = useState([]);
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [methodFilter, setMethodFilter] = useState('All Methods');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [analyticsData, endpointData, projectData] = await Promise.all([
                    analyticsApi.getProjectAnalytics(id),
                    endpointsApi.list(id),
                    projectsApi.get(id)
                ]);
                setAnalytics(analyticsData);
                setEndpoints(endpointData);
                setProject(projectData);
            } catch (err) {
                console.error("Error fetching coverage data:", err);
                setError("Failed to generate coverage report for this node.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const coverageStats = analytics ? [
        { label: 'System Coverage', value: `${analytics.coveragePercent}%`, subtext: 'Aggregate URI reachability', color: 'purple', Icon: BarChart2 },
        { label: 'Manifest Sync', value: `${analytics.coveredEndpoints}/${analytics.totalEndpoints}`, subtext: 'Mapped vs Identified nodes', color: 'cyan', Icon: Globe },
        { label: 'Security Stability', value: `${analytics.testPassRate}%`, subtext: 'Operation success rate', color: 'orange', Icon: Shield },
        { label: 'AI Healing Efficiency', value: analytics.healedTests.toString(), subtext: 'Autonomously repaired cases', color: 'blue', Icon: CheckCircle },
    ] : [];

    const criticalGaps = endpoints.filter(e => e.status === 'unscanned' || e.status === 'error').slice(0, 5);

    const getMethodBadge = (method) => {
        const colors = {
            GET: 'bg-green-500/20 text-green-500 border-green-500',
            POST: 'bg-cyan-light/20 text-cyan-light border-cyan-light',
            PUT: 'bg-orange-500/20 text-orange-500 border-orange-500',
            DELETE: 'bg-red-500/20 text-red-500 border-red-500',
        };
        return (
            <span className={`px-2 py-0.5 border ${colors[method] || 'bg-zinc-500/20 text-zinc-400 border-zinc-700'} text-xs font-bold rounded`}>
                {method}
            </span>
        );
    };

    const filteredEndpoints = endpoints.filter(e => {
        const matchesSearch = e.path.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesMethod = methodFilter === 'All Methods' || e.method === methodFilter;
        return matchesSearch && matchesMethod;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 size={48} className="text-purple animate-spin" />
                    <p className="text-gray-400">Compiling coverage audit...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-8">
                <div className="text-center">
                    <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-white mb-2">Audit Failed</h2>
                    <p className="text-gray-400 mb-6">{error}</p>
                    <Link to={`/project/${id}`} className="text-purple hover:underline">Return to Module Dashboard</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="max-w-[1920px] mx-auto px-8 py-8">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest mb-6 text-zinc-500">
                    <Link to="/projects" className="hover:text-white transition-colors">PROJECTS</Link>
                    <span>/</span>
                    <Link to={`/project/${id}`} className="hover:text-white transition-colors uppercase">{project?.name || 'NODE'}</Link>
                    <span>/</span>
                    <span className="text-purple-light">COVERAGE AUDIT</span>
                </div>

                {/* Back Button */}
                <Link
                    to={`/project/${id}`}
                    className="inline-flex items-center gap-2 text-cyan-light hover:text-cyan transition-colors mb-6 text-sm font-bold uppercase tracking-tighter"
                >
                    <ArrowLeft size={16} />
                    Return to Overview
                </Link>

                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h1 className="text-5xl font-black text-white tracking-tighter mb-2">System Coverage Audit</h1>
                        <p className="text-gray-500">Comprehensive reachability and stability analysis for {project?.name}</p>
                    </div>
                </div>

                {/* Coverage Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {coverageStats.map((stat, index) => (
                        <div key={index} className="bg-zinc-900 border border-white/5 rounded-xl p-8 relative overflow-hidden group hover:border-purple/30 transition-all">
                            <div className="flex items-center justify-between mb-6">
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{stat.label}</span>
                                <stat.Icon size={20} className="text-zinc-700 group-hover:text-purple transition-colors" />
                            </div>
                            <div className={`text-5xl font-black text-white mb-2 tracking-tighter`}>{stat.value}</div>
                            <div className="text-xs text-zinc-500 font-medium">{stat.subtext}</div>
                            <div className={`absolute bottom-0 left-0 h-1 bg-${stat.color === 'purple' ? 'purple' : stat.color + '-light'} w-full opacity-30 group-hover:opacity-100 transition-opacity`}></div>
                        </div>
                    ))}
                </div>

                {/* Critical Coverage Gaps */}
                {criticalGaps.length > 0 && (
                    <div className="bg-zinc-950 border border-red-900/30 rounded-xl p-8 mb-12 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-12 opacity-5">
                            <AlertTriangle size={200} className="text-red-500" />
                        </div>
                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-red-500/10 rounded-lg">
                                    <AlertTriangle size={24} className="text-red-500" />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-black text-white tracking-tight">Vulnerability Manifest</h2>
                                    <p className="text-red-500/60 text-sm font-bold uppercase tracking-widest">Immediate action recommended for {criticalGaps.length} nodes</p>
                                </div>
                            </div>
                            <button className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-black text-xs uppercase tracking-widest rounded transition-all shadow-lg shadow-red-500/20">
                                Initiate Batch Scan
                            </button>
                        </div>

                        <div className="space-y-2 relative z-10">
                            {criticalGaps.map((gap, index) => (
                                <div key={index} className="flex items-center justify-between p-4 bg-black/40 border border-white/5 rounded hover:bg-black/60 transition-colors">
                                    <div className="flex items-center gap-4 flex-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></div>
                                        <div>
                                            <div className="text-white text-sm font-mono font-bold">{gap.path}</div>
                                            <div className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">RISK: HIGH • STATUS: {gap.status}</div>
                                        </div>
                                    </div>
                                    <Link to={`/project/${id}/endpoints`} className="text-red-500 font-black text-[10px] uppercase tracking-widest hover:text-white transition-colors">
                                        Analyze Gap →
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Detailed Manifest */}
                <div className="bg-zinc-900 border border-white/5 rounded-2xl p-8 shadow-2xl">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-black text-white tracking-tight uppercase">Detailed Manifest Analysis</h2>

                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                                <input
                                    type="text"
                                    placeholder="SEARCH PROTOCOLS..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="px-10 py-2.5 bg-black border border-white/10 rounded text-xs font-bold uppercase tracking-widest focus:border-purple transition-all w-64"
                                />
                            </div>
                            <select
                                value={methodFilter}
                                onChange={(e) => setMethodFilter(e.target.value)}
                                className="px-4 py-2.5 bg-black border border-white/10 rounded text-xs font-bold uppercase tracking-widest focus:border-purple transition-all appearance-none cursor-pointer"
                            >
                                <option>All Methods</option>
                                <option>GET</option>
                                <option>POST</option>
                                <option>PUT</option>
                                <option>DELETE</option>
                            </select>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-white/5">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Node Identification</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Method Pool</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Verification Status</th>
                                    <th className="px-6 py-4"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEndpoints.length === 0 ? (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-20 text-center text-zinc-600 italic text-sm">
                                            No nodes matching your query criteria were found in the manifest.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredEndpoints.map((endpoint, index) => (
                                        <tr key={index} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="text-white font-mono text-xs font-bold">{endpoint.path}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {getMethodBadge(endpoint.method)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex-1 max-w-[150px] h-1 bg-zinc-800 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full ${endpoint.status === 'scanned' ? 'bg-purple' : 'bg-zinc-700'}`}
                                                            style={{ width: endpoint.status === 'scanned' ? '100%' : '5%' }}
                                                        ></div>
                                                    </div>
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${endpoint.status === 'scanned' ? 'text-purple' : 'text-zinc-600'}`}>
                                                        {endpoint.status}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Link
                                                    to={`/project/${id}/endpoints`}
                                                    className="p-2 bg-white/5 rounded hover:bg-purple hover:text-white transition-all inline-block"
                                                >
                                                    <Eye size={14} />
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Aggregate Summary */}
                <div className="grid grid-cols-3 gap-8 mt-12 bg-zinc-950 border border-white/5 rounded-xl p-10">
                    <div className="text-center group">
                        <div className="text-6xl font-black text-white mb-2 group-hover:text-purple transition-colors">{analytics?.coveragePercent || 0}%</div>
                        <div className="text-xs font-black uppercase tracking-[0.2em] text-zinc-600">Aggregate Integrity</div>
                    </div>
                    <div className="text-center group">
                        <div className="text-6xl font-black text-white mb-2 group-hover:text-cyan-light transition-colors">{Math.round((analytics?.coveredEndpoints || 0) / (analytics?.totalEndpoints || 1) * 100)}%</div>
                        <div className="text-xs font-black uppercase tracking-[0.2em] text-zinc-600">Node Registration</div>
                    </div>
                    <div className="text-center group">
                        <div className="text-6xl font-black text-white mb-2 group-hover:text-orange-500 transition-colors">{analytics?.testPassRate || 0}%</div>
                        <div className="text-xs font-black uppercase tracking-[0.2em] text-zinc-600">Protocol Stability</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CoverageReport;
