import { ArrowLeft, Info, Copy, Eye, EyeOff, Save, Trash2, Loader2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { projectsApi } from '../api';

const ProjectSettings = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        gitUrl: '',
        apiBaseUrl: '',
    });

    useEffect(() => {
        const fetchProject = async () => {
            try {
                setLoading(true);
                const data = await projectsApi.get(id);
                setFormData({
                    name: data.project.name || '',
                    description: data.project.description || '',
                    gitUrl: data.project.gitUrl || '',
                    apiBaseUrl: data.project.apiBaseUrl || '',
                });
            } catch (err) {
                console.error("Failed to load project:", err);
                setError("Failed to retrieve project nexus configuration.");
            } finally {
                setLoading(false);
            }
        };
        fetchProject();
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSaveChanges = async () => {
        try {
            setSaving(true);
            setError(null);

            const payload = {
                name: formData.name,
                description: formData.description,
                git_url: formData.gitUrl,
                api_base_url: formData.apiBaseUrl,
            };

            await projectsApi.update(id, payload);
            // Optionally show success toast
        } catch (err) {
            console.error("Update failed:", err);
            setError("Failed to sync project changes to the cloud.");
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteProject = async () => {
        try {
            setSaving(true);
            await projectsApi.delete(id);
            navigate('/projects');
        } catch (err) {
            console.error("Deletion failed:", err);
            setError("Failed to decommission project nexus. Permission denied or system error.");
            setShowDeleteConfirm(false);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="text-purple animate-spin" size={48} />
                    <p className="text-zinc-500 font-bold uppercase tracking-widest text-xs">Querying Project Core...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black">
            <div className="max-w-[1200px] mx-auto px-8 py-12 relative">
                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-purple/5 blur-[120px] pointer-events-none rounded-full"></div>

                {/* Back Button */}
                <Link
                    to={`/project/${id}`}
                    className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-all mb-10 group"
                >
                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Return to Nexus</span>
                </Link>

                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter italic">Project Configuration</h1>
                        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest leading-loose">Internal settings for {formData.name}</p>
                    </div>
                </div>

                {error && (
                    <div className="mb-8 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
                        <AlertTriangle size={20} className="text-red-500 flex-shrink-0" />
                        <p className="text-red-500 text-[10px] font-black uppercase tracking-[0.15em] leading-relaxed">{error}</p>
                    </div>
                )}

                {/* Form Sections */}
                <div className="space-y-8 relative z-10">
                    {/* Project Information */}
                    <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-10 shadow-2xl">
                        <div className="flex items-center gap-3 mb-10">
                            <div className="w-10 h-10 rounded-xl bg-purple/10 flex items-center justify-center border border-purple/20">
                                <Info size={20} className="text-purple" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white uppercase tracking-tight">Core Metadata</h2>
                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Primary project identifiers</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">
                                    Entity Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-5 py-4 bg-black border border-white/10 rounded-2xl text-white placeholder:text-zinc-800 focus:border-purple focus:ring-1 focus:ring-purple/20 transition-all outline-none font-bold text-sm"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">
                                    Source Repository (GIT URL)
                                </label>
                                <input
                                    type="text"
                                    name="gitUrl"
                                    value={formData.gitUrl}
                                    onChange={handleInputChange}
                                    className="w-full px-5 py-4 bg-black border border-white/10 rounded-2xl text-white placeholder:text-zinc-800 focus:border-purple focus:ring-1 focus:ring-purple/20 transition-all outline-none font-bold text-sm"
                                />
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">
                                    API Endpoint Base
                                </label>
                                <input
                                    type="text"
                                    name="apiBaseUrl"
                                    value={formData.apiBaseUrl}
                                    onChange={handleInputChange}
                                    placeholder="https://api.example.com"
                                    className="w-full px-5 py-4 bg-black border border-white/10 rounded-2xl text-white placeholder:text-zinc-800 focus:border-purple focus:ring-1 focus:ring-purple/20 transition-all outline-none font-bold text-sm"
                                />
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">
                                    Mission Description
                                </label>
                                <textarea
                                    name="description"
                                    rows="4"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="w-full px-5 py-4 bg-black border border-white/10 rounded-2xl text-white placeholder:text-zinc-800 focus:border-purple focus:ring-1 focus:ring-purple/20 transition-all outline-none font-bold text-sm resize-none"
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Git & Webhook (Feature Ready UI) */}
                    <div className="bg-zinc-900/40 backdrop-blur-xl border border-white/5 rounded-[32px] p-10 opacity-50 grayscale pointer-events-none relative overflow-hidden group">
                        <div className="absolute inset-0 flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60">
                            <span className="text-[10px] font-black text-white uppercase tracking-[0.3em] bg-purple px-4 py-2 rounded-lg">Coming in Version 2.0</span>
                        </div>
                        <div className="flex items-center gap-3 mb-8">
                            <div className="w-10 h-10 rounded-xl bg-cyan-light/10 flex items-center justify-center border border-cyan-light/20">
                                <ShieldAlert size={20} className="text-cyan-light" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-white uppercase tracking-tight">Advanced Protocols</h2>
                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest">Webhooks & Git synchronization</p>
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="h-4 w-3/4 bg-zinc-800 rounded-full animate-pulse"></div>
                            <div className="h-4 w-1/2 bg-zinc-800 rounded-full animate-pulse"></div>
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-red-500/5 border border-red-500/10 rounded-[32px] p-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center border border-red-500/20">
                                <ShieldAlert size={20} className="text-red-500" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-red-500 uppercase tracking-tight italic">Decommissioning Zone</h2>
                                <p className="text-[10px] text-red-500/50 font-bold uppercase tracking-widest">Destructive operations</p>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 p-6 bg-red-500/5 border border-red-500/10 rounded-2xl">
                            <div>
                                <h3 className="text-white font-bold mb-1">Erase Project Nexus</h3>
                                <p className="text-zinc-500 text-xs">Permanently remove all data, test cases, and analytics associated with this project. This action cannot be reversed.</p>
                            </div>
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="px-6 py-4 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-red-500/20 flex items-center gap-2"
                            >
                                <Trash2 size={16} />
                                Purge Project
                            </button>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-6 pt-4">
                        <Link
                            to={`/project/${id}`}
                            className="px-8 py-4 text-zinc-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-colors"
                        >
                            Discard Changes
                        </Link>
                        <button
                            onClick={handleSaveChanges}
                            disabled={saving}
                            className={`px-10 py-5 bg-purple hover:bg-purple-dark text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-purple/20 flex items-center gap-3 ${saving ? 'opacity-80' : ''}`}
                        >
                            {saving ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Synchronizing...
                                </>
                            ) : (
                                <>
                                    <Save size={16} />
                                    Commit Configuration
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Deletion Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-sm" onClick={() => !saving && setShowDeleteConfirm(false)}></div>
                    <div className="relative bg-zinc-900 border border-white/10 rounded-[40px] p-12 max-w-md w-full shadow-2xl">
                        <div className="w-20 h-20 rounded-3xl bg-red-500/10 flex items-center justify-center border border-red-500/20 mx-auto mb-8">
                            <ShieldAlert size={40} className="text-red-500" />
                        </div>
                        <h2 className="text-3xl font-black text-white text-center mb-4 uppercase tracking-tighter">Confirm Purge?</h2>
                        <p className="text-zinc-500 text-center mb-10 text-xs font-bold leading-relaxed uppercase tracking-widest">
                            You are about to initiate the permanent deletion of <span className="text-white italic">{formData.name}</span>. All neural data will be lost.
                        </p>
                        <div className="flex flex-col gap-4">
                            <button
                                onClick={handleDeleteProject}
                                disabled={saving}
                                className="w-full py-5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-2"
                            >
                                {saving ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                Confirm Decommission
                            </button>
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={saving}
                                className="w-full py-5 bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-2xl transition-all"
                            >
                                Abort Sequence
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectSettings;
