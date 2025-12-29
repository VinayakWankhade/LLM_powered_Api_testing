import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, RefreshCw, FileText, Activity, Flame, ChevronDown, ChevronUp } from 'lucide-react';

const RunDetails = () => {
    const { id, runId } = useParams();
    const [configExpanded, setConfigExpanded] = useState(true);
    const [envExpanded, setEnvExpanded] = useState(false);

    const stats = [
        { label: 'Total Tests', value: '1,240', subtext: 'Executed on Nov 24, 2025' },
        { label: 'Passed', value: '1,185', color: 'green' },
        { label: 'Failed', value: '35', color: 'red' },
        { label: 'Healed', value: '20', color: 'cyan' },
        { label: 'Skipped', value: '0', color: 'gray' },
    ];

    const executionMetrics = [
        { label: 'Total Duration', value: '02m 34s', subtext: 'Avg. 0.12s/test', color: 'purple' },
        { label: 'API Coverage', value: '92.8%', subtext: '↑ 3% improvement', color: 'cyan' },
        { label: 'Self-Healing', value: '57.1%', subtext: 'Effectiveness Rate', color: 'orange' },
        { label: 'Health Score', value: '97.2%', subtext: 'Overall stability index', color: 'green' },
    ];

    const failedTests = [
        { id: 'TC-0815', errorType: 'Assertion Fail' },
        { id: 'TC-0921', errorType: '500 Server Error' },
        { id: 'TC-1011', errorType: 'Timeout' },
    ];

    const healedTests = [
        { id: 'TC-0042', action: 'Generated new CSS selector' },
        { id: 'TC-0199', action: 'Adjusted request timeout' },
        { id: 'TC-0256', action: 'Updated expired auth token' },
    ];

    const logEntries = [
        { time: '[2:26:58 PM]', message: 'Initiating self-healing protocol for failed tests...', color: 'cyan' },
        { time: '[2:27:00 PM]', message: 'Analyzing failure context for TC-0042...', color: 'gray' },
        { time: '[2:27:01 PM]', message: 'Identified stale element reference for button#submit.', color: 'green' },
        { time: '[2:27:03 PM]', message: 'Healing action: Generated new stable CSS selector `.btn-submit-new`. Retrying...', color: 'green' },
        { time: '[2:27:04 PM]', message: 'TC-0042 Passed after self-healing.', color: 'green' },
        { time: '[2:27:06 PM]', message: 'Analyzing failure context for TC-0199...', color: 'gray' },
        { time: '[2:27:07 PM]', message: 'Detected timeout error on GET /api/v2/users.', color: 'orange' },
        { time: '[2:27:09 PM]', message: 'Healing action: Increased timeout from 5000ms to 10000ms. Retrying...', color: 'green' },
        { time: '[2:27:10 PM]', message: 'TC-0199 Passed after self-healing.', color: 'green' },
        { time: '[2:27:12 PM]', message: 'Analyzing failure context for TC-1011...', color: 'gray' },
        { time: '[2:27:13 PM]', message: 'Failure seems related to network instability. Could not resolve.', color: 'red' },
        { time: '[2:27:15 PM]', message: '--- End of log stream ---', color: 'gray' },
    ];

    return (
        <div className="min-h-screen bg-black">
            <div className="max-w-[1920px] mx-auto px-8 py-8">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm mb-6 text-gray-400">
                    <Link to={`/project/${id}`} className="hover:text-white transition-colors">Project: Sentinel</Link>
                    <span>/</span>
                    <Link to={`/project/${id}/runs`} className="hover:text-white transition-colors">Test Runs</Link>
                    <span>/</span>
                    <span className="text-white">Run Details</span>
                </div>

                {/* Back Button */}
                <Link
                    to={`/project/${id}/runs`}
                    className="inline-flex items-center gap-2 text-cyan-light hover:text-cyan transition-colors mb-6"
                >
                    <ArrowLeft size={18} />
                    Back to Test Runs
                </Link>

                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></div>
                            <h1 className="text-4xl font-bold text-white">Run #20251124-0042</h1>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-gray-400">
                            <span>Project: Sentinel-API</span>
                            <span>Triggered By: CI/CD Pipeline</span>
                            <span>Environment: QA</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-800 hover:border-purple text-white rounded-lg transition-all">
                            <RefreshCw size={18} />
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-purple hover:bg-purple-dark text-white font-semibold rounded-lg transition-all hover:shadow-glow-purple">
                            <FileText size={18} />
                            Execution Logs
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-cyan-light hover:bg-cyan text-black font-semibold rounded-lg transition-all hover:shadow-glow-cyan">
                            <Activity size={18} />
                            Coverage Report
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-all">
                            <Flame size={18} />
                            Healing Report
                        </button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                    {stats.map((stat, index) => (
                        <div key={index} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                            <div className="text-sm text-gray-400 mb-2">{stat.label}</div>
                            <div className={`text-3xl font-bold ${stat.color ? `text-${stat.color}-500` : 'text-white'} mb-1`}>
                                {stat.value}
                            </div>
                            {stat.subtext && <div className="text-xs text-gray-500">{stat.subtext}</div>}
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Test Status Distribution */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-white mb-6">Test Status Distribution</h2>

                        <div className="flex items-center justify-center mb-6">
                            {/* Radial Chart */}
                            <div className="relative w-full max-w-md aspect-square">
                                <svg viewBox="0 0 400 400" className="w-full h-full">
                                    {/* Grid */}
                                    <g className="opacity-20">
                                        {[...Array(6)].map((_, i) => (
                                            <circle key={i} cx="200" cy="200" r={50 + i * 25} fill="none" stroke="#52525b" strokeWidth="0.5" />
                                        ))}
                                        {[...Array(12)].map((_, i) => {
                                            const angle = (i * 30 * Math.PI) / 180;
                                            return (
                                                <line key={i} x1="200" y1="200" x2={200 + Math.cos(angle) * 200} y2={200 + Math.sin(angle) * 200} stroke="#52525b" strokeWidth="0.5" />
                                            );
                                        })}
                                    </g>

                                    {/* Segments */}
                                    <path d="M 200 200 L 200 50 A 150 150 0 0 1 330 130 Z" fill="rgba(34, 197, 94, 0.6)" stroke="rgba(34, 197, 94, 1)" strokeWidth="2" />
                                    <path d="M 200 200 L 330 130 A 150 150 0 0 1 350 200 Z" fill="rgba(74, 222, 128, 0.5)" stroke="rgba(74, 222, 128, 1)" strokeWidth="2" />
                                    <path d="M 200 200 L 350 200 A 150 150 0 0 1 270 330 Z" fill="rgba(6, 182, 212, 0.6)" stroke="rgba(6, 182, 212, 1)" strokeWidth="2" />
                                    <path d="M 200 200 L 270 330 A 150 150 0 0 1 130 330 Z" fill="rgba(168, 85, 247, 0.6)" stroke="rgba(168, 85, 247, 1)" strokeWidth="2" />
                                    <path d="M 200 200 L 130 330 A 150 150 0 0 1 70 270 Z" fill="rgba(239, 68, 68, 0.6)" stroke="rgba(239, 68, 68, 1)" strokeWidth="2" />

                                    {/* Center */}
                                    <circle cx="200" cy="200" r="70" fill="#18181b" stroke="#3f3f46" strokeWidth="2" />
                                    <text x="200" y="200" textAnchor="middle" fill="#a1a1aa" fontSize="14" fontWeight="600">AI TestGen</text>
                                </svg>
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            {[
                                { label: 'Functional', color: 'bg-green-500' },
                                { label: 'Security', color: 'bg-cyan-light' },
                                { label: 'Performance', color: 'bg-green-400' },
                                { label: 'Healed', color: 'bg-purple-light' },
                                { label: 'Skipped', color: 'bg-gray-500' },
                                { label: 'Failed', color: 'bg-red-500' },
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded ${item.color}`}></div>
                                    <span className="text-gray-400">{item.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Run Configuration */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-white mb-6">Run Configuration</h2>

                        {/* Configuration Details */}
                        <div className="mb-4">
                            <button
                                onClick={() => setConfigExpanded(!configExpanded)}
                                className="flex items-center justify-between w-full p-3 bg-zinc-950 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors"
                            >
                                <span className="text-white font-medium">Configuration Details</span>
                                {configExpanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                            </button>
                            {configExpanded && (
                                <div className="mt-3 p-4 bg-black border border-zinc-800 rounded-lg space-y-2 text-sm">
                                    <div className="flex items-start gap-2">
                                        <span className="text-gray-400">•</span>
                                        <span className="text-white">OS: Linux (Kernel 6.5)</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="text-gray-400">•</span>
                                        <span className="text-white">Browser: Chrome 128.0</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="text-gray-400">•</span>
                                        <span className="text-white">Test Gen Model: gpt-4o-turbo-v2</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="text-gray-400">•</span>
                                        <span className="text-white">Healing Model: gpt-4o-heal-v3.1</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Environment Variables */}
                        <div>
                            <button
                                onClick={() => setEnvExpanded(!envExpanded)}
                                className="flex items-center justify-between w-full p-3 bg-zinc-950 border border-zinc-800 rounded-lg hover:border-zinc-700 transition-colors"
                            >
                                <span className="text-white font-medium">Environment Variables</span>
                                {envExpanded ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                            </button>
                            {envExpanded && (
                                <div className="mt-3 p-4 bg-black border border-zinc-800 rounded-lg space-y-2 text-sm font-mono">
                                    <div className="text-green-400">API_BASE_URL=https://api.example.com</div>
                                    <div className="text-green-400">AUTH_TOKEN=***hidden***</div>
                                    <div className="text-green-400">TIMEOUT=10000</div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Execution Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {executionMetrics.map((metric, index) => (
                        <div key={index} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                            <div className="text-sm text-gray-400 mb-2">{metric.label}</div>
                            <div className={`text-3xl font-bold text-${metric.color}-500 mb-1`}>{metric.value}</div>
                            <div className="text-xs text-gray-500">{metric.subtext}</div>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    {/* Failure Analysis */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-red-500 mb-4">Failure Analysis (15 remaining)</h2>
                        <div className="space-y-3">
                            <div className="grid grid-cols-3 gap-4 text-xs font-semibold text-gray-400 uppercase tracking-wider pb-2 border-b border-zinc-800">
                                <div>Test Case</div>
                                <div>Error Type</div>
                                <div>Actions</div>
                            </div>
                            {failedTests.map((test, index) => (
                                <div key={index} className="grid grid-cols-3 gap-4 items-center">
                                    <div className="text-white text-sm">{test.id}</div>
                                    <div>
                                        <span className="px-2.5 py-1 bg-red-500/20 text-red-500 border border-red-500 rounded text-xs font-semibold">
                                            {test.errorType}
                                        </span>
                                    </div>
                                    <div>
                                        <button className="px-3 py-1.5 bg-purple hover:bg-purple-dark text-white text-xs font-semibold rounded-lg transition-all">
                                            Rerun Test
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Healed Tests */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                        <h2 className="text-xl font-bold text-cyan-light mb-4">Healed Tests (20)</h2>
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-4 text-xs font-semibold text-gray-400 uppercase tracking-wider pb-2 border-b border-zinc-800">
                                <div>Test Case</div>
                                <div>Action Taken</div>
                            </div>
                            {healedTests.map((test, index) => (
                                <div key={index} className="grid grid-cols-2 gap-4 items-center">
                                    <div className="text-white text-sm">{test.id}</div>
                                    <div className="text-gray-400 text-sm">{test.action}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Self-Healing Log Stream */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-white">Self-Healing Log Stream</h2>
                        <div className="flex items-center gap-3">
                            <span className="text-gray-400 text-sm">Pause Stream</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" />
                                <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                            </label>
                        </div>
                    </div>

                    <div className="bg-black border border-zinc-800 rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm">
                        {logEntries.map((entry, index) => (
                            <div key={index} className="mb-1">
                                <span className="text-gray-500">{entry.time}</span>
                                <span className={`text-${entry.color}-400 ml-2`}>{entry.message}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RunDetails;
