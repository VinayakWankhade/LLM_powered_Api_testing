import { Github, Twitter, Linkedin, Youtube } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
    const platformLinks = [
        { label: 'Dashboard', path: '/dashboard' },
        { label: 'Projects', path: '/projects' },
        { label: 'API Scanning', path: '/scanning' },
        { label: 'AI Test Generation', path: '/generation' },
        { label: 'Test Execution', path: '/execution' },
        { label: 'RL Optimization', path: '/optimization' },
    ];

    const analyticsLinks = [
        { label: 'Coverage Reports', path: '/analytics/coverage' },
        { label: 'Trend Analysis', path: '/analytics/trends' },
        { label: 'Self-Healing Reports', path: '/analytics/healing' },
        { label: 'Execution Logs', path: '/analytics/logs' },
        { label: 'Performance Metrics', path: '/analytics/performance' },
        { label: 'API Documentation', path: '/analytics/docs' },
    ];

    const accountLinks = [
        { label: 'Profile Settings', path: '/profile' },
        { label: 'Security', path: '/security' },
        { label: 'API Keys', path: '/api-keys' },
        { label: 'Integrations', path: '/integrations' },
        { label: 'Billing', path: '/billing' },
        { label: 'Support', path: '/support' },
    ];

    const resourceLinks = [
        { label: 'Documentation', path: '/docs' },
        { label: 'API Reference', path: '/api-reference' },
        { label: 'Tutorials', path: '/tutorials' },
        { label: 'Community', path: '/community' },
        { label: 'Changelog', path: '/changelog' },
        { label: 'Status Page', path: '/status' },
    ];

    return (
        <footer className="bg-zinc-950 border-t border-zinc-900 mt-auto">
            <div className="max-w-[1920px] mx-auto px-8 py-12 grid grid-cols-1 lg:grid-cols-[1.5fr_2.5fr] gap-16">
                {/* Brand Section */}
                <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                                <rect x="3" y="3" width="7" height="7" rx="1" fill="#8b5cf6" />
                                <rect x="3" y="14" width="7" height="7" rx="1" fill="#8b5cf6" />
                                <rect x="14" y="3" width="7" height="7" rx="1" fill="#06b6d4" />
                                <rect x="14" y="14" width="7" height="7" rx="1" fill="#06b6d4" />
                            </svg>
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-purple-light to-cyan-light bg-clip-text text-transparent">
                            AI TestGen
                        </span>
                    </div>
                    <p className="text-gray-400 text-sm leading-relaxed max-w-md">
                        Advanced AI-powered testing platform that automatically generates, executes, and optimizes API tests using cutting-edge machine learning and reinforcement optimization.
                    </p>
                    <div className="flex gap-3">
                        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 rounded-lg bg-zinc-900 text-gray-400 hover:bg-zinc-800 hover:text-purple-light hover:border-purple transition-all border border-zinc-800 hover:-translate-y-0.5">
                            <Github size={20} />
                        </a>
                        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 rounded-lg bg-zinc-900 text-gray-400 hover:bg-zinc-800 hover:text-purple-light hover:border-purple transition-all border border-zinc-800 hover:-translate-y-0.5">
                            <Twitter size={20} />
                        </a>
                        <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 rounded-lg bg-zinc-900 text-gray-400 hover:bg-zinc-800 hover:text-purple-light hover:border-purple transition-all border border-zinc-800 hover:-translate-y-0.5">
                            <Linkedin size={20} />
                        </a>
                        <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="flex items-center justify-center w-10 h-10 rounded-lg bg-zinc-900 text-gray-400 hover:bg-zinc-800 hover:text-purple-light hover:border-purple transition-all border border-zinc-800 hover:-translate-y-0.5">
                            <Youtube size={20} />
                        </a>
                    </div>
                </div>

                {/* Links Sections */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div>
                        <h4 className="text-xs font-bold text-gray-400 tracking-wider mb-4">PLATFORM</h4>
                        <ul className="flex flex-col gap-3">
                            {platformLinks.map((link) => (
                                <li key={link.path}>
                                    <Link to={link.path} className="text-gray-500 text-sm hover:text-purple-light transition-colors block">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-xs font-bold text-gray-400 tracking-wider mb-4">ANALYTICS</h4>
                        <ul className="flex flex-col gap-3">
                            {analyticsLinks.map((link) => (
                                <li key={link.path}>
                                    <Link to={link.path} className="text-gray-500 text-sm hover:text-purple-light transition-colors block">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-xs font-bold text-gray-400 tracking-wider mb-4">ACCOUNT</h4>
                        <ul className="flex flex-col gap-3">
                            {accountLinks.map((link) => (
                                <li key={link.path}>
                                    <Link to={link.path} className="text-gray-500 text-sm hover:text-purple-light transition-colors block">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-xs font-bold text-gray-400 tracking-wider mb-4">RESOURCES</h4>
                        <ul className="flex flex-col gap-3">
                            {resourceLinks.map((link) => (
                                <li key={link.path}>
                                    <Link to={link.path} className="text-gray-500 text-sm hover:text-purple-light transition-colors block">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t border-zinc-900 bg-black">
                <div className="max-w-[1920px] mx-auto px-8 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex flex-col md:flex-row items-center gap-8 text-sm text-gray-500">
                        <span>© 2025 AI TestGen Platform. All rights reserved.</span>
                        <div className="flex items-center gap-6">
                            <button className="text-gray-500 text-sm hover:text-white transition-colors">
                                🔒 Enterprise grade security
                            </button>
                            <Link to="/privacy" className="text-gray-500 text-sm hover:text-white transition-colors">
                                Privacy Policy
                            </Link>
                            <Link to="/terms" className="text-gray-500 text-sm hover:text-white transition-colors">
                                Terms of Service
                            </Link>
                            <Link to="/security" className="text-gray-500 text-sm hover:text-white transition-colors">
                                Security
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,1)] animate-pulse"></span>
                        <span className="text-sm text-green-500 font-medium">All systems operational</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
