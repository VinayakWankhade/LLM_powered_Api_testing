import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, TrendingUp, Zap, Clock, AlertTriangle, ChevronDown } from 'lucide-react';

const HealingReport = () => {
    const { id, runId } = useParams();
    const [mechanismFilter, setMechanismFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');

    const healingStats = [
        { label: 'Total Tests Healed', value: '128', subtext: '+12% from last run', color: 'purple', icon: <Zap size={24} /> },
        { label: 'Healing Success Rate', value: '94.1%', subtext: '', color: 'cyan', icon: <TrendingUp size={24} /> },
        { label: 'Time Saved', value: '~4.5 hr', subtext: 'Estimated manual fix time', color: 'orange', icon: <Clock size={24} /> },
        { label: 'Healable Failures', value: '136', subtext: 'Out of 150 total failures', color: 'blue', icon: <AlertTriangle size={24} /> },
    ];

    const mechanisms = [
        {
            name: 'Locator Changes',
            percentage: 48,
            description: 'Updated selectors (CSS, XPath) after UI changes.',
            color: 'purple',
            count: 62,
        },
        {
            name: 'API Parameter Fixes',
            percentage: 35,
            description: 'Adjusted request payloads or query parameters.',
            color: 'cyan',
            count: 45,
        },
        {
            name: 'Response Assertion Updates',
            percentage: 28,
            description: 'Modified expected outcomes based on valid API changes.',
            color: 'orange',
            count: 36,
        },
        {
            name: 'Env Var Adjustments',
            percentage: 5,
            description: 'Corrected environment-specific configurations.',
            color: 'blue',
            count: 6,
        },
    ];

    const healedTests = [
        {
            id: 'TC-0815',
            originalError: 'Selector not found: #submit-btn',
            mechanism: 'Locator Change',
            severity: 'Critical',
            result: 'Success',
            time: '0.8s',
        },
        {
            id: 'TC-0816',
            originalError: 'Assertion failed: expected 200, got 201',
            mechanism: 'Assertion Update',
            severity: 'Major',
            result: 'Success',
            time: '0.5s',
        },
        {
            id: 'TC-0817',
            originalError: 'Timeout waiting for element .modal',
            mechanism: 'Locator Change',
            severity: 'Minor',
            result: 'Success',
            time: '1.2s',
        },
        {
            id: 'TC-0818',
            originalError: 'Invalid parameter: user_id is required',
            mechanism: 'Parameter Fix',
            severity: 'Critical',
            result: 'Success',
            time: '0.3s',
        },
    ];

    const getSeverityBadge = (severity) => {
        const colors = {
            Critical: 'bg-red-500/20 text-red-500 border-red-500',
            Major: 'bg-orange-500/20 text-orange-500 border-orange-500',
            Minor: 'bg-yellow-500/20 text-yellow-500 border-yellow-500',
        };
        return (
            <span className={`px-2.5 py-1 ${colors[severity]} border rounded text-xs font-semibold`}>
                {severity}
            </span>
        );
    };

    const getMechanismBadge = (mechanism) => {
        const colors = {
            'Locator Change': 'bg-purple-500/20 text-purple-light border-purple-500',
            'Assertion Update': 'bg-orange-500/20 text-orange-500 border-orange-500',
            'Parameter Fix': 'bg-cyan-light/20 text-cyan-light border-cyan-light',
        };
        return (
            <span className={`px-2.5 py-1 ${colors[mechanism]} border rounded text-xs font-semibold`}>
                {mechanism}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-black">
            <div className="max-w-[1920px] mx-auto px-8 py-8">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm mb-6 text-gray-400">
                    <span>Project: SynthWave API</span>
                    <span>/</span>
                    <span>Test Runs</span>
                    <span>/</span>
                    <span>Test Run #74-B</span>
                    <span>/</span>
                    <span className="text-white">Project Healing Report</span>
                </div>

                {/* Back Button */}
                <Link
                    to={`/project/${id}/run/${runId}`}
                    className="inline-flex items-center gap-2 text-cyan-light hover:text-cyan transition-colors mb-6"
                >
                    <ArrowLeft size={18} />
                    Back to Test Run Details
                </Link>

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">Project Healing Report</h1>
                    <p className="text-gray-400">
                        For Test Run ID: <span className="text-cyan-light font-mono">a8c1-dfa8-74b2</span> of Project:{' '}
                        <span className="text-purple-light">SynthWave API</span>
                    </p>
                </div>

                {/* Healing Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {healingStats.map((stat, index) => (
                        <div key={index} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                            <div className="flex items-center justify-between mb-3">
                                <span className="text-sm text-gray-400">{stat.label}</span>
                                <span className={`text-${stat.color}-500`}>{stat.icon}</span>
                            </div>
                            <div className={`text-3xl font-bold text-${stat.color}-500 mb-1`}>{stat.value}</div>
                            {stat.subtext && <div className="text-xs text-green-500">{stat.subtext}</div>}
                            {stat.label === 'Healing Success Rate' && (
                                <div className="mt-2 w-full h-1 bg-zinc-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-cyan-light" style={{ width: stat.value }}></div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Healing Mechanism Breakdown */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-8">
                    <h2 className="text-2xl font-bold text-white mb-6">Healing Mechanism Breakdown</h2>

                    <div className="space-y-4">
                        {mechanisms.map((mechanism, index) => (
                            <div key={index} className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-1 h-12 bg-${mechanism.color}-500 rounded-full`}></div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-1">
                                                <span className={`text-${mechanism.color}-500 font-semibold`}>{mechanism.name}</span>
                                                <span className={`text-${mechanism.color}-500 text-sm`}>({mechanism.percentage}%)</span>
                                            </div>
                                            <p className="text-gray-400 text-sm">{mechanism.description}</p>
                                        </div>
                                    </div>
                                    <span className="text-gray-500 text-sm">{mechanism.count} tests</span>
                                </div>
                                <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                                    <div className={`h-full bg-${mechanism.color}-500`} style={{ width: `${mechanism.percentage}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Mechanism Tabs */}
                    <div className="flex items-center gap-2 mt-6 pt-6 border-t border-zinc-800">
                        <button className="px-4 py-2 bg-purple-500/20 text-purple-light border border-purple-500 rounded-lg text-sm font-semibold">
                            Locators
                        </button>
                        <button className="px-4 py-2 bg-zinc-950 text-gray-400 border border-zinc-800 rounded-lg text-sm hover:border-zinc-700 transition-colors">
                            Parameters
                        </button>
                        <button className="px-4 py-2 bg-zinc-950 text-gray-400 border border-zinc-800 rounded-lg text-sm hover:border-zinc-700 transition-colors">
                            Assertions
                        </button>
                        <button className="px-4 py-2 bg-zinc-950 text-gray-400 border border-zinc-800 rounded-lg text-sm hover:border-zinc-700 transition-colors">
                            Environment
                        </button>
                    </div>
                </div>

                {/* Healed Tests Details */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white">Healed Tests Details</h2>
                        <div className="flex items-center gap-3">
                            <select
                                value={mechanismFilter}
                                onChange={(e) => setMechanismFilter(e.target.value)}
                                className="px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-purple"
                            >
                                <option>Filter by Mechanism</option>
                                <option>Locator Change</option>
                                <option>Parameter Fix</option>
                                <option>Assertion Update</option>
                            </select>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-sm focus:outline-none focus:border-purple"
                            >
                                <option>Filter by Status</option>
                                <option>Success</option>
                                <option>Failed</option>
                            </select>
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-zinc-800">
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Test Case ID
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Original Error
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Healing Mechanism
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Severity
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Result
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Time
                                    </th>
                                    <th className="text-left px-4 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                        Details
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {healedTests.map((test, index) => (
                                    <tr key={index} className="border-b border-zinc-800 hover:bg-white/[0.02] transition-colors">
                                        <td className="px-4 py-4">
                                            <Link to="#" className="text-purple-light hover:text-purple font-mono text-sm">
                                                {test.id}
                                            </Link>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="text-white text-sm font-mono">{test.originalError}</span>
                                        </td>
                                        <td className="px-4 py-4">{getMechanismBadge(test.mechanism)}</td>
                                        <td className="px-4 py-4">{getSeverityBadge(test.severity)}</td>
                                        <td className="px-4 py-4">
                                            <span className="px-2.5 py-1 bg-green-500/20 text-green-500 border border-green-500 rounded text-xs font-semibold">
                                                {test.result}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <span className="text-white text-sm">{test.time}</span>
                                        </td>
                                        <td className="px-4 py-4">
                                            <button className="px-3 py-1.5 bg-zinc-950 border border-zinc-800 hover:border-purple text-white text-xs font-semibold rounded-lg transition-all flex items-center gap-2">
                                                <span>📋</span>
                                                Diff
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HealingReport;
