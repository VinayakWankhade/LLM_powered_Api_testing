import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Download, Play } from 'lucide-react';

const TestRunsList = () => {
    const { id } = useParams();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    const testRuns = [
        {
            id: 'run_a4b...',
            status: 'Success',
            statusColor: 'green',
            startedAt: '2025-11-24 14:30:15 UTC',
            duration: '1m 45s',
            passRate: 95,
            passCount: 1185,
            failCount: 55,
            triggeredBy: 'Jane Doe',
            triggeredByInitials: 'JD',
            triggeredByColor: 'orange',
            selfHealing: 'N/A',
        },
        {
            id: 'run_f9g...',
            status: 'Failed',
            statusColor: 'red',
            startedAt: '2025-11-24 12:05:40 UTC',
            duration: '2m 30s',
            passRate: 78,
            passCount: 920,
            failCount: 280,
            triggeredBy: 'System Automation',
            triggeredByInitials: 'SA',
            triggeredByColor: 'cyan',
            selfHealing: '2 Healed',
            healedCount: 2,
        },
        {
            id: 'run_k2l...',
            status: 'Running',
            statusColor: 'cyan',
            startedAt: '2025-11-24 15:10:00 UTC',
            duration: '...',
            passRate: 0,
            passCount: 0,
            failCount: 0,
            inProgress: true,
            triggeredBy: 'Jane Doe',
            triggeredByInitials: 'JD',
            triggeredByColor: 'orange',
            selfHealing: 'N/A',
        },
        {
            id: 'run_p6q...',
            status: 'Partial',
            statusColor: 'orange',
            startedAt: '2025-11-23 21:00:18 UTC',
            duration: '5m 12s',
            passRate: 89,
            passCount: 1050,
            failCount: 130,
            triggeredBy: 'Mike Kowalski',
            triggeredByInitials: 'MK',
            triggeredByColor: 'blue',
            selfHealing: '1 Healed',
            healedCount: 1,
        },
        {
            id: 'run_t3u...',
            status: 'Cancelled',
            statusColor: 'gray',
            startedAt: '2025-11-23 18:45:33 UTC',
            duration: '0m 33s',
            passRate: 0,
            passCount: 0,
            failCount: 0,
            triggeredBy: 'Jane Doe',
            triggeredByInitials: 'JD',
            triggeredByColor: 'orange',
            selfHealing: 'N/A',
        },
    ];

    const getStatusBadge = (status, color) => {
        const colors = {
            green: 'bg-green-500/20 text-green-500 border-green-500',
            red: 'bg-red-500/20 text-red-500 border-red-500',
            cyan: 'bg-cyan-light/20 text-cyan-light border-cyan-light',
            orange: 'bg-orange-500/20 text-orange-500 border-orange-500',
            gray: 'bg-gray-500/20 text-gray-400 border-gray-500',
        };

        return (
            <span className={`inline-flex items-center px-3 py-1 rounded border ${colors[color]} text-xs font-semibold uppercase tracking-wide`}>
                {status}
            </span>
        );
    };

    const getProgressBar = (passRate, inProgress) => {
        if (inProgress) {
            return (
                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div className="h-full bg-cyan-light animate-pulse" style={{ width: '50%' }}></div>
                </div>
            );
        }

        const failRate = 100 - passRate;
        return (
            <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden flex">
                <div className="h-full bg-green-500" style={{ width: `${passRate}%` }}></div>
                <div className="h-full bg-red-500" style={{ width: `${failRate}%` }}></div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-black">
            <div className="max-w-[1920px] mx-auto px-8 py-8">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm mb-6 text-gray-400">
                    <Link to="/dashboard" className="hover:text-white transition-colors">Project Dashboard</Link>
                    <span>/</span>
                    <span className="text-white">Test Runs List</span>
                </div>

                {/* Back Button */}
                <Link
                    to={`/project/${id}`}
                    className="inline-flex items-center gap-2 text-cyan-light hover:text-cyan transition-colors mb-6"
                >
                    <ArrowLeft size={18} />
                    Back to Project Dashboard
                </Link>

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-4xl font-bold text-white">Test Runs List</h1>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-800 hover:border-purple text-white rounded-lg transition-all">
                            <RefreshCw size={18} />
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-800 hover:border-cyan text-cyan-light rounded-lg transition-all">
                            <Download size={18} />
                            Export
                        </button>
                        <button className="flex items-center gap-2 px-6 py-2.5 bg-purple hover:bg-purple-dark text-white font-semibold rounded-lg transition-all hover:shadow-glow-purple">
                            <Play size={18} />
                            Run Tests
                        </button>
                    </div>
                </div>

                {/* Real-time Status Stream */}
                <div className="mb-6 px-4 py-2 bg-zinc-900 border border-cyan-light/30 rounded-lg">
                    <span className="text-cyan-light text-sm font-mono">Real-time Status Stream</span>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/10 transition-all appearance-none cursor-pointer"
                    >
                        <option>Filter by Status</option>
                        <option>Success</option>
                        <option>Failed</option>
                        <option>Running</option>
                        <option>Partial</option>
                        <option>Cancelled</option>
                    </select>

                    <input
                        type="number"
                        placeholder="Min Duration (s)"
                        className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/10 transition-all"
                    />

                    <input
                        type="number"
                        placeholder="Max Duration (s)"
                        className="px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/10 transition-all"
                    />

                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search Run ID"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/10 transition-all"
                        />
                        <button className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-purple hover:bg-purple-dark text-white text-sm font-semibold rounded transition-all">
                            🔍
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-zinc-800 bg-zinc-950">
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    Run ID
                                </th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    Started At
                                </th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    Duration
                                </th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    Pass/Fail Rate
                                </th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    Triggered By
                                </th>
                                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                    Self-Healing
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {testRuns.map((run) => (
                                <tr key={run.id} className="border-b border-zinc-800 hover:bg-white/[0.02] transition-colors">
                                    <td className="px-6 py-4">
                                        <Link
                                            to={`/project/${id}/run/${run.id}`}
                                            className="text-cyan-light hover:text-cyan font-mono text-sm transition-colors"
                                        >
                                            {run.id}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4">
                                        {getStatusBadge(run.status, run.statusColor)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-white text-sm">{run.startedAt}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-white text-sm">{run.duration}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-2">
                                            {getProgressBar(run.passRate, run.inProgress)}
                                            {!run.inProgress && (
                                                <div className="flex items-center gap-2 text-xs">
                                                    <span className="text-green-500">{run.passRate}%</span>
                                                </div>
                                            )}
                                            {run.inProgress && (
                                                <span className="text-cyan-light text-xs">In Progress</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className={`w-8 h-8 rounded-full bg-${run.triggeredByColor}-500 flex items-center justify-center text-white text-xs font-bold`}>
                                                {run.triggeredByInitials}
                                            </div>
                                            <span className="text-white text-sm">{run.triggeredBy}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {run.healedCount ? (
                                            <span className="px-3 py-1 bg-cyan-light/20 text-cyan-light border border-cyan-light/30 rounded text-xs font-semibold">
                                                {run.selfHealing}
                                            </span>
                                        ) : (
                                            <span className="text-gray-500 text-sm">{run.selfHealing}</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    <div className="px-6 py-4 border-t border-zinc-800 flex items-center justify-between">
                        <span className="text-gray-400 text-sm">Showing 1-5 of 128 runs</span>
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
                                26
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

export default TestRunsList;
