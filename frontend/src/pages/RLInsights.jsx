import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Zap, Trash2, CheckCircle, Activity } from 'lucide-react';

const RLInsights = () => {
    const [timeRange, setTimeRange] = useState('1D');
    const [showBaseline, setShowBaseline] = useState(true);

    const rlStats = [
        {
            label: 'Total Efficiency Gain',
            value: '+18.5%',
            subtext: 'vs baseline policy',
            color: 'green',
            icon: <Zap size={24} />,
        },
        {
            label: 'Test Cases Reduced',
            value: '5,420',
            subtext: '35% reduction',
            color: 'purple',
            icon: <Trash2 size={24} />,
        },
        {
            label: 'Policy Success Rate',
            value: '98.7%',
            subtext: 'tests passed',
            color: 'cyan',
            icon: <CheckCircle size={24} />,
        },
        {
            label: 'Training Epochs',
            value: '4,890',
            subtext: 'completed',
            color: 'orange',
            icon: <Activity size={24} />,
        },
    ];

    return (
        <div className="min-h-screen bg-black">
            <div className="max-w-[1920px] mx-auto px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        to="/analytics/trend-analysis"
                        className="inline-flex items-center gap-2 text-cyan-light hover:text-cyan transition-colors mb-4"
                    >
                        <ArrowLeft size={18} />
                        Back to Trend Analysis
                    </Link>
                    <h1 className="text-4xl font-bold text-white mb-2">Reinforcement Learning Optimization Insights</h1>
                    <p className="text-gray-400">
                        Visualizing the impact and performance of the RL optimization engine for intelligent test selection and strategy adaptation.
                    </p>
                </div>

                {/* Status Banner */}
                <div className="bg-gradient-to-r from-green-500/20 to-cyan/20 border border-green-500/50 rounded-xl p-4 mb-8">
                    <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-green-500 font-semibold">Active</span>
                        <span className="text-white">Learning Rate: <span className="font-mono text-green-400">0.001</span></span>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {rlStats.map((stat, index) => (
                        <div key={index} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm text-gray-400">{stat.label}</span>
                                <span className={`text-${stat.color}-500`}>{stat.icon}</span>
                            </div>
                            <div className={`text-4xl font-bold text-${stat.color}-500 mb-1`}>{stat.value}</div>
                            <div className="text-xs text-gray-500">{stat.subtext}</div>
                        </div>
                    ))}
                </div>

                {/* Efficiency Gains Over Time */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white">Efficiency Gains Over Time</h2>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setTimeRange('1D')}
                                className={`px-4 py-2 ${timeRange === '1D' ? 'bg-purple text-white' : 'bg-zinc-950 text-gray-400'} border border-zinc-800 hover:border-purple rounded-lg text-sm transition-all`}
                            >
                                1D
                            </button>
                            <button
                                onClick={() => setTimeRange('7D')}
                                className={`px-4 py-2 ${timeRange === '7D' ? 'bg-purple text-white' : 'bg-zinc-950 text-gray-400'} border border-zinc-800 hover:border-purple rounded-lg text-sm transition-all`}
                            >
                                7D
                            </button>
                            <button
                                onClick={() => setTimeRange('30D')}
                                className={`px-4 py-2 ${timeRange === '30D' ? 'bg-purple text-white' : 'bg-zinc-950 text-gray-400'} border border-zinc-800 hover:border-purple rounded-lg text-sm transition-all`}
                            >
                                30D
                            </button>
                            <button
                                onClick={() => setTimeRange('Custom')}
                                className={`px-4 py-2 ${timeRange === 'Custom' ? 'bg-purple text-white' : 'bg-zinc-950 text-gray-400'} border border-zinc-800 hover:border-purple rounded-lg text-sm transition-all`}
                            >
                                Custom
                            </button>
                            <div className="ml-4 flex items-center gap-2">
                                <span className="text-gray-400 text-sm">vs Baseline</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={showBaseline}
                                        onChange={(e) => setShowBaseline(e.target.checked)}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-light"></div>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Chart with baseline */}
                    <div className="relative h-96 bg-zinc-950 rounded-xl border border-zinc-800 p-6">
                        <svg viewBox="0 0 1000 300" className="w-full h-full">
                            {/* Grid lines */}
                            <g className="opacity-20">
                                {[0, 5, 10, 15, 20, 25].map((val, i) => (
                                    <line key={i} x1="50" y1={280 - (val * 10)} x2="950" y2={280 - (val * 10)} stroke="#52525b" strokeWidth="1" />
                                ))}
                            </g>
                            {/* Baseline dashed line */}
                            {showBaseline && (
                                <line x1="50" y1="230" x2="950" y2="230" stroke="#52525b" strokeWidth="2" strokeDasharray="5,5" />
                            )}
                            {/* RL Performance line */}
                            <polyline
                                points="50,250 150,240 250,225 350,210 450,195 550,180 650,170 750,160 850,155 950,150"
                                fill="none"
                                stroke="#a78bfa"
                                strokeWidth="3"
                            />
                            {/* Y-axis labels */}
                            <text x="10" y="285" fill="#9ca3af" fontSize="12">0%</text>
                            <text x="10" y="235" fill="#9ca3af" fontSize="12">5%</text>
                            <text x="10" y="135" fill="#9ca3af" fontSize="12">15%</text>
                            {/* X-axis labels */}
                            <text x="50" y="295" fill="#9ca3af" fontSize="12">00:00</text>
                            <text x="350" y="295" fill="#9ca3af" fontSize="12">12:00</text>
                            <text x="750" y="295" fill="#9ca3af" fontSize="12">18:00</text>
                            <text x="920" y="295" fill="#9ca3af" fontSize="12">24:00</text>
                        </svg>
                    </div>
                </div>

                {/* Policy Adaptation Heatmap */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white">Policy Adaptation Heatmap</h2>
                        <select className="px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-purple">
                            <option>Q-Value</option>
                            <option>Visit Count</option>
                            <option>Reward</option>
                        </select>
                    </div>
                    <div className="relative">
                        {/* Heatmap placeholder */}
                        <div className="grid grid-cols-6 gap-1">
                            {['/api/users', '/api/auth', '/api/projects', '/api/tests', '/api/reports'].map((endpoint, row) => (
                                <div key={row} className="contents">
                                    <div className="text-white text-sm py-4 pr-4 text-right">{endpoint}</div>
                                    {['T1', 'T2', 'T3', 'T4', 'T5'].map((time, col) => {
                                        const colors = [
                                            ['bg-purple', 'bg-purple-light', 'bg-blue-500', 'bg-blue-700', 'bg-orange-500'],
                                            ['bg-cyan-light', 'bg-orange-500', 'bg-orange-600', 'bg-blue-700', 'bg-cyan-light'],
                                            ['bg-purple-light', 'bg-cyan-500', 'bg-orange-600', 'bg-red-700', 'bg-purple-light'],
                                            ['bg-red-700', 'bg-purple-light', 'bg-cyan-light', 'bg-cyan-500', 'bg-red-700'],
                                            ['bg-cyan-light', 'bg-red-700', 'bg-purple-light', 'bg-blue-700', 'bg-cyan-light'],
                                        ];
                                        return (
                                            <div key={col} className={`h-16 ${colors[row][col]} rounded border border-zinc-700`}></div>
                                        );
                                    })}
                                </div>
                            ))}
                            <div></div>
                            {['T1', 'T2', 'T3', 'T4', 'T5'].map((time, i) => (
                                <div key={i} className="text-gray-400 text-sm text-center pt-2">{time}</div>
                            ))}
                        </div>
                        {/* Legend */}
                        <div className="flex items-center justify-end gap-2 mt-4">
                            <span className="text-gray-400 text-sm">Low</span>
                            <div className="flex gap-1">
                                {['bg-blue-700', 'bg-purple', 'bg-cyan-500', 'bg-orange-500', 'bg-red-500'].map((color, i) => (
                                    <div key={i} className={`w-8 h-4 ${color} rounded`}></div>
                                ))}
                            </div>
                            <span className="text-gray-400 text-sm">High</span>
                        </div>
                    </div>
                </div>

                {/* Current Strategy Snapshot */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 mb-8">
                    <h2 className="text-2xl font-bold text-white mb-6">Current Strategy Snapshot</h2>

                    <div className="space-y-6">
                        {/* Focus Areas */}
                        <div className="border-l-4 border-purple-light pl-4">
                            <h3 className="text-purple-light font-semibold mb-2">Focus Areas</h3>
                            <p className="text-white text-sm">
                                Currently prioritizing <span className="text-cyan-light font-mono">/api/auth</span> and{' '}
                                <span className="text-cyan-light font-mono">/api/projects</span> endpoints due to high-value testing actions.
                                The RL engine has identified these modules as critical paths with significant impact on overall system reliability.
                            </p>
                        </div>

                        {/* Recent Discoveries */}
                        <div className="border-l-4 border-cyan-light pl-4">
                            <h3 className="text-cyan-light font-semibold mb-2">Recent Discoveries</h3>
                            <p className="text-white text-sm">
                                Significant efficiency improvement discovered:{' '}
                                <span className="text-orange-500 font-semibold">Ignored redundant GET calls to /users/{'{id}'} after 15 consecutive successes</span>.
                                This optimization reduced test execution time by 23% while maintaining 100% coverage of critical user authentication flows.
                            </p>
                        </div>

                        {/* Exploration vs. Exploitation */}
                        <div className="border-l-4 border-orange-500 pl-4">
                            <h3 className="text-orange-500 font-semibold mb-2">Exploration vs. Exploitation Ratio</h3>
                            <div className="flex items-center gap-4 mb-2">
                                <span className="text-orange-500 text-2xl font-bold">72:28</span>
                                <div className="flex-1 h-3 bg-zinc-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-orange-500" style={{ width: '72%' }}></div>
                                </div>
                            </div>
                            <p className="text-white text-sm">
                                Currently favoring exploitation of known high-value test paths while maintaining 28% exploration to discover new optimization opportunities.
                                This balanced approach ensures continuous learning without sacrificing proven efficiency gains.
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mt-6 pt-6 border-t border-zinc-800 text-gray-500 text-sm">
                        <span>⏱</span>
                        <span>Last strategy update: 2 minutes ago</span>
                    </div>
                </div>

                {/* Distribution of Test Selection */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white">Distribution of Test Selection</h2>
                        <div className="flex items-center gap-2">
                            <button className="px-4 py-2 bg-purple text-white rounded-lg text-sm font-semibold">
                                Test Categories
                            </button>
                            <button className="px-4 py-2 bg-zinc-950 border border-zinc-800 hover:border-purple text-white rounded-lg text-sm transition-all">
                                Risk Distribution
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Left: Donut Chart */}
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-4">RL-Selected Test Distribution</h3>
                            <div className="relative flex items-center justify-center mb-6">
                                <svg viewBox="0 0 200 200" className="w-64 h-64">
                                    {/* Donut segments */}
                                    <circle cx="100" cy="100" r="70" fill="none" stroke="#a78bfa" strokeWidth="40" strokeDasharray="141 314" transform="rotate(-90 100 100)" />
                                    <circle cx="100" cy="100" r="70" fill="none" stroke="#06b6d4" strokeWidth="40" strokeDasharray="94 314" strokeDashoffset="-141" transform="rotate(-90 100 100)" />
                                    <circle cx="100" cy="100" r="70" fill="none" stroke="#f97316" strokeWidth="40" strokeDasharray="79 314" strokeDashoffset="-235" transform="rotate(-90 100 100)" />
                                    {/* Center */}
                                    <circle cx="100" cy="100" r="50" fill="#18181b" />
                                    <text x="100" y="95" textAnchor="middle" fill="#ffffff" fontSize="24" fontWeight="bold">2,847</text>
                                    <text x="100" y="110" textAnchor="middle" fill="#9ca3af" fontSize="12">Total Tests</text>
                                </svg>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 bg-purple rounded"></div>
                                    <span className="text-white text-sm">Functional (45%)</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 bg-cyan-light rounded"></div>
                                    <span className="text-white text-sm">Security (30%)</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-4 h-4 bg-orange-500 rounded"></div>
                                    <span className="text-white text-sm">Regression (25%)</span>
                                </div>
                            </div>
                        </div>

                        {/* Right: Comparison & Metrics */}
                        <div>
                            <h3 className="text-lg font-semibold text-white mb-4">RL vs Baseline Policy Comparison</h3>
                            <div className="space-y-4 mb-6">
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-gray-400 text-sm">High-Risk Endpoints</span>
                                        <span className="text-white text-sm">RL: 68% | Baseline: 45%</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="flex-1 h-2 bg-purple rounded-full" style={{ width: '68%' }}></div>
                                        <div className="flex-1 h-2 bg-gray-600 rounded-full" style={{ width: '45%' }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-gray-400 text-sm">Medium-Risk Endpoints</span>
                                        <span className="text-white text-sm">RL: 25% | Baseline: 35%</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="flex-1 h-2 bg-cyan-light rounded-full" style={{ width: '25%' }}></div>
                                        <div className="flex-1 h-2 bg-gray-600 rounded-full" style={{ width: '35%' }}></div>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-gray-400 text-sm">Low-Risk Endpoints</span>
                                        <span className="text-white text-sm">RL: 7% | Baseline: 20%</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="flex-1 h-2 bg-orange-500 rounded-full" style={{ width: '7%' }}></div>
                                        <div className="flex-1 h-2 bg-gray-600 rounded-full" style={{ width: '20%' }}></div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4">
                                <h4 className="text-white font-semibold mb-3">Key Performance Metrics</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-green-500 text-2xl font-bold">-34.2%</div>
                                        <div className="text-gray-400 text-xs">Avg. Time Reduction</div>
                                    </div>
                                    <div>
                                        <div className="text-green-500 text-2xl font-bold">99.8%</div>
                                        <div className="text-gray-400 text-xs">Coverage Maintained</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RLInsights;
