import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download, TrendingUp, Clock, Wrench, Shield } from 'lucide-react';

const TrendAnalysis = () => {
    const [timeRange, setTimeRange] = useState('Last 30 Days');
    const [projectFilter, setProjectFilter] = useState('All Projects');

    const trendStats = [
        {
            label: 'Overall Pass Rate',
            value: '98.7%',
            change: '+2.4% from last period',
            color: 'green',
            icon: <TrendingUp size={24} />,
            hasChart: true,
        },
        {
            label: 'Avg. Test Duration',
            value: '45s',
            change: '-5% from last period',
            color: 'cyan',
            icon: <Clock size={24} />,
            hasChart: true,
        },
        {
            label: 'Total Tests Healed',
            value: '1,204',
            change: '+150 this month',
            color: 'cyan',
            icon: <Wrench size={24} />,
            hasChart: true,
        },
        {
            label: 'Total API Coverage',
            value: '85.2%',
            change: '+12% in 30 days',
            color: 'purple',
            icon: <Shield size={24} />,
            hasChart: true,
        },
    ];

    return (
        <div className="min-h-screen bg-black">
            <div className="max-w-[1920px] mx-auto px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/analytics/global-coverage"
                            className="flex items-center gap-2 text-cyan-light hover:text-cyan transition-colors"
                        >
                            <ArrowLeft size={18} />
                            Back to Global Coverage
                        </Link>
                        <h1 className="text-4xl font-bold text-white">Trend Analysis</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="px-4 py-2 bg-purple hover:bg-purple-dark text-white font-semibold rounded-lg transition-all">
                            Trend Analysis
                        </button>
                        <button className="px-4 py-2 bg-zinc-900 border border-zinc-800 hover:border-purple text-white rounded-lg transition-all">
                            RL Optimization Insights
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex items-center gap-4 mb-8">
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-purple"
                    >
                        <option>Last 30 Days</option>
                        <option>Last 90 Days</option>
                        <option>Last 6 Months</option>
                        <option>Last Year</option>
                    </select>
                    <select
                        value={projectFilter}
                        onChange={(e) => setProjectFilter(e.target.value)}
                        className="px-4 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-purple"
                    >
                        <option>All Projects</option>
                        <option>Project Odyssey</option>
                        <option>Project Nova</option>
                        <option>Legacy System Gateway</option>
                    </select>
                    <button className="ml-auto p-2 bg-zinc-900 border border-zinc-800 hover:border-purple text-white rounded-lg transition-all">
                        <Download size={18} />
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {trendStats.map((stat, index) => (
                        <div key={index} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm text-gray-400">{stat.label}</span>
                                <span className={`text-${stat.color}-500`}>{stat.icon}</span>
                            </div>
                            <div className={`text-4xl font-bold text-${stat.color}-500 mb-2`}>{stat.value}</div>
                            <div className="text-xs text-green-500 mb-3">{stat.change}</div>
                            {stat.hasChart && (
                                <div className="h-12 flex items-end gap-0.5">
                                    {[45, 50, 48, 55, 52, 60, 58, 65, 62, 70, 68, 75].map((height, i) => (
                                        <div
                                            key={i}
                                            className={`flex-1 bg-gradient-to-t from-${stat.color}-500/30 to-${stat.color}-500 rounded-t`}
                                            style={{ height: `${height}%` }}
                                        ></div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* AI Insights */}
                <div className="bg-gradient-to-r from-purple/20 to-cyan/20 border border-purple/50 rounded-xl p-4 mb-8">
                    <div className="flex items-center gap-3">
                        <span className="text-2xl">🤖</span>
                        <div>
                            <span className="text-purple-light font-semibold">AI Insights:</span>
                            <span className="text-white ml-2">System performance stable, watch for duration spike on Project X.</span>
                        </div>
                    </div>
                </div>

                {/* Test Execution Pass/Fail/Healed Trend */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 mb-8">
                    <h2 className="text-2xl font-bold text-white mb-6">Test Execution Pass/Fail/Healed Trend</h2>

                    {/* 3D Stacked Area Chart Placeholder */}
                    <div className="relative h-96 bg-gradient-to-br from-black via-zinc-950 to-black rounded-xl border border-zinc-800 overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="text-center">
                                <div className="text-6xl mb-4">📊</div>
                                <p className="text-gray-400 text-sm">3D Stacked Area Chart</p>
                                <p className="text-gray-500 text-xs mt-2">Pass / Fail / Healed trends over time</p>
                            </div>
                        </div>
                        {/* Gradient overlays for depth */}
                        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black to-transparent"></div>
                    </div>

                    {/* Legend */}
                    <div className="flex items-center justify-center gap-6 mt-6">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-cyan-light rounded"></div>
                            <span className="text-white text-sm">Passed</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-red-500 rounded"></div>
                            <span className="text-white text-sm">Failed</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 bg-green-500 rounded"></div>
                            <span className="text-white text-sm">Healed</span>
                        </div>
                    </div>
                </div>

                {/* Bottom Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* API Coverage Growth Over Time */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-white mb-6">API Coverage Growth Over Time</h2>
                        <div className="relative h-64 bg-zinc-950 rounded-lg border border-zinc-800 overflow-hidden">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="text-4xl mb-2">📈</div>
                                    <p className="text-gray-400 text-sm">Area Chart</p>
                                    <p className="text-gray-500 text-xs">Coverage growth timeline</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Average Test Execution Duration */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-white mb-6">Average Test Execution Duration</h2>
                        <div className="relative h-64 bg-zinc-950 rounded-lg border border-zinc-800 overflow-hidden">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="text-4xl mb-2">📊</div>
                                    <p className="text-gray-400 text-sm">Bar Chart with Trend</p>
                                    <p className="text-gray-500 text-xs">Duration over time</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Deep Dive Section */}
                <div className="bg-gradient-to-r from-cyan/10 to-purple/10 border border-cyan/30 rounded-xl p-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-cyan-light/20 rounded-full flex items-center justify-center border border-cyan-light">
                                <TrendingUp size={32} className="text-cyan-light" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-white mb-2">
                                    Deep Dive: Reinforcement Learning Optimization Performance
                                </h2>
                                <p className="text-gray-400 text-sm">
                                    Unlock significant efficiency gains and resource savings by analyzing RL-driven test optimizations.
                                </p>
                            </div>
                        </div>
                        <Link
                            to="/analytics/rl-insights"
                            className="px-6 py-3 bg-cyan-light hover:bg-cyan text-black font-semibold rounded-lg transition-all flex items-center gap-2"
                        >
                            View RL Optimization Insights
                            <span>→</span>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrendAnalysis;
