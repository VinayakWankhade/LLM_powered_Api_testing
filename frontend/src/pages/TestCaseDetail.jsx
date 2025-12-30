import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Copy, MoreVertical, Lightbulb, Loader2, AlertTriangle, Terminal, Cpu, Database, Settings } from 'lucide-react';
import { testsApi, projectsApi } from '../api';

const TestCaseDetail = () => {
    const { id, testId } = useParams();
    const [testCase, setTestCase] = useState(null);
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('payload');
    const [isEnabled, setIsEnabled] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [testData, projectData] = await Promise.all([
                    testsApi.get(testId),
                    projectsApi.get(id)
                ]);
                setTestCase(testData);
                setProject(projectData);
                setIsEnabled(testData.isEnabled);
            } catch (err) {
                console.error("Error fetching test case:", err);
                setError("Failed to load protocol definition.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, testId]);

    const tabs = [
        { id: 'payload', label: 'REQUEST PAYLOAD', Icon: Terminal },
        { id: 'response', label: 'EXPECTED RESPONSE', Icon: Database },
        { id: 'assertions', label: 'LOGIC ASSERTIONS', Icon: Cpu },
        { id: 'configuration', label: 'EXECUTOR CONFIG', Icon: Settings },
    ];

    const aiRecommendations = [
        {
            title: 'Boundary Value Analysis',
            description: 'Inject maximum integer values into the payload keys to verify overflow handling.',
            category: 'Robustness',
            color: 'purple',
        },
        {
            title: 'Authorization Bypass Probe',
            description: 'Attempt request without JWT header to verify 401 Unauthorized compliance.',
            category: 'Security',
            color: 'cyan',
        },
        {
            title: 'Payload Stress Test',
            description: 'Replicate request with 5MB object tree to benchmark parser performance.',
            category: 'Performance',
            color: 'orange',
        },
    ];

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 size={48} className="text-purple animate-spin" />
                    <p className="text-gray-400 font-mono text-xs uppercase tracking-widest">Decoding test manifest...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-8">
                <div className="text-center">
                    <AlertTriangle size={48} className="text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">Access Denied</h2>
                    <p className="text-gray-400 font-mono text-sm mb-6">{error}</p>
                    <Link to={`/project/${id}/test-cases`} className="text-purple font-black uppercase text-xs tracking-widest hover:underline">Return to Registry</Link>
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
                    <Link to={`/project/${id}`} className="hover:text-white transition-colors">{project?.name}</Link>
                    <span>/</span>
                    <span className="text-purple-light">TEST CASE: {testCase.id}</span>
                </div>

                {/* Back Button */}
                <Link
                    to={`/project/${id}/test-cases`}
                    className="inline-flex items-center gap-2 text-cyan-light hover:text-cyan transition-colors mb-8 text-xs font-black uppercase tracking-tighter"
                >
                    <ArrowLeft size={16} />
                    Back to Registry
                </Link>

                {/* Header */}
                <div className="flex items-start justify-between mb-12">
                    <div>
                        <div className="flex items-center gap-4 mb-2">
                            <h1 className="text-5xl font-black text-white tracking-tighter">{testCase.name}</h1>
                            <span className={`px-3 py-1 bg-zinc-900 border border-white/10 text-[10px] font-black uppercase tracking-widest rounded-full ${testCase.status === 'passed' ? 'text-green-500' : 'text-purple-light'}`}>
                                {testCase.status || 'Active'}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="px-2 py-0.5 bg-cyan-light text-black text-[10px] font-black rounded">{testCase.method}</span>
                            <span className="text-zinc-500 font-mono text-sm tracking-tight">{testCase.path}</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        {/* Enabled Toggle */}
                        <div className="flex items-center gap-3 bg-zinc-900/50 border border-white/5 px-4 py-2 rounded-xl">
                            <span className="text-zinc-400 text-[10px] font-black uppercase tracking-widest">Protocol Enabled</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isEnabled}
                                    onChange={(e) => setIsEnabled(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-10 h-5 bg-zinc-800 border border-white/5 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-zinc-400 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple peer-checked:after:bg-white"></div>
                            </label>
                        </div>

                        {/* More Options */}
                        <button className="p-3 bg-zinc-900 border border-white/5 hover:border-purple/30 rounded-xl transition-all">
                            <MoreVertical size={20} className="text-zinc-500" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Test Case Details */}
                    <div className="lg:col-span-2">
                        <div className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
                            {/* Tabs */}
                            <div className="flex items-center border-b border-white/5 bg-zinc-950/50">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`flex items-center gap-3 px-8 py-5 text-[10px] font-black tracking-widest transition-all relative ${activeTab === tab.id
                                            ? 'text-purple-light bg-zinc-900'
                                            : 'text-zinc-500 hover:text-white'
                                            }`}
                                    >
                                        <tab.Icon size={14} className={activeTab === tab.id ? 'text-purple-light' : 'text-zinc-700'} />
                                        {tab.label}
                                        {activeTab === tab.id && (
                                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-light"></div>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Tab Content */}
                            <div className="p-8">
                                {activeTab === 'payload' && (
                                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <div className="flex items-center justify-between mb-6">
                                            <div>
                                                <h3 className="text-xl font-black text-white tracking-tight uppercase mb-1">Request Payload</h3>
                                                <p className="text-zinc-500 text-xs font-mono">Dynamic injection variables supported</p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-[10px] font-black uppercase tracking-widest transition-all">
                                                    <Edit size={14} />
                                                    Modify
                                                </button>
                                                <button className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-[10px] font-black uppercase tracking-widest transition-all">
                                                    <Copy size={14} />
                                                    Copy
                                                </button>
                                            </div>
                                        </div>

                                        <div className="bg-black border border-white/5 rounded-xl p-6 relative group">
                                            <div className="absolute top-4 right-4 text-[10px] font-black text-zinc-800 uppercase tracking-widest group-hover:text-zinc-600 transition-colors">JSON v4</div>
                                            <pre className="text-green-500/90 text-sm font-mono overflow-x-auto leading-relaxed">
                                                {JSON.stringify(testCase.requestPayload, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'response' && (
                                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <h3 className="text-xl font-black text-white tracking-tight uppercase mb-6">Expected Terminal State</h3>
                                        <div className="bg-black border border-white/5 rounded-xl p-6">
                                            <pre className="text-cyan-light/90 text-sm font-mono leading-relaxed">
                                                {JSON.stringify(testCase.expectedResponse || {}, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'assertions' && (
                                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <h3 className="text-xl font-black text-white tracking-tight uppercase mb-6">Protocol Verification Logic</h3>
                                        <div className="space-y-4">
                                            {testCase.assertions && testCase.assertions.length > 0 ? (
                                                testCase.assertions.map((assertion, index) => (
                                                    <div key={index} className="flex items-start gap-4 p-5 bg-black/40 border border-white/5 rounded-xl group hover:border-purple/30 transition-all">
                                                        <div className="w-6 h-6 rounded bg-purple/10 border border-purple/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                            <div className="w-1.5 h-1.5 rounded-full bg-purple animate-pulse"></div>
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="text-white text-sm font-bold mb-1 uppercase tracking-tight">{assertion.type || 'VALIDATION'}</div>
                                                            <div className="text-zinc-500 text-xs font-mono">{assertion.expected || assertion.value || 'Matches schema definition'}</div>
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-12 text-center border-2 border-dashed border-white/5 rounded-3xl">
                                                    <Cpu size={48} className="text-zinc-800 mx-auto mb-4" />
                                                    <p className="text-zinc-600 italic">No custom assertions defined for this sequence.</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'configuration' && (
                                    <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <h3 className="text-xl font-black text-white tracking-tight uppercase mb-6">Execution Runtime Parameters</h3>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="p-6 bg-black border border-white/5 rounded-xl">
                                                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Timeout Duration</label>
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="number"
                                                        defaultValue="5000"
                                                        className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-lg text-white font-mono text-sm focus:border-purple outline-none transition-all"
                                                    />
                                                    <span className="text-zinc-600 font-black text-xs">MS</span>
                                                </div>
                                            </div>
                                            <div className="p-6 bg-black border border-white/5 rounded-xl">
                                                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Fault Tolerance (Retries)</label>
                                                <input
                                                    type="number"
                                                    defaultValue="3"
                                                    className="w-full px-4 py-3 bg-zinc-900 border border-white/10 rounded-lg text-white font-mono text-sm focus:border-purple outline-none transition-all"
                                                />
                                            </div>
                                            <div className="p-6 bg-black border border-white/5 rounded-xl col-span-2">
                                                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-4">Execution Priority Matrix</label>
                                                <div className="grid grid-cols-3 gap-3">
                                                    {['LOW', 'MEDIUM', 'CRITICAL'].map(p => (
                                                        <button key={p} className={`py-3 rounded-lg border text-[10px] font-black tracking-widest transition-all ${testCase.priority?.toUpperCase() === p ? 'bg-purple text-white border-purple' : 'bg-transparent text-zinc-500 border-white/10 hover:border-zinc-700'}`}>
                                                            {p}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - AI Recommendations */}
                    <div className="lg:col-span-1">
                        <div className="bg-zinc-900 border border-white/5 rounded-2xl p-8 sticky top-8 shadow-2xl">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-purple/10 rounded-xl">
                                    <Lightbulb size={24} className="text-purple-light" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-white tracking-tight uppercase">AI Optimization</h3>
                                    <p className="text-[10px] font-black text-zinc-500 tracking-[0.2em] uppercase">Advanced Heuristics</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {aiRecommendations.map((recommendation, index) => (
                                    <div key={index} className="bg-black/60 border border-white/5 rounded-2xl p-6 group hover:border-purple/30 transition-all">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className={`px-2 py-0.5 bg-${recommendation.color === 'purple' ? 'purple' : recommendation.color + '-light'}/10 text-${recommendation.color === 'purple' ? 'purple' : recommendation.color + '-light'} border border-${recommendation.color === 'purple' ? 'purple' : recommendation.color + '-light'}/20 rounded text-[8px] font-black uppercase tracking-widest`}>
                                                {recommendation.category}
                                            </span>
                                        </div>
                                        <h4 className="text-white font-black text-sm mb-2 tracking-tight">{recommendation.title}</h4>
                                        <p className="text-zinc-500 text-xs leading-relaxed mb-6">{recommendation.description}</p>
                                        <button className="w-full py-3 bg-zinc-900 hover:bg-purple text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border border-white/5 hover:border-purple shadow-lg shadow-black/40">
                                            Inject Variant
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 pt-8 border-t border-white/5 uppercase text-center">
                                <p className="text-[10px] font-bold text-zinc-700 tracking-[0.3em]">Neural Engine v2.4 Active</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestCaseDetail;
