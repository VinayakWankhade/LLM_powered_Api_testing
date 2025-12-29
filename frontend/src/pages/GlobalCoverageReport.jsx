import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Search, BarChart3 } from 'lucide-react';

const GlobalCoverageReport = () => {
    const [timeRange, setTimeRange] = useState('Last 30 Days');
    const [searchQuery, setSearchQuery] = useState('');

    const globalStats = [
        {
            label: 'Total API Endpoints',
            value: '12,849',
            change: '+2.5% vs last week',
            icon: '⚙️',
            color: 'blue',
            hasChart: true,
        },
        {
            label: 'Average API Coverage',
            value: '87.5%',
            icon: '🛡️',
            color: 'purple',
            hasProgress: true,
            hasChart: true,
        },
        {
            label: 'Projects Monitored',
            value: '42',
            badge: 'All Systems Nominal',
            badgeColor: 'green',
            icon: '📊',
            color: 'cyan',
            hasChart: true,
        },
        {
            label: 'Test Self-Healing Rate',
            value: '95.2%',
            change: '+0.8% vs last week',
            icon: '🔧',
            color: 'green',
            hasChart: true,
        },
    ];

    const projects = [
        {
            name: 'Project "Odyssey"',
            endpoints: '1,520',
            coverage: 92,
            coverageColor: 'white',
            lastUpdated: '2025-11-29',
            healingRate: '98%',
            healingColor: 'green',
            status: 'Healthy',
            statusColor: 'green',
        },
        {
            name: 'Project "Nova"',
            endpoints: '850',
            coverage: 65,
            coverageColor: 'orange',
            lastUpdated: '2025-11-28',
            healingRate: '75%',
            healingColor: 'orange',
            status: 'Warning',
            statusColor: 'orange',
        },
        {
            name: 'Legacy System Gateway',
            endpoints: '3,105',
            coverage: 98,
            coverageColor: 'green',
            lastUpdated: '2025-11-30',
            healingRate: '99%',
            healingColor: 'green',
            status: 'Healthy',
            statusColor: 'green',
        },
        {
            name: 'Project "Helios"',
            endpoints: '430',
            coverage: 42,
            coverageColor: 'red',
            lastUpdated: '2025-11-25',
            healingRate: '55%',
            healingColor: 'red',
            status: 'Critical',
            statusColor: 'red',
        },
    ];

    return (
        <div className="min-h-screen bg-black">
            <div className="max-w-[1920px] mx-auto px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2">Global Coverage Report</h1>
                            <p className="text-gray-400">Across All Managed Projects</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <Link
                                to="/dashboard"
                                className="flex items-center gap-2 px-4 py-2 text-white hover:text-cyan-light transition-colors"
                            >
                                <ArrowLeft size={18} />
                                Back to Dashboard
                            </Link>
                            <button className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 hover:border-purple text-white rounded-lg transition-all">
                                <BarChart3 size={18} />
                                View Trend Analysis
                            </button>
                        </div>
                    </div>
                    <p className="text-sm text-gray-500">
                        This dashboard provides an aggregated, high-level overview of API test coverage and effectiveness across the entire platform ecosystem.
                    </p>
                </div>

                {/* Global Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {globalStats.map((stat, index) => (
                        <div key={index} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm text-gray-400">{stat.label}</span>
                                <span className="text-2xl">{stat.icon}</span>
                            </div>
                            <div className={`text-4xl font-bold text-${stat.color}-500 mb-2`}>{stat.value}</div>
                            {stat.change && <div className="text-xs text-green-500 mb-3">{stat.change}</div>}
                            {stat.badge && (
                                <div className={`inline-block px-2 py-1 bg-${stat.badgeColor}-500/20 text-${stat.badgeColor}-500 border border-${stat.badgeColor}-500 rounded text-xs font-semibold mb-3`}>
                                    {stat.badge}
                                </div>
                            )}
                            {stat.hasProgress && (
                                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden mb-3">
                                    <div className="h-full bg-gradient-to-r from-purple to-cyan-light" style={{ width: stat.value }}></div>
                                </div>
                            )}
                            {stat.hasChart && (
                                <div className="h-16 flex items-end gap-1">
                                    {/* Simple sparkline */}
                                    {[40, 55, 45, 60, 50, 65, 58, 70, 65, 75, 70, 80].map((height, i) => (
                                        <div
                                            key={i}
                                            className={`flex-1 bg-gradient-to-t from-${stat.color}-500/50 to-${stat.color}-500 rounded-t`}
                                            style={{ height: `${height}%` }}
                                        ></div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Global API Coverage Over Time */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-1">Global API Coverage % Over Time</h2>
                            <p className="text-sm text-gray-400">Peak Coverage: 91.2% | Average Rate: 87.5%</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="px-4 py-2 bg-zinc-950 border border-zinc-800 hover:border-purple text-white rounded-lg text-sm transition-all">
                                Last 30 Days
                            </button>
                            <button className="px-4 py-2 bg-zinc-950 border border-zinc-800 hover:border-purple text-white rounded-lg text-sm transition-all">
                                Last 90 Days
                            </button>
                            <button className="px-4 py-2 bg-zinc-950 border border-zinc-800 hover:border-purple text-white rounded-lg text-sm transition-all">
                                All Time
                            </button>
                            <button className="px-4 py-2 bg-black border border-zinc-800 hover:border-purple text-white rounded-lg text-sm transition-all">
                                Custom Date Range
                            </button>
                        </div>
                    </div>

                    {/* 3D Visualization Placeholder */}
                    <div className="relative h-96 bg-gradient-to-br from-purple/10 via-black to-cyan/10 rounded-xl border border-zinc-800 overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                                <div className="text-6xl mb-4">📈</div>
                                <p className="text-gray-400 text-sm">3D Coverage Visualization</p>
                                <p className="text-gray-500 text-xs mt-2">Functional Coverage & Security Coverage Trends</p>
                            </div>
                        </div>
                        {/* Gradient overlays for depth effect */}
                        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent"></div>
                        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black/50 to-transparent"></div>
                    </div>

                    {/* Legend */}
                    <div className="flex items-center justify-center gap-6 mt-6">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-purple rounded"></div>
                            <span className="text-white text-sm">Functional Coverage</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-cyan-light rounded"></div>
                            <span className="text-white text-sm">Security Coverage</span>
                        </div>
                    </div>
                </div>

                {/* Project Coverage Comparison */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 mb-8">
                    <h2 className="text-2xl font-bold text-white mb-6">Project Coverage Comparison</h2>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Panel */}
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm text-gray-400 mb-2 block">Select projects to compare (max 4)</label>
                                <select className="w-full px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-purple">
                                    <option>Select Projects</option>
                                    <option>Project Odyssey</option>
                                    <option>Project Nova</option>
                                    <option>Legacy System Gateway</option>
                                    <option>Project Helios</option>
                                </select>
                            </div>

                            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg">
                                <p className="text-gray-500 text-sm">No projects selected.</p>
                            </div>

                            <div>
                                <h3 className="text-white font-semibold mb-3">Key Differences</h3>
                                <div className="space-y-2 text-sm">
                                    <p className="text-gray-400">
                                        <span className="text-white font-semibold">Project Bravo</span> shows 15% higher parameter coverage than{' '}
                                        <span className="text-cyan-light font-semibold">Project Charlie</span>.
                                    </p>
                                    <p className="text-gray-400">
                                        <span className="text-cyan-light font-semibold">Project Charlie</span> has better endpoint discovery but lower code path coverage.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Right Panel - Radar Chart */}
                        <div className="lg:col-span-2">
                            <div className="relative h-96 bg-zinc-950 rounded-xl border border-zinc-800 overflow-hidden">
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="text-6xl mb-4">🎯</div>
                                        <p className="text-gray-400 text-sm">Multi-Project Radar Comparison</p>
                                        <p className="text-gray-500 text-xs mt-2">Select projects to view comparison</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Project Coverage Details */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white">Project Coverage Details</h2>
                        <div className="relative w-64">
                            <input
                                type="text"
                                placeholder="Search by project name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-2 pl-10 bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-purple"
                            />
                            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-zinc-800">
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Project Name
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Total Endpoints
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Coverage %
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Last Updated
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Healing Rate
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {projects.map((project, index) => (
                                    <tr key={index} className="border-b border-zinc-800 hover:bg-white/[0.02] transition-colors">
                                        <td className="px-4 py-4">
                                            <span className="text-white font-medium">{project.name}</span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="text-white">{project.endpoints}</span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-32 h-2 bg-zinc-800 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full bg-${project.coverageColor}-500`}
                                                        style={{ width: `${project.coverage}%` }}
                                                    ></div>
                                                </div>
                                                <span className={`text-${project.coverageColor}-500 font-semibold text-sm`}>
                                                    {project.coverage}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="text-gray-400 text-sm">{project.lastUpdated}</span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`px-2.5 py-1 bg-${project.healingColor}-500/20 text-${project.healingColor}-500 border border-${project.healingColor}-500 rounded text-xs font-semibold`}>
                                                {project.healingRate}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className={`px-2.5 py-1 bg-${project.statusColor}-500/20 text-${project.statusColor}-500 border border-${project.statusColor}-500 rounded text-xs font-semibold`}>
                                                {project.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <button className="px-3 py-1.5 bg-zinc-950 border border-zinc-800 hover:border-purple text-white text-xs font-semibold rounded-lg transition-all">
                                                View Report
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="flex items-center justify-between mt-6 pt-6 border-t border-zinc-800">
                        <span className="text-gray-400 text-sm">Showing 1-4 of 42 projects</span>
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
                                11
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

export default GlobalCoverageReport;
