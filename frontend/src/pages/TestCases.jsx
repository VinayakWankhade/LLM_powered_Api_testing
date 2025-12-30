import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Search, ArrowLeft, Play, Trash2, CheckCircle, Loader2, AlertTriangle, Eye, Activity, Shield, Zap } from 'lucide-react';
import { testsApi, projectsApi } from '../api';

const TestCases = () => {
    const { id } = useParams();
    const [testCases, setTestCases] = useState([]);
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Statuses');
    const [priorityFilter, setPriorityFilter] = useState('All Priorities');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [testData, projectData] = await Promise.all([
                    testsApi.list(id),
                    projectsApi.get(id)
                ]);
                setTestCases(testData);
                setProject(projectData);
            } catch (err) {
                console.error("Error fetching test cases:", err);
                setError("Failed to synchronize test repository.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const getStatusBadge = (status) => {
        const colors = {
            passed: 'bg-green-500/10 text-green-500 border-green-500/20',
            failed: 'bg-red-500/10 text-red-500 border-red-500/20',
            pending: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
            active: 'bg-cyan-light/10 text-cyan-light border-cyan-light/20',
        };
        const displayStatus = status || 'active';
        return (
            <span className={`inline-flex items-center px-2 py-0.5 border rounded text-[10px] font-black uppercase tracking-widest ${colors[displayStatus] || 'bg-zinc-800 text-zinc-400 border-zinc-700'}`}>
                {displayStatus}
            </span>
        );
    };

    const getPriorityBadge = (priority) => {
        const colors = {
            critical: 'text-red-500',
            high: 'text-orange-500',
            medium: 'text-yellow-500',
            low: 'text-zinc-500',
        };
        const displayPriority = priority?.toLowerCase() || 'medium';
        return (
            <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${colors[displayPriority] || 'text-zinc-400'}`}>
                {displayPriority}
            </span>
        );
    };

    const filteredTests = testCases.filter(t => {
        const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'All Statuses' || (t.status || 'active').toLowerCase() === statusFilter.toLowerCase();
        const matchesPriority = priorityFilter === 'All Priorities' || (t.priority || 'medium').toLowerCase() === priorityFilter.toLowerCase();
        return matchesSearch && matchesStatus && matchesPriority;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 size={48} className="text-purple animate-spin" />
                    <p className="text-gray-400 font-mono text-xs uppercase tracking-widest">Querying test matrix...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-8">
                <div className="text-center">
                    <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Repository Offline</h2>
                    <p className="text-gray-400 font-mono text-sm mb-6">{error}</p>
                    <Link to={`/project/${id}`} className="text-purple font-black uppercase text-xs tracking-widest hover:underline transition-all">Re-establish Connection</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="max-w-[1920px] mx-auto px-8 py-8">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] mb-6 text-zinc-500">
                    <Link to="/projects" className="hover:text-white transition-colors">PROJECTS</Link>
                    <span>/</span>
                    <Link to={`/project/${id}`} className="hover:text-white transition-colors capitalize">{project?.name}</Link>
                    <span>/</span>
                    <span className="text-purple-light underline decoration-purple/30 underline-offset-4">TEST REPOSITORY</span>
                </div>

                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h1 className="text-5xl font-black text-white tracking-tighter mb-2">Protocol Registry</h1>
                        <p className="text-zinc-500 text-sm font-medium tracking-tight">Managing {testCases.length} generated validation sequences for {project?.name}</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link
                            to={`/project/${id}/endpoints`}
                            className="flex items-center gap-2 px-6 py-3 bg-zinc-950 border border-white/5 hover:border-purple/30 text-zinc-400 hover:text-white rounded text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                            <ArrowLeft size={16} />
                            Return to Schema
                        </Link>
                        <button className="flex items-center gap-3 px-8 py-3 bg-purple hover:bg-purple-dark text-white text-[10px] font-black uppercase tracking-widest rounded transition-all shadow-xl shadow-purple/10">
                            <Play size={16} />
                            Execute Suite
                        </button>
                    </div>
                </div>

                {/* Filters Bar */}
                <div className="bg-zinc-900 border border-white/5 rounded-2xl p-8 mb-8 shadow-2xl">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-end">
                        {/* Search */}
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Search Protocols</label>
                            <div className="relative">
                                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600" />
                                <input
                                    type="text"
                                    placeholder="ID, ENDPOINT, OR TAGS..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-6 py-3.5 bg-black border border-white/5 rounded text-xs font-bold text-white placeholder:text-zinc-700 focus:border-purple focus:ring-1 focus:ring-purple/20 transition-all uppercase tracking-widest"
                                />
                            </div>
                        </div>

                        {/* Status Filter */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Filter by Status</label>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full px-4 py-3.5 bg-black border border-white/5 rounded text-xs font-bold text-white focus:border-purple appearance-none cursor-pointer tracking-widest uppercase transition-all"
                            >
                                <option>All Statuses</option>
                                <option>Active</option>
                                <option>Passed</option>
                                <option>Failed</option>
                                <option>Pending</option>
                            </select>
                        </div>

                        {/* Priority Filter */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Filter by Impact</label>
                            <select
                                value={priorityFilter}
                                onChange={(e) => setPriorityFilter(e.target.value)}
                                className="w-full px-4 py-3.5 bg-black border border-white/5 rounded text-xs font-bold text-white focus:border-purple appearance-none cursor-pointer tracking-widest uppercase transition-all"
                            >
                                <option>All Priorities</option>
                                <option>Critical</option>
                                <option>High</option>
                                <option>Medium</option>
                                <option>Low</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Bulk Actions */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <span className="text-zinc-600 text-[10px] font-black uppercase tracking-[0.2em] mr-2">BATCH OPERATIONS:</span>
                        <button className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 text-green-500 text-[10px] font-black uppercase tracking-widest rounded transition-all">
                            <CheckCircle size={14} />
                            Authorize Selection
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest rounded transition-all">
                            <Trash2 size={14} />
                            Purge Records
                        </button>
                    </div>

                    <div className="text-zinc-600 text-[10px] font-black uppercase tracking-widest">
                        Showing {filteredTests.length} of {testCases.length} protocols
                    </div>
                </div>

                {/* Table */}
                <div className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-white/5 bg-zinc-950/50">
                                <th className="px-8 py-5 w-12 text-center">
                                    <input
                                        type="checkbox"
                                        className="w-4 h-4 bg-black border-white/10 rounded text-purple focus:ring-0 cursor-pointer"
                                    />
                                </th>
                                <th className="px-6 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-center">Protocol Code</th>
                                <th className="px-6 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest">Sequence Description</th>
                                <th className="px-6 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-center">Terminal State</th>
                                <th className="px-6 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-center">Integrity Impact</th>
                                <th className="px-6 py-5 text-[10px] font-black text-zinc-500 uppercase tracking-widest text-center">Sync Date</th>
                                <th className="px-6 py-5 text-right"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredTests.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="px-8 py-24 text-center">
                                        <div className="flex flex-col items-center gap-4 text-zinc-600">
                                            <Zap size={48} className="opacity-20" />
                                            <p className="text-sm italic">No validation protocols matching your query criteria.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredTests.map((test) => (
                                    <tr key={test.id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors group">
                                        <td className="px-8 py-6 text-center">
                                            <input
                                                type="checkbox"
                                                className="w-4 h-4 bg-black border-white/10 rounded text-purple focus:ring-0 cursor-pointer"
                                            />
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <span className="text-zinc-400 text-xs font-mono font-bold tracking-tighter group-hover:text-purple-light transition-colors">{test.id}</span>
                                        </td>
                                        <td className="px-6 py-6 font-medium">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-white text-sm tracking-tight">{test.name}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-black text-cyan-light/60">{test.method}</span>
                                                    <span className="text-[10px] font-mono text-zinc-600 truncate max-w-[200px]">{test.path}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            {getStatusBadge(test.status)}
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            {getPriorityBadge(test.priority)}
                                        </td>
                                        <td className="px-6 py-6 text-center">
                                            <span className="text-zinc-500 text-[10px] font-black uppercase tracking-widest">
                                                {test.updatedAt ? new Date(test.updatedAt).toLocaleDateString() : 'UNTETHERED'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <Link
                                                to={`/project/${id}/test-case/${test.id}`}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-purple text-zinc-400 hover:text-white rounded text-[10px] font-black uppercase tracking-widest transition-all"
                                            >
                                                Analyze
                                                <Eye size={14} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {/* Footer / Performance Stats */}
                    <div className="px-8 py-6 bg-zinc-950/30 border-t border-white/5 flex items-center justify-between">
                        <div className="flex items-center gap-8">
                            <div className="flex items-center gap-2">
                                <Activity size={14} className="text-zinc-600" />
                                <span className="text-[10px] font-black text-zinc-500 tracking-widest uppercase">System Stability: <span className="text-green-500">92.4%</span></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Shield size={14} className="text-zinc-600" />
                                <span className="text-[10px] font-black text-zinc-500 tracking-widest uppercase">Coverage Index: <span className="text-purple-light">B1</span></span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <button className="p-2 border border-white/5 rounded hover:bg-zinc-800 transition-all text-zinc-600 hover:text-white">‹</button>
                            <span className="text-[10px] font-black text-zinc-500 px-4 uppercase tracking-widest">Page [01] of [01]</span>
                            <button className="p-2 border border-white/5 rounded hover:bg-zinc-800 transition-all text-zinc-600 hover:text-white">›</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestCases;
