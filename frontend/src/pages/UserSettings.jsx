import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Bell, Shield, Key, Upload, Loader2, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import { authApi } from '../api';

const UserSettings = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const [notificationPreferences, setNotificationPreferences] = useState({
        critical_alert: true,
        weekly_summary: false,
        test_execution: true,
    });

    useEffect(() => {
        fetchUser();
    }, []);

    const fetchUser = async () => {
        try {
            setLoading(true);
            const data = await authApi.verify();
            setUser(data.user);
            setFormData({
                firstName: data.user.firstName || '',
                lastName: data.user.lastName || '',
            });
            if (data.user.notificationPreferences) {
                setNotificationPreferences({
                    critical_alert: data.user.notificationPreferences.critical_alert ?? true,
                    weekly_summary: data.user.notificationPreferences.weekly_summary ?? false,
                    test_execution: data.user.notificationPreferences.test_execution ?? true,
                });
            }
        } catch (err) {
            console.error("Failed to load user profile:", err);
            setError("Identity verification failed. Please re-authenticate.");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        // ... (existing logic)
    };

    const handleNotificationToggle = async (key) => {
        const newPrefs = { ...notificationPreferences, [key]: !notificationPreferences[key] };
        setNotificationPreferences(newPrefs);

        try {
            await authApi.updateProfile({ notification_preferences: newPrefs });
        } catch (err) {
            console.error("Failed to update preferences:", err);
            // Revert on failure
            setNotificationPreferences(notificationPreferences);
        }
    };

    const handleToggleMFA = async () => {
        try {
            const newState = !user.mfaEnabled;
            await authApi.updateProfile({ mfa_enabled: newState });
            setUser({ ...user, mfaEnabled: newState });
            setSuccess(`Multi-Factor Authentication ${newState ? 'Enabled' : 'Disabled'}`);
            setTimeout(() => setSuccess(null), 3000);
        } catch (err) {
            console.error("Failed to toggle MFA:", err);
            setError("Failed to update security settings.");
        }
    };

    // ... (rendering logic)

    // In Notifications Tab:
    // ...

    // In Security Tab:
    // ...
    <div className="p-6 bg-black/50 border border-white/5 rounded-3xl text-center">
        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-wider mb-2">MFA Matrix</p>
        <button onClick={handleToggleMFA} className={`text-lg font-black italic uppercase tracking-tighter ${user?.mfaEnabled ? 'text-green-500' : 'text-red-500'}`}>
            {user?.mfaEnabled ? 'Active' : 'Deactivated'}
        </button>
    </div>


    if (loading && !user) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="text-purple animate-spin" size={40} />
            </div>
        );
    }

    const initials = user ? `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}` : '??';

    return (
        <div className="min-h-screen bg-black text-white selection:bg-purple/30">
            <div className="max-w-[1400px] mx-auto px-8 py-12 relative">
                {/* Background Glow */}
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-purple/5 blur-[120px] pointer-events-none rounded-full"></div>

                {/* Header */}
                <div className="mb-12">
                    <Link
                        to="/dashboard"
                        className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-all mb-4 text-[10px] font-black uppercase tracking-[0.2em] group"
                    >
                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        Neural Core
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-4 mb-2">
                                <h1 className="text-5xl font-black italic uppercase tracking-tighter">Command Center</h1>
                                <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/20 rounded-full">
                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                                    <span className="text-green-500 text-[10px] font-black uppercase tracking-widest">Authenticated</span>
                                </div>
                            </div>
                            <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Manage your identity and platform preferences</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-12 space-y-2">
                            {[
                                { id: 'profile', icon: User, label: 'Neural Profile' },
                                { id: 'notifications', icon: Bell, label: 'Alert Config' },
                                { id: 'security', icon: Shield, label: 'Vault Safety' }
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center justify-between px-6 py-4 rounded-2xl transition-all border group ${activeTab === tab.id
                                        ? 'bg-purple border-purple-light/20 text-white shadow-xl shadow-purple/20'
                                        : 'bg-zinc-900/40 border-white/5 text-zinc-500 hover:text-white hover:border-white/10'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <tab.icon size={18} className={activeTab === tab.id ? 'text-white' : 'group-hover:text-purple transition-colors'} />
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">{tab.label}</span>
                                    </div>
                                    {activeTab === tab.id && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                                </button>
                            ))}

                            <div className="pt-8 mt-8 border-t border-white/5">
                                <Link
                                    to="/api-keys"
                                    className="w-full flex items-center gap-4 px-6 py-4 bg-zinc-900/20 border border-white/5 text-zinc-500 hover:text-white hover:border-purple/30 rounded-2xl transition-all group"
                                >
                                    <Key size={18} className="group-hover:text-purple transition-colors" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">Key Management</span>
                                    <ExternalLink size={12} className="ml-auto opacity-30" />
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        {error && (
                            <div className="mb-8 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4">
                                <AlertTriangle size={20} className="text-red-500" />
                                <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className="mb-8 p-5 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center gap-4">
                                <CheckCircle2 size={20} className="text-green-500" />
                                <p className="text-green-500 text-[10px] font-black uppercase tracking-widest">{success}</p>
                            </div>
                        )}

                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[40px] p-12 shadow-2xl">
                                <div className="flex items-center gap-10 mb-12">
                                    <div className="relative group">
                                        <div className="w-32 h-32 rounded-[40px] bg-gradient-to-br from-purple to-cyan-light p-1 shadow-2xl shadow-purple/20 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                                            <div className="w-full h-full rounded-[38px] bg-zinc-950 flex items-center justify-center text-3xl font-black italic text-white tracking-tighter">
                                                {initials}
                                            </div>
                                        </div>
                                        <button className="absolute -bottom-2 -right-2 w-10 h-10 bg-white text-black rounded-xl flex items-center justify-center shadow-xl hover:scale-110 transition-all border-4 border-zinc-900">
                                            <Upload size={16} />
                                        </button>
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black italic uppercase tracking-tighter text-white mb-2">{user.firstName} {user.lastName}</h2>
                                        <div className="flex items-center gap-3 text-zinc-500">
                                            <span className="text-[10px] font-black uppercase tracking-widest bg-white/5 border border-white/10 px-3 py-1 rounded-full">{user.role}</span>
                                            <span className="text-zinc-700">•</span>
                                            <span className="text-[10px] font-bold uppercase tracking-widest">{user.email}</span>
                                        </div>
                                    </div>
                                </div>

                                <form onSubmit={handleUpdateProfile} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">First Identity</label>
                                            <input
                                                type="text"
                                                value={formData.firstName}
                                                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                                className="w-full px-6 py-4 bg-black/50 border border-white/10 rounded-2xl text-white outline-none focus:border-purple transition-all font-bold"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Last Identity</label>
                                            <input
                                                type="text"
                                                value={formData.lastName}
                                                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                                className="w-full px-6 py-4 bg-black/50 border border-white/10 rounded-2xl text-white outline-none focus:border-purple transition-all font-bold"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Verified Email</label>
                                            <input
                                                type="email"
                                                value={user.email}
                                                disabled
                                                className="w-full px-6 py-4 bg-zinc-950 border border-white/5 rounded-2xl text-zinc-600 font-bold cursor-not-allowed italic"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Temporal Zone</label>
                                            <select className="w-full px-6 py-4 bg-black/50 border border-white/10 rounded-2xl text-white outline-none focus:border-purple transition-all font-bold appearance-none cursor-pointer">
                                                <option>Digital Nomad / UTC</option>
                                                <option>Eastern Grid / GMT-5</option>
                                                <option>Pacific Grid / GMT-8</option>
                                                <option>Standard India / GMT+5:30</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-end gap-4 pt-8 border-t border-white/5">
                                        <button
                                            type="button"
                                            onClick={() => window.location.reload()}
                                            className="px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 hover:text-white transition-all"
                                        >
                                            Revert Logic
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={saving}
                                            className="px-10 py-4 bg-purple hover:bg-purple-dark disabled:opacity-50 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl transition-all shadow-xl shadow-purple/20 flex items-center gap-3"
                                        >
                                            {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                                            Commit Changes
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Notifications Tab */}
                        {activeTab === 'notifications' && (
                            <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[40px] p-12 shadow-2xl">
                                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white mb-8">Alert Protocols</h2>
                                <div className="space-y-4">
                                    {[
                                        { id: 'critical_alert', label: 'Critical System Failures', desc: 'Real-time alerts for backend crashes and scan errors' },
                                        { id: 'weekly_summary', label: 'Weekly Summary Uplink', desc: 'Aggregated analytics report delivered every cycle' },
                                        { id: 'test_execution', label: 'Test Execution Sync', desc: 'Passive alerts when test suites finish processing' }
                                    ].map((proto) => (
                                        <div key={proto.id}
                                            onClick={() => handleNotificationToggle(proto.id)}
                                            className="flex items-center justify-between p-6 bg-black/30 border border-white/5 rounded-3xl group hover:border-white/10 transition-all cursor-pointer">
                                            <div>
                                                <h3 className="text-xs font-black text-white uppercase tracking-widest mb-1">{proto.label}</h3>
                                                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">{proto.desc}</p>
                                            </div>
                                            <div className={`w-12 h-6 rounded-full relative transition-colors ${notificationPreferences[proto.id] ? 'bg-purple' : 'bg-zinc-800'}`}>
                                                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${notificationPreferences[proto.id] ? 'left-7' : 'left-1'}`}></div>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="mt-8 p-6 bg-purple/10 border border-purple/20 rounded-2xl">
                                        <p className="text-purple text-[10px] font-black uppercase tracking-widest text-center italic">Protocol customization coming in Nexus Update 2.0</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Security Tab */}
                        {activeTab === 'security' && (
                            <div className="space-y-8">
                                <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[40px] p-12 shadow-2xl">
                                    <div className="flex items-center justify-between mb-8">
                                        <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">Security Vitals</h2>
                                        <div className="text-orange-500 flex items-center gap-2">
                                            <AlertTriangle size={18} />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Enhanced Shielding Recommended</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                                        <div className="p-6 bg-black/50 border border-white/5 rounded-3xl text-center">
                                            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-wider mb-2">MFA Matrix</p>
                                            <p className="text-red-500 text-lg font-black italic uppercase tracking-tighter">Deactivated</p>
                                        </div>
                                        <div className="p-6 bg-black/50 border border-white/5 rounded-3xl text-center">
                                            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-wider mb-2">Credential Age</p>
                                            <p className="text-white text-lg font-black italic uppercase tracking-tighter">{Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24))} Days</p>
                                        </div>
                                        <div className="p-6 bg-black/50 border border-white/5 rounded-3xl text-center">
                                            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-wider mb-2">Neural Links</p>
                                            <p className="text-purple text-lg font-black italic uppercase tracking-tighter">Verified</p>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="p-8 bg-zinc-950/50 border border-white/5 rounded-[32px] flex items-center justify-between group hover:border-purple/30 transition-all">
                                            <div className="flex items-center gap-6">
                                                <div className="w-12 h-12 rounded-2xl bg-black border border-white/10 flex items-center justify-center">
                                                    <Key size={20} className="text-purple" />
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-black text-white uppercase tracking-widest mb-1">Developer API Forge</h3>
                                                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest italic">Provision and decommission system access tokens</p>
                                                </div>
                                            </div>
                                            <Link to="/api-keys" className="px-6 py-3 bg-white text-black text-[10px] font-black uppercase tracking-[0.2em] rounded-xl hover:bg-zinc-200 transition-all">
                                                Enter Forge
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserSettings;
