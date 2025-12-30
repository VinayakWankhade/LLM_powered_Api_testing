import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Search, Filter, RefreshCw, FileText, Eye, CheckCircle, AlertTriangle, Clock, Loader2 } from 'lucide-react';
import { endpointsApi, projectsApi, testsApi } from '../api';
import { useProjectWebSocket } from '../hooks/useProjectWebSocket';

const APIEndpoints = () => {
    const { id } = useParams();
    const [searchQuery, setSearchQuery] = useState('');
    const [endpoints, setEndpoints] = useState([]);
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [scanning, setScanning] = useState(false);
    const [generating, setGenerating] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [projectData, endpointData] = await Promise.all([
                    projectsApi.get(id),
                    endpointsApi.list(id)
                ]);
                setProject(projectData);
                setEndpoints(endpointData);
            } catch (err) {
                console.error("Error fetching endpoints:", err);
                setError("Failed to load endpoints for this project.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const { lastMessage } = useProjectWebSocket(id);
    const [scanProgress, setScanProgress] = useState({ percentage: 0, message: '' });

    useEffect(() => {
        if (!lastMessage) return;

        if (lastMessage.event === 'SCAN_PROGRESS') {
            setScanning(true);
            setScanProgress({
                percentage: lastMessage.percentage,
                message: lastMessage.message
            });
        }

        if (lastMessage.event === 'GENERATION_PROGRESS') {
            setGenerating(true);
            setScanProgress({
                percentage: lastMessage.percentage,
                message: lastMessage.message
            });
        }

        if (lastMessage.event === 'JOB_COMPLETED') {
            if (lastMessage.job_type === 'scan') {
                setScanning(false);
                setScanProgress({ percentage: 100, message: 'Scan Complete' });
                endpointsApi.list(id).then(data => setEndpoints(data));
            } else if (lastMessage.job_type === 'generation') {
                setGenerating(false);
                setScanProgress({ percentage: 100, message: 'Generation Complete' });
                setSelectedIds([]);
            }

            setTimeout(() => {
                setScanProgress({ percentage: 0, message: '' });
            }, 3000);
        }
    }, [lastMessage, id]);

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(filteredEndpoints.map(e => e.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (endpointId) => {
        if (selectedIds.includes(endpointId)) {
            setSelectedIds(selectedIds.filter(id => id !== endpointId));
        } else {
            setSelectedIds([...selectedIds, endpointId]);
        }
    };

    const handleGenerateTests = async () => {
        if (selectedIds.length === 0) return;
        try {
            setGenerating(true);
            await testsApi.generate(id, selectedIds);
            // Progress will be handled by WS
        } catch (err) {
            console.error("Test generation failed:", err);
            alert("Failed to start test generation.");
            setGenerating(false);
        }
    };

    const handleRescan = async () => {
        try {
            setScanning(true);
            const response = await endpointsApi.scan(id);
            // In a real app, we might poll or wait for WebSocket event here
            // For now, let's just show a message or re-fetch after a delay
            alert(`Scan initiated. Scan ID: ${response.scanId}`);
            // Briefly refresh the list (though scan is async)
            const refreshedEndpoints = await endpointsApi.list(id);
            setEndpoints(refreshedEndpoints);
        } catch (err) {
            console.error("Scan failed:", err);
            alert("Failed to initiate scan.");
        } finally {
            setScanning(false);
        }
    };

    const stats = [
        { label: 'Total Endpoints', value: endpoints.length, color: 'white' },
        { label: 'Scanned', value: endpoints.filter(e => e.status === 'scanned').length, color: 'green' },
        { label: 'Unscanned', value: endpoints.filter(e => e.status === 'unscanned').length, color: 'gray' },
        { label: 'Errors', value: endpoints.filter(e => e.status === 'error').length, color: 'red' },
    ];

    const getMethodBadge = (method) => {
        const colors = {
            GET: 'bg-green-500/20 text-green-500 border-green-500',
            POST: 'bg-cyan-light/20 text-cyan-light border-cyan-light',
            PUT: 'bg-orange-500/20 text-orange-500 border-orange-500',
            DELETE: 'bg-red-500/20 text-red-500 border-red-500',
            PATCH: 'bg-purple/20 text-purple border-purple',
        };

        return (
            <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-bold uppercase tracking-wide border ${colors[method] || 'bg-gray-500/20 text-gray-500 border-gray-500'}`}>
                {method}
            </span>
        );
    };

    const getStatusBadge = (status) => {
        const configs = {
            scanned: { color: 'bg-green-500/20 text-green-500 border-green-500', Icon: CheckCircle, label: 'Scanned' },
            unscanned: { color: 'bg-gray-500/20 text-gray-400 border-gray-500', Icon: Clock, label: 'Unscanned' },
            error: { color: 'bg-red-500/20 text-red-500 border-red-500', Icon: AlertTriangle, label: 'Error' },
            warning: { color: 'bg-orange-500/20 text-orange-500 border-orange-500', Icon: AlertTriangle, label: 'Warning' },
        };

        const config = configs[status.toLowerCase()] || configs.unscanned;
        const { color, Icon, label } = config;

        return (
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wide border ${color}`}>
                <Icon size={12} />
                {label}
            </span>
        );
    };

    const filteredEndpoints = endpoints.filter(e =>
        e.path.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 size={48} className="text-purple animate-spin" />
                    <p className="text-gray-400">Loading endpoint directory...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black">
            <div className="max-w-[1920px] mx-auto px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-1">
                                Project: {project?.name || 'Loading...'}
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
                                <span className={`text-${stat.color === 'white' ? 'white' : stat.color + '-500'} text-2xl font-bold`}>
                                    {stat.value}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Progress Bar */}
                {(scanning || generating || scanProgress.percentage > 0) && (
                    <div className="mb-8 p-6 bg-zinc-900/50 border border-purple/20 rounded-xl relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-2 z-10 relative">
                            <div className="flex items-center gap-3">
                                <Loader2 size={18} className="text-purple animate-spin" />
                                <span className="text-purple-light font-bold text-sm uppercase tracking-wider">{scanProgress.message || 'Initializing Scanner...'}</span>
                            </div>
                            <span className="text-white font-black text-lg">{scanProgress.percentage}%</span>
                        </div>
                        <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden z-10 relative">
                            <div
                                className="h-full bg-gradient-to-r from-purple to-cyan-light transition-all duration-300 ease-out"
                                style={{ width: `${scanProgress.percentage}%` }}
                            ></div>
                        </div>
                        {/* Background Glow */}
                        <div className="absolute inset-0 bg-purple/5 animate-pulse"></div>
                    </div>
                )}

                {/* Controls Bar */}
                <div className="flex items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3 flex-1">
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

                        <select className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/10 transition-all appearance-none cursor-pointer">
                            <option>Filter by Method</option>
                            <option>GET</option>
                            <option>POST</option>
                            <option>PUT</option>
                            <option>DELETE</option>
                        </select>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3">
                        <button className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 hover:border-purple text-white rounded-lg transition-all flex items-center gap-2">
                            <FileText size={18} />
                            <span className="font-medium">Bulk Actions</span>
                        </button>
                        <button
                            onClick={handleRescan}
                            disabled={scanning}
                            className="px-4 py-2.5 bg-cyan-light hover:bg-cyan text-black font-semibold rounded-lg transition-all flex items-center gap-2 hover:shadow-glow-cyan disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {scanning ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                            {scanning ? 'Scanning...' : 'Rescan Codebase'}
                        </button>
                        <button
                            onClick={handleGenerateTests}
                            disabled={generating || selectedIds.length === 0}
                            className="px-4 py-2.5 bg-purple hover:bg-purple-dark disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-all flex items-center gap-2 hover:shadow-glow-purple">
                            {generating ? <Loader2 size={18} className="animate-spin" /> : <FileText size={18} />}
                            Generate Tests ({selectedIds.length})
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-zinc-800 bg-zinc-950">
                                <th className="text-left px-6 py-4 w-12">
                                    <input
                                        type="checkbox"
                                        checked={filteredEndpoints.length > 0 && selectedIds.length === filteredEndpoints.length}
                                        onChange={handleSelectAll}
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
                            {filteredEndpoints.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center text-gray-500">
                                        No endpoints found. Try rescanning the codebase or adjusting your search.
                                    </td>
                                </tr>
                            ) : (
                                filteredEndpoints.map((endpoint) => (
                                    <tr key={endpoint.id} className="border-b border-zinc-800 hover:bg-white/[0.02] transition-colors">
                                        <td className="px-6 py-4">
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(endpoint.id)}
                                                onChange={() => handleSelectOne(endpoint.id)}
                                                className="w-4 h-4 bg-zinc-800 border-zinc-700 rounded text-purple focus:ring-2 focus:ring-purple/10"
                                            />
                                        </td>
                                        <td className="px-6 py-4">
                                            {getMethodBadge(endpoint.method)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-white text-sm font-mono">{endpoint.path}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {getStatusBadge(endpoint.status)}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Link
                                                to={`/project/${id}/endpoint/${endpoint.id}`}
                                                className="text-purple-light text-sm font-medium hover:text-purple transition-colors flex items-center gap-1"
                                            >
                                                <Eye size={14} />
                                                View Details
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {/* Footer */}
                    {!loading && filteredEndpoints.length > 0 && (
                        <div className="px-6 py-4 border-t border-zinc-800 flex items-center justify-between">
                            <p className="text-gray-400 text-sm">Showing {filteredEndpoints.length} endpoints</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default APIEndpoints;
