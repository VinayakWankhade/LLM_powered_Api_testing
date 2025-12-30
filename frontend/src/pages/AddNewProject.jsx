import { ArrowLeft, AlertTriangle, ArrowRight, HelpCircle, Loader2, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { projectsApi } from '../api';

const AddNewProject = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        gitUrl: '',
        description: '',
        apiBaseUrl: 'http://localhost:8000',
        language: 'javascript',
        codebasePath: '',
        apiDefinition: '',
        scanStrategy: 'Balanced',
    });

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError(null);

            // Map frontend fields to backend ProjectCreate schema
            const payload = {
                name: formData.name,
                gitUrl: formData.gitUrl,
                description: formData.description,
                apiBaseUrl: formData.apiBaseUrl,
            };

            const response = await projectsApi.create(payload);
            setSuccess(true);

            // Redirect after a brief success message
            setTimeout(() => {
                navigate(`/project/${response.project.id}`);
            }, 1500);

        } catch (err) {
            console.error("Project creation failed:", err);
            setError(err.response?.data?.detail || "Failed to initialize project nexus. Check terminal logs.");
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center animate-in zoom-in duration-500">
                    <CheckCircle2 size={80} className="text-purple mx-auto mb-6" />
                    <h2 className="text-4xl font-black text-white mb-2 uppercase tracking-tighter">Project Initialized</h2>
                    <p className="text-gray-400 font-mono text-sm">Redirecting to project control center...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            <div className="max-w-[1200px] mx-auto px-8 py-8">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] mb-6 text-zinc-500">
                    <Link to="/projects" className="flex items-center gap-1 hover:text-white transition-colors">
                        <ArrowLeft size={12} />
                        PROJECTS
                    </Link>
                    <span>/</span>
                    <span className="text-cyan-light">ONBOARDING</span>
                </div>

                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-5xl font-black text-white tracking-tighter mb-4">Initialize Project Nexus</h1>
                    <p className="text-zinc-500 font-medium max-w-2xl">Configure your codebase for autonomous scanning, neural test generation, and real-time integrity monitoring.</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-8">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                            <AlertTriangle size={20} className="text-red-500" />
                            <p className="text-red-400 text-sm font-bold uppercase tracking-tight">{error}</p>
                        </div>
                    )}

                    {/* Section 1: Core Configuration */}
                    <div className="bg-zinc-900 border border-white/5 rounded-2xl p-10 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Activity size={120} className="text-purple" />
                        </div>

                        <h2 className="text-xl font-black text-cyan-light mb-8 flex items-center gap-3">
                            <span className="w-8 h-8 rounded bg-cyan-light/10 flex items-center justify-center text-xs text-cyan-light border border-cyan-light/20">01</span>
                            CORE CONFIGURATION
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                            <div className="space-y-2">
                                <label htmlFor="name" className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">
                                    Project Identity
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    required
                                    placeholder="EPHEMERAL-SERVICE-A"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    className="w-full px-5 py-3.5 bg-black border border-white/10 rounded-lg text-white font-bold placeholder:text-zinc-800 focus:border-purple focus:ring-1 focus:ring-purple/20 transition-all outline-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="language" className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">
                                    Primary Logic Engine
                                </label>
                                <div className="relative">
                                    <select
                                        id="language"
                                        name="language"
                                        value={formData.language}
                                        onChange={handleInputChange}
                                        className="w-full px-5 py-3.5 bg-black border border-white/10 rounded-lg text-white font-bold focus:border-purple focus:ring-1 focus:ring-purple/20 transition-all outline-none appearance-none cursor-pointer uppercase tracking-widest text-xs"
                                    >
                                        <option value="javascript">JavaScript / Node.js</option>
                                        <option value="typescript">TypeScript</option>
                                        <option value="python">Python / FastAPI</option>
                                        <option value="go">Golang</option>
                                        <option value="java">Java / Spring</option>
                                    </select>
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-600">
                                        <HelpCircle size={16} />
                                    </div>
                                </div>
                            </div>

                            <div className="md:col-span-2 space-y-2">
                                <label htmlFor="description" className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">
                                    Strategic Summary (Optional)
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    rows="3"
                                    placeholder="Define the primary objective and scope of this entity..."
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="w-full px-5 py-3.5 bg-black border border-white/10 rounded-lg text-white font-medium placeholder:text-zinc-800 focus:border-purple focus:ring-1 focus:ring-purple/20 transition-all outline-none resize-none"
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Codebase Synchronization */}
                    <div className="bg-zinc-900 border border-white/5 rounded-2xl p-10 shadow-2xl">
                        <h2 className="text-xl font-black text-purple-light mb-8 flex items-center gap-3">
                            <span className="w-8 h-8 rounded bg-purple-light/10 flex items-center justify-center text-xs text-purple-light border border-purple-light/20">02</span>
                            CODEBASE SYNCHRONIZATION
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="md:col-span-2 space-y-2">
                                <label htmlFor="gitUrl" className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">
                                    Git Repository URI
                                </label>
                                <input
                                    type="url"
                                    id="gitUrl"
                                    name="gitUrl"
                                    required
                                    placeholder="https://github.com/project-nexus/core-api.git"
                                    value={formData.gitUrl}
                                    onChange={handleInputChange}
                                    className="w-full px-5 py-3.5 bg-black border border-white/10 rounded-lg text-white font-mono text-sm placeholder:text-zinc-800 focus:border-purple focus:ring-1 focus:ring-purple/20 transition-all outline-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="apiBaseUrl" className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">
                                    Live Endpoint Base URI
                                </label>
                                <input
                                    type="text"
                                    id="apiBaseUrl"
                                    name="apiBaseUrl"
                                    placeholder="http://localhost:8000"
                                    value={formData.apiBaseUrl}
                                    onChange={handleInputChange}
                                    className="w-full px-5 py-3.5 bg-black border border-white/10 rounded-lg text-white font-mono text-sm placeholder:text-zinc-800 focus:border-purple focus:ring-1 focus:ring-purple/20 transition-all outline-none"
                                />
                                <p className="text-[8px] font-bold text-zinc-600 tracking-widest uppercase ml-1">Used for live validation runs</p>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="scanStrategy" className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">
                                    Heuristic Scanning Strategy
                                </label>
                                <select
                                    id="scanStrategy"
                                    name="scanStrategy"
                                    value={formData.scanStrategy}
                                    onChange={handleInputChange}
                                    className="w-full px-5 py-3.5 bg-black border border-white/10 rounded-lg text-white font-bold focus:border-purple outline-none appearance-none cursor-pointer uppercase tracking-widest text-[10px]"
                                >
                                    <option value="Fast">Fast (Route Detection Only)</option>
                                    <option value="Balanced">Balanced (Structure + Data Types)</option>
                                    <option value="Deep">Deep (Full Data Flow Analysis)</option>
                                </select>
                            </div>
                        </div>

                        {/* Security Notice */}
                        <div className="mt-10 bg-black/40 border border-white/5 rounded-2xl p-6 flex items-start gap-4">
                            <div className="p-3 bg-red-500/10 rounded-xl">
                                <Shield size={20} className="text-red-500" />
                            </div>
                            <div>
                                <h4 className="text-xs font-black text-white uppercase tracking-widest mb-1">Access Protocol Information</h4>
                                <p className="text-zinc-500 text-xs leading-relaxed">System requires read-only access to the specified repository. Ensure all environment variables are decrypted and accessible within the worker environment.</p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-6 pt-4">
                        <Link
                            to="/projects"
                            className="px-8 py-4 bg-transparent border border-white/5 hover:border-white/20 text-zinc-500 hover:text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all"
                        >
                            Abort Configuration
                        </Link>
                        <button
                            type="submit"
                            disabled={loading}
                            className={`flex items-center gap-3 px-10 py-4 bg-purple hover:bg-purple-dark text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl transition-all shadow-2xl shadow-purple/20 relative overflow-hidden ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Synchronizing...
                                </>
                            ) : (
                                <>
                                    Initialize Nexus
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>

            {/* Background Decorative Element */}
            <div className="fixed bottom-0 left-0 w-full h-1/3 bg-gradient-to-t from-purple/5 to-transparent pointer-events-none z-[-1]"></div>
        </div>
    );
};

export default AddNewProject;
