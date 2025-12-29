import { Search, Bell, Moon, Plus, User, Settings, Key, LogOut } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';

const Navigation = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showPlusMenu, setShowPlusMenu] = useState(false);

    const navItems = [
        { path: '/dashboard', label: 'Dashboard', icon: '🏠' },
        { path: '/projects', label: 'Projects', icon: '📁' },
        { path: '/analytics/global-coverage', label: 'Analytics', icon: '📊' },
    ];

    return (
        <nav className="bg-zinc-950 border-b border-zinc-900 sticky top-0 z-50">
            <div className="max-w-[1920px] mx-auto px-8 h-16 flex items-center gap-8">
                {/* Logo */}
                <Link to="/dashboard" className="flex items-center gap-3 text-white font-bold text-lg hover:opacity-80 transition-opacity">
                    <div className="flex items-center justify-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <rect x="3" y="3" width="7" height="7" rx="1" fill="#8b5cf6" />
                            <rect x="3" y="14" width="7" height="7" rx="1" fill="#8b5cf6" />
                            <rect x="14" y="3" width="7" height="7" rx="1" fill="#06b6d4" />
                            <rect x="14" y="14" width="7" height="7" rx="1" fill="#06b6d4" />
                        </svg>
                    </div>
                    <span className="bg-gradient-to-r from-purple-light to-cyan-light bg-clip-text text-transparent">
                        AI TestGen
                    </span>
                </Link>

                {/* Nav Items */}
                <div className="flex items-center gap-2 flex-1">
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all relative ${location.pathname === item.path || location.pathname.startsWith(item.path + '/')
                                ? 'text-white bg-purple/10'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                }`}
                        >
                            <span className="text-base">{item.icon}</span>
                            <span>{item.label}</span>
                            {(location.pathname === item.path || location.pathname.startsWith(item.path + '/')) && (
                                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-purple to-cyan-light"></span>
                            )}
                        </Link>
                    ))}
                </div>

                {/* Right Section */}
                <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 transition-all focus-within:border-purple focus-within:ring-2 focus-within:ring-purple/10">
                        <Search size={16} className="text-gray-500 flex-shrink-0" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="bg-transparent border-none outline-none text-white text-sm w-48 placeholder:text-gray-500"
                        />
                    </div>

                    {/* Add Button with Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowPlusMenu(!showPlusMenu)}
                            className="flex items-center justify-center w-9 h-9 rounded-lg bg-transparent text-gray-400 hover:bg-white/5 hover:text-white transition-all"
                            title="Quick Actions"
                        >
                            <Plus size={20} />
                        </button>

                        {/* Plus Dropdown Menu */}
                        {showPlusMenu && (
                            <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl overflow-hidden">
                                <div className="py-2">
                                    <Link
                                        to="/add-project"
                                        onClick={() => setShowPlusMenu(false)}
                                        className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-zinc-800 hover:text-white transition-all"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                        </svg>
                                        <span className="font-medium">New Project</span>
                                    </Link>
                                    <Link
                                        to="/projects"
                                        onClick={() => setShowPlusMenu(false)}
                                        className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-zinc-800 hover:text-white transition-all"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M9 11l3 3L22 4" />
                                            <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" />
                                        </svg>
                                        <span className="font-medium">Generate Tests</span>
                                    </Link>
                                    <Link
                                        to="/projects"
                                        onClick={() => setShowPlusMenu(false)}
                                        className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:bg-zinc-800 hover:text-white transition-all"
                                    >
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <polygon points="5 3 19 12 5 21 5 3" />
                                        </svg>
                                        <span className="font-medium">Run Tests</span>
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Notifications */}
                    <button className="flex items-center justify-center w-9 h-9 rounded-lg bg-transparent text-gray-400 hover:bg-white/5 hover:text-white transition-all relative">
                        <Bell size={20} />
                        <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                            3
                        </span>
                    </button>

                    {/* Theme Toggle */}
                    <button className="flex items-center justify-center w-9 h-9 rounded-lg bg-transparent text-gray-400 hover:bg-white/5 hover:text-white transition-all">
                        <Moon size={20} />
                    </button>

                    {/* User Avatar with Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-br from-purple to-cyan-light text-white font-bold text-sm hover:ring-2 hover:ring-purple/20 transition-all"
                        >
                            U
                        </button>

                        {/* Dropdown Menu */}
                        {showUserMenu && (
                            <div className="absolute right-0 mt-2 w-56 bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl overflow-hidden">
                                <div className="px-4 py-3 border-b border-zinc-800">
                                    <p className="text-white font-semibold">Jane Doe</p>
                                    <p className="text-gray-400 text-sm">jane.doe@example.com</p>
                                </div>
                                <div className="py-2">
                                    <Link
                                        to="/settings"
                                        onClick={() => setShowUserMenu(false)}
                                        className="flex items-center gap-3 px-4 py-2 text-gray-400 hover:bg-zinc-800 hover:text-white transition-all"
                                    >
                                        <User size={16} />
                                        <span>Profile Settings</span>
                                    </Link>
                                    <Link
                                        to="/api-keys"
                                        onClick={() => setShowUserMenu(false)}
                                        className="flex items-center gap-3 px-4 py-2 text-gray-400 hover:bg-zinc-800 hover:text-white transition-all"
                                    >
                                        <Key size={16} />
                                        <span>API Keys</span>
                                    </Link>
                                </div>
                                <div className="border-t border-zinc-800 py-2">
                                    <button
                                        onClick={() => {
                                            setShowUserMenu(false);
                                            navigate('/reset-password');
                                        }}
                                        className="flex items-center gap-3 px-4 py-2 text-red-500 hover:bg-zinc-800 transition-all w-full"
                                    >
                                        <LogOut size={16} />
                                        <span>Log Out</span>
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navigation;
