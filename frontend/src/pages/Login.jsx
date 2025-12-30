import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, Loader2, AlertTriangle } from 'lucide-react';
import { authApi } from '../api';

const Login = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError(null);

            const response = await authApi.login(formData.email, formData.password);

            // Store token and user data
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));

            navigate('/projects'); // Go to projects list after login
        } catch (err) {
            console.error("Login failed:", err);
            setError(err.response?.data?.detail || "Authentication sequence failed. Check credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-4 overflow-hidden relative">
            {/* Background Decorative Rings */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo and Header */}
                <div className="text-center mb-10 group">
                    <div className="flex items-center justify-center mb-6">
                        <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple to-purple-dark flex items-center justify-center shadow-2xl shadow-purple/30 group-hover:scale-105 transition-transform duration-500">
                            <span className="text-4xl animate-pulse">⚡</span>
                        </div>
                    </div>
                    <h1 className="text-4xl font-black text-white mb-2 tracking-tighter">AI TESTGEN</h1>
                    <p className="text-zinc-500 text-xs font-black uppercase tracking-[0.3em]">Neural Quality Assurance</p>
                </div>

                {/* Login Form */}
                <div className="bg-zinc-900/50 backdrop-blur-xl border border-white/5 rounded-3xl p-10 shadow-2xl">
                    <div className="mb-8">
                        <h2 className="text-2xl font-black text-white mb-1 uppercase tracking-tight">Access Terminal</h2>
                        <p className="text-zinc-500 text-xs font-medium">Synchronize with your testing environment</p>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                            <AlertTriangle size={18} className="text-red-500 flex-shrink-0" />
                            <p className="text-red-500 text-[10px] font-black uppercase tracking-widest">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Field */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">
                                System Identifier (Email)
                            </label>
                            <div className="relative group">
                                <input
                                    type="email"
                                    placeholder="OPERATOR@NEXUS.AI"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-5 py-4 pr-12 bg-black border border-white/10 rounded-2xl text-white placeholder:text-zinc-800 focus:border-purple focus:ring-1 focus:ring-purple/20 transition-all outline-none font-bold text-sm"
                                    required
                                />
                                <Mail size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-700 group-focus-within:text-purple transition-colors" />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between mb-1 ml-1">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                                    Encrypted Key
                                </label>
                                <Link
                                    to="/reset-password"
                                    className="text-[10px] font-black text-purple-light hover:text-white uppercase tracking-widest transition-colors"
                                >
                                    LOST ACCESS?
                                </Link>
                            </div>
                            <div className="relative group">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full px-5 py-4 pr-12 bg-black border border-white/10 rounded-2xl text-white placeholder:text-zinc-800 focus:border-purple focus:ring-1 focus:ring-purple/20 transition-all outline-none font-bold text-sm"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-700 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Sign In Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full flex items-center justify-center gap-3 px-6 py-5 bg-purple hover:bg-purple-dark text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-purple/20 relative overflow-hidden group ${loading ? 'opacity-80' : ''}`}
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={16} className="animate-spin" />
                                    Establishing Connection...
                                </>
                            ) : (
                                <>
                                    <Lock size={16} className="group-hover:scale-110 transition-transform" />
                                    Initialize Session
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Sign Up Link */}
                <div className="text-center mt-8 space-y-4">
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.2em]">
                        New to the network?{' '}
                        <Link to="/register" className="text-purple-light hover:text-white transition-colors underline underline-offset-4 decoration-purple/30">
                            Register Operator
                        </Link>
                    </p>
                </div>
            </div>

            {/* Footer Decorative Line */}
            <div className="fixed bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-purple/20 to-transparent"></div>
        </div>
    );
};

export default Login;
