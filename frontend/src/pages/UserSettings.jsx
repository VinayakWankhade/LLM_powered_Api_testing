import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, User, Bell, Shield, Key, Upload } from 'lucide-react';

const UserSettings = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [mfaEnabled, setMfaEnabled] = useState(false);
    const [notifications, setNotifications] = useState({
        criticalErrors: true,
        weeklyActivity: false,
        testCompletion: true,
        securityUpdates: true,
    });

    return (
        <div className="min-h-screen bg-black">
            <div className="max-w-[1920px] mx-auto px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <Link
                        to="/dashboard"
                        className="inline-flex items-center gap-2 text-cyan-light hover:text-cyan transition-colors mb-4"
                    >
                        <ArrowLeft size={18} />
                        Back to Dashboard
                    </Link>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-4xl font-bold text-white">User Profile Settings</h1>
                                <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 border border-green-500 rounded-full">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-green-500 text-sm font-semibold">Active / Verified Account</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 text-gray-400">
                                <span>Dashboard</span>
                                <span>/</span>
                                <span>Profile</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4">
                            <h2 className="text-white font-semibold mb-4">Settings</h2>
                            <nav className="space-y-2">
                                <button
                                    onClick={() => setActiveTab('profile')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'profile'
                                        ? 'bg-purple text-white'
                                        : 'text-gray-400 hover:bg-zinc-800 hover:text-white'
                                        }`}
                                >
                                    <User size={18} />
                                    <span>Profile</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('notifications')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'notifications'
                                        ? 'bg-purple text-white'
                                        : 'text-gray-400 hover:bg-zinc-800 hover:text-white'
                                        }`}
                                >
                                    <Bell size={18} />
                                    <span>Notifications</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('security')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'security'
                                        ? 'bg-purple text-white'
                                        : 'text-gray-400 hover:bg-zinc-800 hover:text-white'
                                        }`}
                                >
                                    <Shield size={18} />
                                    <span>Security Settings</span>
                                </button>
                                <button
                                    onClick={() => setActiveTab('api-keys')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'api-keys'
                                        ? 'bg-purple text-white'
                                        : 'text-gray-400 hover:bg-zinc-800 hover:text-white'
                                        }`}
                                >
                                    <Key size={18} />
                                    <span>API Keys</span>
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        {/* Profile Tab */}
                        {activeTab === 'profile' && (
                            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
                                <div className="flex items-start gap-8 mb-8">
                                    <div className="relative">
                                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple to-cyan-light p-1">
                                            <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center text-4xl">
                                                👤
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-2xl font-bold text-white mb-1">Jane Doe</h2>
                                        <p className="text-gray-400 mb-4">Frontend Developer</p>
                                        <button className="flex items-center gap-2 px-4 py-2 bg-purple hover:bg-purple-dark text-white font-semibold rounded-lg transition-all">
                                            <Upload size={18} />
                                            Change Avatar
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Full Name</label>
                                        <input
                                            type="text"
                                            defaultValue="Jane Doe"
                                            className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-purple"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Role / Title</label>
                                        <input
                                            type="text"
                                            defaultValue="Frontend Developer"
                                            className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-purple"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Email Address</label>
                                        <input
                                            type="email"
                                            defaultValue="jane.doe@example.com"
                                            className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-lg text-gray-500 cursor-not-allowed"
                                            disabled
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-2">Timezone</label>
                                        <select className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-purple">
                                            <option>(GMT-05:00) Eastern Time</option>
                                            <option>(GMT-08:00) Pacific Time</option>
                                            <option>(GMT+00:00) UTC</option>
                                            <option>(GMT+05:30) India Standard Time</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-zinc-800">
                                    <button className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg transition-all">
                                        Cancel
                                    </button>
                                    <button className="px-6 py-2 bg-cyan-light hover:bg-cyan text-black font-semibold rounded-lg transition-all">
                                        Update Profile
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Notifications Tab */}
                        {activeTab === 'notifications' && (
                            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
                                <h2 className="text-2xl font-bold text-white mb-6">Email & Platform Preferences</h2>

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-lg">
                                        <div>
                                            <h3 className="text-white font-semibold mb-1">Critical Error Notifications</h3>
                                            <p className="text-gray-400 text-sm">Get notified by email for critical system errors.</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={notifications.criticalErrors}
                                                onChange={(e) => setNotifications({ ...notifications, criticalErrors: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-lg">
                                        <div>
                                            <h3 className="text-white font-semibold mb-1">Weekly Activity Summary</h3>
                                            <p className="text-gray-400 text-sm">Receive a weekly summary of your project activities.</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={notifications.weeklyActivity}
                                                onChange={(e) => setNotifications({ ...notifications, weeklyActivity: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-lg">
                                        <div>
                                            <h3 className="text-white font-semibold mb-1">In-app Test Completion Alerts</h3>
                                            <p className="text-gray-400 text-sm">Show alerts inside the app when test runs are complete.</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={notifications.testCompletion}
                                                onChange={(e) => setNotifications({ ...notifications, testCompletion: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-800 rounded-lg">
                                        <div>
                                            <h3 className="text-white font-semibold mb-1">Security Update Notifications</h3>
                                            <p className="text-gray-400 text-sm">Get notified about important security updates and changes.</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={notifications.securityUpdates}
                                                onChange={(e) => setNotifications({ ...notifications, securityUpdates: e.target.checked })}
                                                className="sr-only peer"
                                            />
                                            <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Security Tab */}
                        {activeTab === 'security' && (
                            <div className="space-y-6">
                                {/* Security Scorecard */}
                                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
                                    <h2 className="text-purple-light text-xl font-bold mb-6">Security Scorecard</h2>

                                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                                        <div className="flex flex-col items-center">
                                            <svg viewBox="0 0 120 120" className="w-32 h-32">
                                                <circle cx="60" cy="60" r="50" fill="none" stroke="#27272a" strokeWidth="10" />
                                                <circle
                                                    cx="60"
                                                    cy="60"
                                                    r="50"
                                                    fill="none"
                                                    stroke="#f97316"
                                                    strokeWidth="10"
                                                    strokeDasharray="188.4"
                                                    strokeDashoffset="75.36"
                                                    transform="rotate(-90 60 60)"
                                                />
                                                <text x="60" y="60" textAnchor="middle" dy="7" fill="#f97316" fontSize="24" fontWeight="bold">
                                                    60%
                                                </text>
                                            </svg>
                                            <p className="text-white font-semibold mt-2">Medium Security</p>
                                            <p className="text-gray-400 text-xs">Complete actions to improve your score.</p>
                                        </div>

                                        <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div className="text-center p-4 bg-zinc-950 border border-zinc-800 rounded-lg">
                                                <div className="text-red-500 text-sm font-semibold mb-1">MFA Status</div>
                                                <div className="text-white text-2xl font-bold mb-1">Disabled</div>
                                                <div className="text-gray-500 text-xs">Highly recommended</div>
                                            </div>
                                            <div className="text-center p-4 bg-zinc-950 border border-zinc-800 rounded-lg">
                                                <div className="text-gray-400 text-sm font-semibold mb-1">Password Age</div>
                                                <div className="text-white text-2xl font-bold mb-1">125 days</div>
                                                <div className="text-gray-500 text-xs">Consider updating</div>
                                            </div>
                                            <div className="text-center p-4 bg-zinc-950 border border-zinc-800 rounded-lg">
                                                <div className="text-gray-400 text-sm font-semibold mb-1">Active Sessions</div>
                                                <div className="text-white text-2xl font-bold mb-1">3</div>
                                                <div className="text-gray-500 text-xs">Review recent activity</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 p-4 bg-cyan/10 border border-cyan rounded-lg">
                                        <h3 className="text-cyan-light font-semibold mb-2">Recommended Actions</h3>
                                        <ul className="space-y-1 text-sm">
                                            <li className="text-orange-500">• Enable Multi-Factor Authentication</li>
                                            <li className="text-white">• Change your password regularly</li>
                                            <li className="text-white">• Revoke unused sessions</li>
                                        </ul>
                                    </div>
                                </div>

                                {/* Password Management & MFA */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    {/* Password Management */}
                                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                                        <h3 className="text-purple-light font-semibold mb-4">Password Management</h3>
                                        <p className="text-gray-400 text-sm mb-6">For security, your password should be changed periodically.</p>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-2">Current Password</label>
                                                <input
                                                    type="password"
                                                    placeholder="Enter current password"
                                                    className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-purple"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-2">New Password</label>
                                                <input
                                                    type="password"
                                                    placeholder="Enter new password"
                                                    className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-purple"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm text-gray-400 mb-2">Confirm New Password</label>
                                                <input
                                                    type="password"
                                                    placeholder="Confirm new password"
                                                    className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-purple"
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-4 text-xs text-gray-500">
                                            <p className="mb-1">Password must contain:</p>
                                            <ul className="list-disc list-inside space-y-1">
                                                <li>At least 8 characters</li>
                                                <li>An uppercase and a lowercase letter</li>
                                                <li>At least one number & one special character</li>
                                            </ul>
                                        </div>

                                        <button className="w-full mt-6 px-4 py-2 bg-purple hover:bg-purple-dark text-white font-semibold rounded-lg transition-all">
                                            Change Password
                                        </button>
                                    </div>

                                    {/* MFA */}
                                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                                        <h3 className="text-purple-light font-semibold mb-4">Multi-Factor Authentication (MFA)</h3>
                                        <p className="text-gray-400 text-sm mb-6">Add an extra layer of security to your account.</p>

                                        <div className="flex items-center justify-between mb-6 p-4 bg-zinc-950 border border-zinc-800 rounded-lg">
                                            <div>
                                                <p className="text-white font-semibold">MFA Status</p>
                                                <p className="text-red-500 text-sm">Currently Disabled. Toggle to enable</p>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={mfaEnabled}
                                                    onChange={(e) => setMfaEnabled(e.target.checked)}
                                                    className="sr-only peer"
                                                />
                                                <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                                            </label>
                                        </div>

                                        {mfaEnabled && (
                                            <div className="space-y-4">
                                                <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg">
                                                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                                                        <span>📱</span>
                                                        Authenticator App
                                                    </h4>
                                                    <ol className="text-sm text-gray-400 space-y-2 mb-4">
                                                        <li>1. Install an authenticator app like Google Authenticator or Authy.</li>
                                                        <li>2. Scan this QR code with your app.</li>
                                                    </ol>
                                                    <div className="w-48 h-48 bg-white rounded-lg mx-auto mb-4 flex items-center justify-center">
                                                        <span className="text-6xl">📱</span>
                                                    </div>
                                                    <div className="mb-4">
                                                        <label className="block text-sm text-gray-400 mb-2">3. Enter the 6-digit code from your app below to verify.</label>
                                                        <input
                                                            type="text"
                                                            placeholder="- - - - - -"
                                                            maxLength="6"
                                                            className="w-full px-4 py-3 bg-black border border-zinc-800 rounded-lg text-white text-center text-2xl tracking-widest focus:outline-none focus:border-purple"
                                                        />
                                                    </div>
                                                    <button className="w-full px-4 py-2 bg-purple hover:bg-purple-dark text-white font-semibold rounded-lg transition-all">
                                                        Verify & Enable
                                                    </button>
                                                </div>

                                                <div className="p-4 bg-red-900/20 border border-red-700 rounded-lg">
                                                    <div className="flex items-start gap-2 mb-2">
                                                        <span>🛡️</span>
                                                        <div>
                                                            <h4 className="text-white font-semibold">Recovery Codes</h4>
                                                            <p className="text-gray-400 text-sm">Store these codes in a safe place. They can be used to access your account if you lose your device.</p>
                                                        </div>
                                                    </div>
                                                    <button className="mt-3 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm rounded-lg transition-all">
                                                        View Codes
                                                    </button>
                                                </div>

                                                <button className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all">
                                                    Disable MFA
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Activity Log */}
                                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-purple-light text-xl font-bold">Active Login Sessions</h2>
                                        <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-lg transition-all">
                                            <span>⊗</span>
                                            Revoke All Except Current
                                        </button>
                                    </div>
                                    <p className="text-gray-400 text-sm mb-6">This is a list of devices that have logged into your account.</p>

                                    {/* Table Header */}
                                    <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg mb-3 text-sm font-semibold text-cyan-light">
                                        <div className="col-span-4">Device</div>
                                        <div className="col-span-3">Location</div>
                                        <div className="col-span-3">Last Activity</div>
                                        <div className="col-span-2">Login Time</div>
                                    </div>

                                    {/* Sessions List */}
                                    <div className="space-y-2">
                                        {/* Current Session */}
                                        <div className="grid grid-cols-12 gap-4 px-4 py-4 bg-zinc-950 border-2 border-green-500 rounded-lg items-center">
                                            <div className="col-span-4 flex items-center gap-3">
                                                <div className="w-10 h-10 bg-zinc-900 border border-zinc-700 rounded-lg flex items-center justify-center">
                                                    <span className="text-xl">💻</span>
                                                </div>
                                                <div>
                                                    <p className="text-white font-semibold">Chrome on Windows</p>
                                                    <p className="text-green-500 text-xs font-semibold">Current Session</p>
                                                </div>
                                            </div>
                                            <div className="col-span-3">
                                                <p className="text-white">New York, USA</p>
                                            </div>
                                            <div className="col-span-3">
                                                <p className="text-white">2 minutes ago</p>
                                            </div>
                                            <div className="col-span-2 flex items-center justify-between">
                                                <p className="text-white text-sm">Dec 20, 2025, 10:30 AM</p>
                                            </div>
                                        </div>

                                        {/* Other Sessions */}
                                        <div className="grid grid-cols-12 gap-4 px-4 py-4 bg-zinc-950 border border-zinc-800 rounded-lg items-center">
                                            <div className="col-span-4 flex items-center gap-3">
                                                <div className="w-10 h-10 bg-zinc-900 border border-zinc-700 rounded-lg flex items-center justify-center">
                                                    <span className="text-xl">📱</span>
                                                </div>
                                                <div>
                                                    <p className="text-white font-semibold">Safari on iPhone</p>
                                                    <p className="text-gray-500 text-xs">Mobile App</p>
                                                </div>
                                            </div>
                                            <div className="col-span-3">
                                                <p className="text-white">New York, USA</p>
                                            </div>
                                            <div className="col-span-3">
                                                <p className="text-white">8 hours ago</p>
                                            </div>
                                            <div className="col-span-2 flex items-center justify-between">
                                                <p className="text-white text-sm">Dec 20, 2025, 02:15 AM</p>
                                                <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition-all">
                                                    Revoke
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-12 gap-4 px-4 py-4 bg-zinc-950 border border-zinc-800 rounded-lg items-center">
                                            <div className="col-span-4 flex items-center gap-3">
                                                <div className="w-10 h-10 bg-zinc-900 border border-zinc-700 rounded-lg flex items-center justify-center">
                                                    <span className="text-xl">🔑</span>
                                                </div>
                                                <div>
                                                    <p className="text-white font-semibold">API Access Token</p>
                                                    <p className="text-gray-500 text-xs">Integration Script</p>
                                                </div>
                                            </div>
                                            <div className="col-span-3">
                                                <p className="text-white">-</p>
                                            </div>
                                            <div className="col-span-3">
                                                <p className="text-white">1 day ago</p>
                                            </div>
                                            <div className="col-span-2 flex items-center justify-between">
                                                <p className="text-white text-sm">Dec 19, 2025, 11:00 AM</p>
                                                <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded-lg transition-all">
                                                    Revoke
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Manage API Keys Link */}
                                    <div className="mt-8 p-6 bg-gradient-to-r from-cyan/10 to-purple/10 border border-cyan/30 rounded-xl">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-cyan-light text-lg font-semibold mb-2">Manage API Keys</h3>
                                                <p className="text-gray-400 text-sm">Create, modify, or revoke your integration API keys.</p>
                                            </div>
                                            <Link
                                                to="/api-keys"
                                                className="flex items-center gap-2 px-6 py-3 bg-cyan-light hover:bg-cyan text-black font-semibold rounded-lg transition-all"
                                            >
                                                Go to API Keys
                                                <span>→</span>
                                            </Link>
                                        </div>
                                    </div>

                                    {/* Recent Activity Log */}
                                    <h3 className="text-lg font-semibold text-white mt-8 mb-4">Recent Activity Log</h3>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-3 p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-sm">
                                            <span className="text-gray-500">2025-12-15 10:30 AM</span>
                                            <span className="text-white">Password changed successfully</span>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-sm">
                                            <span className="text-gray-500">2025-12-10 09:00 PM</span>
                                            <span className="text-white">Email address updated from old@example.com</span>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-zinc-950 border border-zinc-800 rounded-lg text-sm">
                                            <span className="text-gray-500">2025-12-05 02:15 PM</span>
                                            <span className="text-white">New API Key generated for 'Staging Env'</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* API Keys Tab */}
                        {activeTab === 'api-keys' && (
                            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-2xl font-bold text-white">API Keys</h2>
                                    <button className="px-4 py-2 bg-purple hover:bg-purple-dark text-white font-semibold rounded-lg transition-all">
                                        Generate New Key
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-white font-semibold">Production API Key</h3>
                                            <span className="px-2 py-1 bg-green-500/20 text-green-500 border border-green-500 rounded text-xs font-semibold">
                                                Active
                                            </span>
                                        </div>
                                        <p className="text-gray-400 text-sm font-mono mb-3">sk_prod_••••••••••••••••••••1234</p>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <span>Created: 2025-11-01</span>
                                            <span>•</span>
                                            <span>Last used: 2 hours ago</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-3">
                                            <button className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-white text-sm rounded-lg transition-all">
                                                Copy
                                            </button>
                                            <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-all">
                                                Revoke
                                            </button>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-lg">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-white font-semibold">Staging API Key</h3>
                                            <span className="px-2 py-1 bg-green-500/20 text-green-500 border border-green-500 rounded text-xs font-semibold">
                                                Active
                                            </span>
                                        </div>
                                        <p className="text-gray-400 text-sm font-mono mb-3">sk_test_••••••••••••••••••••5678</p>
                                        <div className="flex items-center gap-2 text-xs text-gray-500">
                                            <span>Created: 2025-12-05</span>
                                            <span>•</span>
                                            <span>Last used: 1 day ago</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-3">
                                            <button className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-white text-sm rounded-lg transition-all">
                                                Copy
                                            </button>
                                            <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg transition-all">
                                                Revoke
                                            </button>
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
