import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Key, BarChart3, Shield, Search, Copy, Trash2, Loader2, AlertTriangle, CheckCircle2, XCircle } from 'lucide-react';
import { apiKeysApi } from '../api';

const APIKeysManagement = () => {
    const [loading, setLoading] = useState(true);
    const [keys, setKeys] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('All Keys');
    const [error, setError] = useState(null);

    // Modals & Forms
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newKeyName, setNewKeyName] = useState('');
    const [generatedKey, setGeneratedKey] = useState(null); // { secret_key, ... }
    const [revokingId, setRevokingId] = useState(null);

    useEffect(() => {
        fetchKeys();
    }, []);

    const fetchKeys = async () => {
        try {
            setLoading(true);
            const data = await apiKeysApi.list();
            setKeys(data);
        } catch (err) {
            console.error("Failed to load API keys:", err);
            setError("Failed to retrieve security credentials from the vault.");
        } finally {
            setLoading(false);
        }
    };

    const handleGenerateKey = async (e) => {
        e.preventDefault();
        try {
            setError(null);
            const data = await apiKeysApi.create({ name: newKeyName });
            setGeneratedKey(data);
            setShowCreateModal(false);
            setNewKeyName('');
            fetchKeys();
        } catch (err) {
            console.error("Key generation failed:", err);
            setError("Failed to mint new security token.");
        }
    };

    const handleRevokeKey = async (id) => {
        try {
            await apiKeysApi.revoke(id);
            setRevokingId(null);
            fetchKeys();
        } catch (err) {
            console.error("Revocation failed:", err);
            setError("Authorization sequence failed to decommission key.");
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        // Could add a toast here
    };

    const filteredKeys = keys.filter(k => {
        const matchesSearch = k.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filterStatus === 'All Keys' ||
            (filterStatus === 'Active' && k.is_active) ||
            (filterStatus === 'Revoked' && !k.is_active);
        return matchesSearch && matchesStatus;
    });

    if (loading && keys.length === 0) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="text-purple animate-spin" size={40} />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black">
            <div className="max-w-[1400px] mx-auto px-8 py-12 relative">
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple/5 blur-[120px] pointer-events-none rounded-full"></div>

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-3 text-zinc-500 mb-6 uppercase tracking-[0.2em] text-[10px] font-black">
                            <Link to="/dashboard" className="hover:text-white transition-colors">Neural Core</Link>
                            <span>/</span>
                            <span className="text-white">API Credentials</span>
                        </div>
                        <h1 className="text-5xl font-black text-white mb-2 italic uppercase tracking-tighter">Security Vault</h1>
                        <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Manage programmatic access tokens for external integrations</p>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-3 px-8 py-4 bg-purple hover:bg-purple-dark text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-purple/20"
                    >
                        <Key size={16} />
                        Generate Token
                    </button>
                </div>

                {error && (
                    <div className="mb-8 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4">
                        <AlertTriangle size={20} className="text-red-500" />
                        <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">{error}</p>
                    </div>
                )}

                {/* Stats Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    {[
                        { label: 'Active Credentials', value: keys.filter(k => k.is_active).length, icon: Shield, color: 'text-purple' },
                        { label: 'Total Invocations', value: '0', icon: BarChart3, color: 'text-cyan-light' },
                        { label: 'System Health', value: 'Stable', icon: CheckCircle2, color: 'text-green-500' }
                    ].map((stat, i) => (
                        <div key={i} className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 p-8 rounded-[32px] shadow-2xl group hover:border-white/10 transition-all">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{stat.label}</span>
                                <stat.icon size={20} className={`${stat.color} opacity-50 group-hover:opacity-100 transition-opacity`} />
                            </div>
                            <div className="text-4xl font-black text-white italic">{stat.value}</div>
                        </div>
                    ))}
                </div>

                {/* Filter Bar */}
                <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
                    <div className="flex-1 relative w-full group">
                        <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-purple transition-colors" />
                        <input
                            type="text"
                            placeholder="Filter by identifier..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-16 pr-6 py-5 bg-zinc-900/40 border border-white/5 rounded-[24px] text-white placeholder:text-zinc-700 focus:border-purple/50 focus:ring-1 focus:ring-purple/20 transition-all outline-none font-bold text-sm"
                        />
                    </div>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="px-8 py-5 bg-zinc-900/40 border border-white/5 rounded-[24px] text-white font-black uppercase tracking-widest text-[10px] focus:outline-none focus:border-purple/50 transition-all cursor-pointer min-w-[200px]"
                    >
                        <option>All Keys</option>
                        <option>Active</option>
                        <option>Revoked</option>
                    </select>
                </div>

                {/* Keys Grid */}
                <div className="grid grid-cols-1 gap-6">
                    {filteredKeys.length === 0 ? (
                        <div className="py-24 text-center bg-zinc-900/20 border border-dashed border-white/10 rounded-[32px]">
                            <Key size={48} className="mx-auto text-zinc-800 mb-4 opacity-50" />
                            <p className="text-zinc-600 font-black uppercase tracking-widest text-xs">No matching credentials found in the nexus.</p>
                        </div>
                    ) : (
                        filteredKeys.map((k) => (
                            <div key={k.id} className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 p-8 rounded-[32px] group hover:bg-zinc-800/40 transition-all shadow-2xl relative overflow-hidden">
                                <div className="flex items-start justify-between relative z-10">
                                    <div className="flex items-center gap-5">
                                        <div className="w-14 h-14 rounded-2xl bg-black border border-white/10 flex items-center justify-center shadow-inner">
                                            <Key size={24} className={k.is_active ? "text-purple" : "text-zinc-700"} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black text-white uppercase tracking-tight mb-1">{k.name}</h3>
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-1.5 h-1.5 rounded-full ${k.is_active ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-red-500'}`}></div>
                                                    <span className={`text-[10px] font-black uppercase tracking-widest ${k.is_active ? 'text-green-500' : 'text-red-500'}`}>
                                                        {k.is_active ? 'Active' : 'Revoked'}
                                                    </span>
                                                </div>
                                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                                                    Created: {new Date(k.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {k.is_active && (
                                        <button
                                            onClick={() => setRevokingId(k.id)}
                                            className="px-6 py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-xl border border-red-500/20 transition-all flex items-center gap-2"
                                        >
                                            <Trash2 size={14} />
                                            Revoke
                                        </button>
                                    )}
                                </div>

                                {/* Key Display */}
                                <div className="mt-8 flex flex-col md:flex-row items-center gap-4">
                                    <div className="flex-1 w-full bg-black/50 border border-white/5 p-4 rounded-2xl flex items-center justify-between group/key">
                                        <code className="text-purple-light font-mono text-xs opacity-80 group-hover/key:opacity-100 transition-opacity">{k.key_preview}</code>
                                        <button
                                            onClick={() => copyToClipboard(k.key_preview)}
                                            className="p-2 hover:bg-white/5 rounded-lg text-zinc-500 hover:text-white transition-all"
                                            title="Copy Preview"
                                        >
                                            <Copy size={16} />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-8 px-6 text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
                                        <div>
                                            <span className="block opacity-50 mb-1">Last Sync</span>
                                            <span className="text-white">{k.last_used_at ? new Date(k.last_used_at).toLocaleDateString() : 'Never'}</span>
                                        </div>
                                        <div>
                                            <span className="block opacity-50 mb-1">Invocations</span>
                                            <span className="text-white">0</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => setShowCreateModal(false)}></div>
                    <div className="relative bg-zinc-900 border border-white/10 p-12 rounded-[40px] max-w-lg w-full shadow-2xl">
                        <h2 className="text-3xl font-black text-white italic uppercase tracking-tighter mb-2">New Credential</h2>
                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-10">Define a recognizable identifier for this token</p>

                        <form onSubmit={handleGenerateKey} className="space-y-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Key Identifier</label>
                                <input
                                    autoFocus
                                    type="text"
                                    required
                                    placeholder="e.g., CI/CD Pipeline"
                                    value={newKeyName}
                                    onChange={(e) => setNewKeyName(e.target.value)}
                                    className="w-full px-6 py-5 bg-black border border-white/10 rounded-2xl text-white outline-none focus:border-purple transition-all font-bold"
                                />
                            </div>
                            <div className="flex gap-4">
                                <button type="submit" className="flex-1 py-5 bg-purple hover:bg-purple-dark text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl transition-all shadow-xl shadow-purple/20">
                                    Initiate Generation
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="px-8 py-5 bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Response Modal (One-time reveal) */}
            {generatedKey && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/95 backdrop-blur-xl"></div>
                    <div className="relative bg-zinc-900 border border-purple/30 p-12 rounded-[40px] max-w-2xl w-full shadow-[0_0_100px_rgba(168,85,247,0.15)] animate-in zoom-in duration-300">
                        <div className="w-20 h-20 rounded-3xl bg-purple/10 border border-purple/20 flex items-center justify-center mb-8 mx-auto">
                            <Shield size={40} className="text-purple" />
                        </div>
                        <h2 className="text-3xl font-black text-white text-center mb-2 italic uppercase tracking-tighter">Credential Secure</h2>
                        <p className="text-zinc-500 text-center text-xs font-bold uppercase tracking-widest mb-10 leading-relaxed px-10">
                            Store this key securely. For maximum security, <span className="text-purple italic">it will never be displayed again.</span>
                        </p>

                        <div className="bg-black/80 border border-white/5 p-6 rounded-3xl mb-10 flex items-center justify-between group">
                            <code className="text-purple-light font-mono text-lg break-all">{generatedKey.secret_key}</code>
                            <button
                                onClick={() => copyToClipboard(generatedKey.secret_key)}
                                className="p-4 bg-purple/10 hover:bg-purple text-purple hover:text-white rounded-2xl transition-all shadow-xl"
                            >
                                <Copy size={20} />
                            </button>
                        </div>

                        <button
                            onClick={() => setGeneratedKey(null)}
                            className="w-full py-5 bg-white text-black text-[10px] font-black uppercase tracking-[0.4em] rounded-2xl hover:bg-zinc-200 transition-all shadow-2xl"
                        >
                            I have secured the token
                        </button>
                    </div>
                </div>
            )}

            {/* Revoke Confirm */}
            {revokingId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => setRevokingId(null)}></div>
                    <div className="relative bg-zinc-900 border border-red-500/20 p-12 rounded-[40px] max-w-md w-full shadow-2xl">
                        <XCircle size={60} className="text-red-500 mx-auto mb-6" />
                        <h2 className="text-3xl font-black text-white text-center mb-4 uppercase tracking-tighter">Decommission?</h2>
                        <p className="text-zinc-500 text-center text-[10px] font-bold uppercase tracking-widest leading-relaxed mb-10">
                            Revoking this key will immediately terminate all programmatic access associated with it. This action is terminal.
                        </p>
                        <div className="flex flex-col gap-4">
                            <button
                                onClick={() => handleRevokeKey(revokingId)}
                                className="w-full py-5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl transition-all shadow-lg shadow-red-500/20"
                            >
                                Confirm Revocation
                            </button>
                            <button
                                onClick={() => setRevokingId(null)}
                                className="w-full py-5 bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl transition-all"
                            >
                                Abort
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default APIKeysManagement;
