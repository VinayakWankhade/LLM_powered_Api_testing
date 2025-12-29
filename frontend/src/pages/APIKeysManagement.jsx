import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Key, BarChart3, Shield, Search, Copy, Trash2 } from 'lucide-react';

const APIKeysManagement = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('All Keys');

    const apiKeys = [
        {
            name: 'GitHub Integration',
            status: 'Active',
            key: 'sk_live_...pqr',
            permissions: ['repo:read', 'repo:write', 'webhook:read'],
            created: 'Jan 15, 2025',
            lastUsed: 'Jan 20, 2025',
            apiCalls: '1,247',
        },
        {
            name: 'OpenAI API Key',
            status: 'Active',
            key: 'sk_test_...def',
            permissions: ['gpt:read', 'gpt:write', 'embeddings:read'],
            created: 'Jan 10, 2025',
            lastUsed: 'Jan 21, 2025',
            apiCalls: '5,892',
        },
        {
            name: 'Old Integration (Deprecated)',
            status: 'Revoked',
            key: 'sk_old_...used',
            permissions: ['legacy:read'],
            created: 'Dec 1, 2024',
            lastUsed: 'Never',
            apiCalls: '342',
        },
    ];

    return (
        <div className="min-h-screen bg-black">
            <div className="max-w-[1920px] mx-auto px-8 py-8">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm mb-6">
                    <Link to="/dashboard" className="text-cyan-light hover:text-cyan transition-colors">Dashboard</Link>
                    <span className="text-gray-500">&gt;</span>
                    <Link to="/settings" className="text-cyan-light hover:text-cyan transition-colors">Profile</Link>
                    <span className="text-gray-500">&gt;</span>
                    <Link to="/settings?tab=security" className="text-cyan-light hover:text-cyan transition-colors">Security</Link>
                    <span className="text-gray-500">&gt;</span>
                    <span className="text-white">API Keys</span>
                </div>

                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">API Keys Management</h1>
                        <p className="text-gray-400">Manage API keys for integrating with external services like Git repositories and LLM providers.</p>
                    </div>
                    <button className="flex items-center gap-2 px-6 py-3 bg-purple hover:bg-purple-dark text-white font-semibold rounded-lg transition-all">
                        <span className="text-xl">+</span>
                        Generate New Key
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-gray-400 text-sm">Active Keys</span>
                            <Key size={24} className="text-purple" />
                        </div>
                        <div className="text-4xl font-bold text-purple mb-1">2</div>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-gray-400 text-sm">Total API Calls</span>
                            <BarChart3 size={24} className="text-cyan-light" />
                        </div>
                        <div className="text-4xl font-bold text-cyan-light mb-1">7,481</div>
                    </div>
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-gray-400 text-sm">Revoked Keys</span>
                            <Shield size={24} className="text-orange-500" />
                        </div>
                        <div className="text-4xl font-bold text-orange-500 mb-1">1</div>
                    </div>
                </div>

                {/* Search and Filter */}
                <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1 relative">
                        <Search size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search API keys by name..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-purple"
                        />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-purple"
                    >
                        <option>All Keys</option>
                        <option>Active</option>
                        <option>Revoked</option>
                    </select>
                </div>

                {/* API Keys List */}
                <div className="space-y-4">
                    {apiKeys.map((apiKey, index) => (
                        <div key={index} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-zinc-950 border border-zinc-800 rounded-lg flex items-center justify-center">
                                        <Key size={20} className="text-green-500" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-semibold text-lg">{apiKey.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <div className={`w-2 h-2 rounded-full ${apiKey.status === 'Active' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                            <span className={`text-sm font-semibold ${apiKey.status === 'Active' ? 'text-green-500' : 'text-red-500'}`}>
                                                {apiKey.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <button className={`flex items-center gap-2 px-4 py-2 ${apiKey.status === 'Revoked' ? 'bg-zinc-800 text-gray-500 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white'} rounded-lg transition-all`}>
                                    <Trash2 size={16} />
                                    {apiKey.status === 'Revoked' ? 'Revoked' : 'Revoke'}
                                </button>
                            </div>

                            {/* API Key */}
                            <div className="bg-black border border-zinc-800 rounded-lg p-4 mb-4 flex items-center justify-between">
                                <code className="text-purple-light font-mono text-sm">{apiKey.key}</code>
                                <button className="flex items-center gap-2 px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-white text-sm rounded-lg transition-all">
                                    <Copy size={14} />
                                    Copy
                                </button>
                            </div>

                            {/* Permissions */}
                            <div className="mb-4">
                                <h4 className="text-white text-sm font-semibold mb-2">PERMISSIONS</h4>
                                <div className="flex flex-wrap gap-2">
                                    {apiKey.permissions.map((permission, i) => (
                                        <span key={i} className="px-3 py-1 bg-cyan-light/20 text-cyan-light border border-cyan-light rounded text-xs font-semibold">
                                            {permission}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Metadata */}
                            <div className="grid grid-cols-3 gap-4 text-sm">
                                <div>
                                    <p className="text-gray-500 mb-1">Created</p>
                                    <p className="text-white font-semibold">{apiKey.created}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 mb-1">Last Used</p>
                                    <p className="text-white font-semibold">{apiKey.lastUsed}</p>
                                </div>
                                <div>
                                    <p className="text-gray-500 mb-1">API Calls</p>
                                    <p className="text-white font-semibold">{apiKey.apiCalls}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default APIKeysManagement;
