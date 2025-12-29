import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Play, Settings } from 'lucide-react';

const ProjectDetails = () => {
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState('overview');

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'endpoints', label: 'API Endpoints' },
        { id: 'test-cases', label: 'Test Cases' },
        { id: 'runs', label: 'Runs' },
    ];

    const testRuns = [
        {
            id: 1,
            status: 'Passed',
            statusColor: 'green',
            runId: 'run-4fh1r2f3',
            totalTests: 5120,
            passed: 5115,
            failed: 5,
            healed: 2,
            duration: '12m 34s',
            date: '2025-10-11',
        },
        {
            id: 2,
            status: 'Failed',
            statusColor: 'red',
            runId: 'run-s5Lj6g2d8',
            totalTests: 5120,
            passed: 5080,
            failed: 40,
            healed: 15,
            duration: '15m 02s',
            date: '2025-10-10',
        },
        {
            id: 3,
            status: 'Passed',
            statusColor: 'green',
            runId: 'run-t5j9k4a12',
            totalTests: 5095,
            passed: 5095,
            failed: 0,
            healed: 0,
            duration: '11m 55s',
            date: '2025-10-09',
        },
        {
            id: 4,
            status: 'Partial',
            statusColor: 'orange',
            runId: 'run-p3hd6k5e4',
            totalTests: 4800,
            passed: 4750,
            failed: 50,
            healed: 22,
            duration: '13m 10s',
            date: '2025-10-08',
        },
    ];

    const getStatusBadge = (status, color) => {
        const colors = {
            green: 'bg-green-500/20 text-green-500 border-green-500',
            red: 'bg-red-500/20 text-red-500 border-red-500',
            orange: 'bg-orange-500/20 text-orange-500 border-orange-500',
        };

        return (
            <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wide border ${colors[color]}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-black">
            <div className="max-w-[1920px] mx-auto px-8 py-8">
                {/* Tabs */}
                <div className="flex items-center gap-8 border-b border-zinc-800 mb-8">
                    {tabs.map((tab) => (
                        <Link
                            key={tab.id}
                            to={tab.id === 'overview' ? `/project/${id}` : `/project/${id}/${tab.id}`}
                            onClick={() => setActiveTab(tab.id)}
                            className={`pb-4 px-2 text-sm font-medium transition-all relative ${activeTab === tab.id
                                ? 'text-purple-light'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            {tab.label}
                            {activeTab === tab.id && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-light"></span>
                            )}
                        </Link>
                    ))}
                </div>

                {/* Overview Tab Content */}
                {activeTab === 'overview' && (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                            {/* API Endpoint Summary */}
                            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                                <h3 className="text-cyan-light text-sm font-bold mb-4">API Endpoint Summary</h3>
                                <div className="flex items-baseline gap-2 mb-2">
                                    <span className="text-4xl font-bold text-white">2,480</span>
                                    <span className="text-green-500 text-sm font-semibold">+12</span>
                                </div>
                                <div className="flex items-center justify-between text-xs text-gray-400 mb-4">
                                    <span>Total</span>
                                    <span>New</span>
                                </div>
                                <div>
                                    <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                                        <span>API Spec Coverage</span>
                                    </div>
                                    <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-purple to-purple-light rounded-full" style={{ width: '85%' }}></div>
                                    </div>
                                </div>
                            </div>

                            {/* Test Generation Status */}
                            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                                <h3 className="text-cyan-light text-sm font-bold mb-4">Test Generation Status</h3>
                                <div className="mb-4">
                                    <span className="inline-flex items-center px-2.5 py-1 rounded text-xs font-semibold uppercase tracking-wide border bg-purple/20 text-purple-light border-purple">
                                        In Progress
                                    </span>
                                </div>
                                <div className="mb-2">
                                    <span className="text-3xl font-bold text-white">10,512</span>
                                    <p className="text-xs text-gray-400">Tests Generated</p>
                                </div>
                                <div>
                                    <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                                        <span>Endpoint Scanning: 95%</span>
                                    </div>
                                    <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-cyan-light to-cyan rounded-full" style={{ width: '95%' }}></div>
                                    </div>
                                </div>
                            </div>

                            {/* Last Test Run */}
                            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                                <h3 className="text-cyan-light text-sm font-bold mb-4">Last Test Run</h3>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="relative w-20 h-20">
                                        <svg className="w-20 h-20 transform -rotate-90">
                                            <circle
                                                cx="40"
                                                cy="40"
                                                r="35"
                                                stroke="currentColor"
                                                strokeWidth="8"
                                                fill="none"
                                                className="text-zinc-800"
                                            />
                                            <circle
                                                cx="40"
                                                cy="40"
                                                r="35"
                                                stroke="currentColor"
                                                strokeWidth="8"
                                                fill="none"
                                                strokeDasharray={`${2 * Math.PI * 35}`}
                                                strokeDashoffset={`${2 * Math.PI * 35 * (1 - 98.2 / 100)}`}
                                                className="text-green-500"
                                                strokeLinecap="round"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="text-lg font-bold text-green-500">98%</span>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-green-500">98.2%</p>
                                        <p className="text-xs text-gray-400">Pass Rate</p>
                                    </div>
                                </div>
                                <div className="space-y-1 text-xs text-gray-400">
                                    <p>Duration: 12m 34s</p>
                                    <p>Completed: Oct 11, 2025</p>
                                </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                                <h3 className="text-cyan-light text-sm font-bold mb-4">Quick Actions</h3>
                                <div className="space-y-3">
                                    <Link
                                        to={`/project/${id}/endpoints`}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple hover:bg-purple-dark text-white text-sm font-semibold rounded-lg transition-all"
                                    >
                                        <span className="text-base">📋</span>
                                        Manage Endpoints
                                    </Link>
                                    <Link
                                        to={`/project/${id}/generate-tests`}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-purple hover:bg-purple-dark text-white text-sm font-semibold rounded-lg transition-all"
                                    >
                                        <span className="text-base">🧪</span>
                                        Generate Tests
                                    </Link>
                                    <Link
                                        to={`/project/${id}/runs`}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-cyan-light hover:bg-cyan text-black text-sm font-semibold rounded-lg transition-all"
                                    >
                                        <Play size={16} />
                                        View Test Runs
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Recent Test Runs */}
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                                <h3 className="text-xl font-bold text-white">Recent Test Runs</h3>
                                <Link to={`/project/${id}/runs`} className="text-purple-light text-sm font-medium hover:text-purple transition-colors flex items-center gap-1">
                                    View All →
                                </Link>
                            </div>

                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-zinc-800 bg-zinc-950">
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Run ID</th>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Tests</th>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Passed</th>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Failed</th>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Healed</th>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Duration</th>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                                        <th className="text-left px-6 py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {testRuns.map((run) => (
                                        <tr key={run.id} className="border-b border-zinc-800 hover:bg-white/[0.02] transition-colors">
                                            <td className="px-6 py-4">
                                                {getStatusBadge(run.status, run.statusColor)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-purple-light text-sm font-mono">{run.runId}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-white text-sm">{run.totalTests.toLocaleString()}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-green-500 text-sm font-medium">{run.passed.toLocaleString()}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-red-500 text-sm font-medium">{run.failed}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-cyan-light text-sm font-medium">{run.healed}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-gray-400 text-sm">{run.duration}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-gray-400 text-sm">{run.date}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Link
                                                    to={`/project/${id}/run/${run.id}`}
                                                    className="text-purple-light text-sm font-medium hover:text-purple transition-colors"
                                                >
                                                    View Details
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default ProjectDetails;
