import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, User as UserIcon, Loader2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { authApi } from '../api';

const Register = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setError('Biometric parity mismatch: Passwords do not align.');
            return;
        }

        if (!agreedToTerms) {
            setError('Authorization required: Please accept terms of operation.');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            // Map frontend fields to backend UserCreate schema
            const payload = {
                email: formData.email,
                password: formData.password,
                first_name: formData.firstName,
                last_name: formData.lastName
            };

            const response = await authApi.register(payload);

            // Store token and user data (auto-login after registration)
            localStorage.setItem('token', response.token);
            localStorage.setItem('user', JSON.stringify(response.user));

            navigate('/projects');
        } catch (err) {
            console.error("Registration failed:", err);
            setError(err.response?.data?.detail || "Registration sequence interrupted. Entity may already exist.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12 relative overflow-hidden">
            {/* Background Atmosphere */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-cyan-light/5 rounded-full blur-[150px] pointer-events-none"></div>

            <div className="w-full max-w-lg relative z-10">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-black text-white tracking-tighter mb-3 uppercase">Initialize Account</h1>
                    <p className="text-zinc-500 text-xs font-black uppercase tracking-[0.3em]">Join the Autonomous Testing Network</p>
                </div>

                {/* Registration Form */}
                <div className="bg-zinc-900/40 backdrop-blur-2xl border border-white/5 rounded-[40px] p-12 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-light/50 to-transparent"></div>

                    {error && (
                        <div className="mb-8 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
                            <AlertTriangle size={20} className="text-red-500 flex-shrink-0" />
                            <p className="text-red-500 text-[10px] font-black uppercase tracking-[0.15em] leading-relaxed">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {/* Name Fields */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">First Name</label>
                                <input
                                    type="text"
                                    placeholder="CASEY"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                    className="w-full px-5 py-4 bg-black border border-white/10 rounded-2xl text-white placeholder:text-zinc-800 focus:border-cyan-light focus:ring-1 focus:ring-cyan-light/20 transition-all outline-none font-bold text-sm"
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Last Name</label>
                                <input
                                    type="text"
                                    placeholder="REED"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                    className="w-full px-5 py-4 bg-black border border-white/10 rounded-2xl text-white placeholder:text-zinc-800 focus:border-cyan-light focus:ring-1 focus:ring-cyan-light/20 transition-all outline-none font-bold text-sm"
                                    required
                                />
                            </div>
                        </div>

                        {/* Email Field */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Neural ID (Email)</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    placeholder="OPERATOR@NEXUS.AI"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full px-5 py-4 pr-12 bg-black border border-white/10 rounded-2xl text-white placeholder:text-zinc-800 focus:border-cyan-light focus:ring-1 focus:ring-cyan-light/20 transition-all outline-none font-bold text-sm"
                                    required
                                />
                                <Mail size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-700" />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Access Protocol Key</label>
                            <div className="relative">
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

                        {/* Confirm Password Field */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Key Verification</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    className="w-full px-5 py-4 pr-12 bg-black border border-white/10 rounded-2xl text-white placeholder:text-zinc-800 focus:border-purple focus:ring-1 focus:ring-purple/20 transition-all outline-none font-bold text-sm"
                                    required
                                />
                            </div>
                        </div>

                        {/* Terms Agreement */}
                        <div className="flex items-start gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 group hover:border-white/10 transition-colors">
                            <div className="relative flex items-center justify-center">
                                <input
                                    type="checkbox"
                                    id="terms"
                                    checked={agreedToTerms}
                                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                                    className="w-6 h-6 rounded-lg border-2 border-white/10 bg-black text-cyan-light focus:ring-cyan-light focus:ring-offset-0 appearance-none checked:bg-cyan-light checked:border-cyan-light transition-all cursor-pointer"
                                />
                                {agreedToTerms && <ShieldCheck size={14} className="absolute text-black pointer-events-none" />}
                            </div>
                            <label htmlFor="terms" className="text-[10px] font-black text-zinc-500 uppercase tracking-widest cursor-pointer group-hover:text-zinc-300 transition-colors line-clamp-2">
                                Confirm adherence to the <Link to="/terms" className="text-cyan-light hover:underline">Nexus Operating Manual</Link> and <Link to="/privacy" className="text-cyan-light hover:underline">Data Secrecy Protocol</Link>.
                            </label>
                        </div>

                        {/* Create Account Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full flex items-center justify-center gap-3 px-8 py-5 bg-gradient-to-r from-purple to-purple-dark text-white text-[10px] font-black uppercase tracking-[0.25em] rounded-2xl transition-all shadow-xl shadow-purple/20 relative overflow-hidden group ${loading ? 'opacity-80' : ''}`}
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    Synchronizing Profile...
                                </>
                            ) : (
                                <>
                                    <UserIcon size={18} className="group-hover:scale-110 transition-transform" />
                                    Initialize Operator
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Login Link */}
                <div className="text-center mt-10">
                    <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.3em]">
                        Already registered?{' '}
                        <Link to="/login" className="text-cyan-light hover:text-white transition-colors underline underline-offset-8 decoration-cyan-light/20">
                            Access Terminal
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
