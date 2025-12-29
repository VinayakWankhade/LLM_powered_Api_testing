import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Edit, Copy, MoreVertical, Lightbulb } from 'lucide-react';

const TestCaseDetail = () => {
    const { id, testId } = useParams();
    const [activeTab, setActiveTab] = useState('payload');
    const [isEnabled, setIsEnabled] = useState(true);

    const tabs = [
        { id: 'payload', label: 'Payload & Request' },
        { id: 'response', label: 'Expected Response' },
        { id: 'assertions', label: 'Assertions' },
        { id: 'configuration', label: 'Configuration' },
    ];

    const aiRecommendations = [
        {
            title: 'Add Negative Test for Invalid ID',
            description: 'Test behavior when providing non-existent user ID to ensure proper error handling.',
            category: 'Edge Case',
            color: 'purple',
        },
        {
            title: 'Security Test for Authorization',
            description: 'Verify that unauthorized users cannot update user profiles.',
            category: 'Security',
            color: 'cyan',
        },
        {
            title: 'Performance Test for Large Payload',
            description: 'Test response time with maximum allowed payload size.',
            category: 'Performance',
            color: 'orange',
        },
        {
            title: 'Validation Test for Email Format',
            description: 'Ensure proper validation of email format in user updates.',
            category: 'Validation',
            color: 'green',
        },
    ];

    const requestPayload = `{
  "id": 123,
  "name": "John Doe",
  "email": "john.doe@example.com",
  "role": "admin",
  "status": "active"
}`;

    return (
        <div className="min-h-screen bg-black">
            <div className="max-w-[1920px] mx-auto px-8 py-8">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm mb-6 text-gray-400">
                    <Link to="/dashboard" className="hover:text-white transition-colors">Home</Link>
                    <span>/</span>
                    <Link to={`/project/${id}`} className="hover:text-white transition-colors">E-commerce API</Link>
                    <span>/</span>
                    <Link to={`/project/${id}/test-cases`} className="hover:text-white transition-colors">Generated Test Cases</Link>
                    <span>/</span>
                    <span className="text-white">Test Case Details</span>
                </div>

                {/* Back Button */}
                <Link
                    to={`/project/${id}/test-cases`}
                    className="inline-flex items-center gap-2 text-cyan-light hover:text-cyan transition-colors mb-6"
                >
                    <ArrowLeft size={18} />
                    Back to Test Cases
                </Link>

                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">TC-AI-001</h1>
                        <p className="text-gray-400">
                            Endpoint: <span className="text-white font-mono">/users/{'{id}'} - PUT</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Enabled Toggle */}
                        <div className="flex items-center gap-3">
                            <span className="text-white text-sm font-medium">Enabled</span>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={isEnabled}
                                    onChange={(e) => setIsEnabled(e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple/10 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple"></div>
                            </label>
                        </div>

                        {/* Functional Badge */}
                        <span className="px-4 py-2 bg-purple/20 text-purple-light border border-purple/30 rounded-lg text-sm font-semibold">
                            Functional
                        </span>

                        {/* Last Modified */}
                        <span className="text-gray-400 text-sm">Last Modified: 2 hours ago</span>

                        {/* More Options */}
                        <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
                            <MoreVertical size={20} className="text-gray-400" />
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Test Case Details */}
                    <div className="lg:col-span-2">
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                            {/* Tabs */}
                            <div className="flex items-center border-b border-zinc-800 bg-zinc-950">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`px-6 py-4 text-sm font-medium transition-colors relative ${activeTab === tab.id
                                                ? 'text-purple-light'
                                                : 'text-gray-400 hover:text-white'
                                            }`}
                                    >
                                        {tab.label}
                                        {activeTab === tab.id && (
                                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-light"></div>
                                        )}
                                    </button>
                                ))}
                            </div>

                            {/* Tab Content */}
                            <div className="p-6">
                                {activeTab === 'payload' && (
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-xl font-bold text-cyan-light">Request Payload</h3>
                                            <div className="flex items-center gap-2">
                                                <button className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-all text-sm">
                                                    <Edit size={14} />
                                                    Edit
                                                </button>
                                                <button className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-all text-sm">
                                                    <Copy size={14} />
                                                    Copy
                                                </button>
                                            </div>
                                        </div>

                                        <div className="bg-black border border-zinc-800 rounded-lg p-4">
                                            <pre className="text-green-400 text-sm font-mono overflow-x-auto">
                                                {requestPayload}
                                            </pre>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'response' && (
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-4">Expected Response</h3>
                                        <div className="bg-black border border-zinc-800 rounded-lg p-4">
                                            <pre className="text-green-400 text-sm font-mono">
                                                {`{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "id": 123,
    "name": "John Doe",
    "email": "john.doe@example.com",
    "role": "admin",
    "status": "active",
    "updated_at": "2025-11-24T14:30:15Z"
  }
}`}
                                            </pre>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'assertions' && (
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-4">Assertions</h3>
                                        <div className="space-y-3">
                                            {[
                                                'Response status code is 200',
                                                'Response body contains "success": true',
                                                'Response time is less than 500ms',
                                                'Response body contains updated user data',
                                                'Response headers include Content-Type: application/json',
                                            ].map((assertion, index) => (
                                                <div key={index} className="flex items-start gap-3 p-3 bg-zinc-950 border border-zinc-800 rounded-lg">
                                                    <div className="w-5 h-5 rounded-full bg-green-500/20 border border-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                        <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                                    </div>
                                                    <span className="text-white text-sm">{assertion}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'configuration' && (
                                    <div>
                                        <h3 className="text-xl font-bold text-white mb-4">Configuration</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-400 mb-2">Timeout (ms)</label>
                                                <input
                                                    type="number"
                                                    defaultValue="5000"
                                                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/10"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-400 mb-2">Retry Count</label>
                                                <input
                                                    type="number"
                                                    defaultValue="3"
                                                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/10"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-400 mb-2">Priority</label>
                                                <select className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/10">
                                                    <option>High</option>
                                                    <option>Medium</option>
                                                    <option>Low</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column - AI Recommendations */}
                    <div className="lg:col-span-1">
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                            <div className="flex items-center gap-2 mb-6">
                                <Lightbulb size={20} className="text-purple-light" />
                                <h3 className="text-xl font-bold text-purple-light">AI Recommendations</h3>
                            </div>

                            <div className="space-y-4">
                                {aiRecommendations.map((recommendation, index) => (
                                    <div key={index} className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 hover:border-purple/30 transition-colors">
                                        <h4 className="text-cyan-light font-semibold mb-2">{recommendation.title}</h4>
                                        <p className="text-gray-400 text-sm mb-3">{recommendation.description}</p>
                                        <div className="flex items-center justify-between">
                                            <span className={`px-2.5 py-1 bg-${recommendation.color}-500/20 text-${recommendation.color}-400 border border-${recommendation.color}-500/30 rounded text-xs font-medium`}>
                                                {recommendation.category}
                                            </span>
                                            <button className="px-3 py-1.5 bg-purple hover:bg-purple-dark text-white text-xs font-semibold rounded-lg transition-all">
                                                Generate
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <p className="text-xs text-gray-500 mt-6 flex items-center gap-1">
                                <span className="text-purple-light">✨</span>
                                AI-powered suggestions based on your API patterns
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TestCaseDetail;
