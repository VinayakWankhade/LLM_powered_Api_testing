import { ArrowLeft, Info, Copy, Eye, EyeOff } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const ProjectSettings = () => {
    const [formData, setFormData] = useState({
        projectName: 'E-Commerce API',
        lastUpdated: '2025-01-15 14:32:00',
        description: 'Main backend API for e-commerce platform',
        autoScan: true,
        scanInterval: '24',
        directoriesToIgnore: ['node_modules', '.git', 'dist', 'build', 'coverage'],
        includedFileTypes: ['.js', '.ts', '.jsx', '.tsx'],
        gitIntegration: true,
        repositoryUrl: 'https://github.com/company/ecommerce-api',
        defaultBranch: 'main',
        enableWebhook: true,
        webhookUrl: '••••••••••••••••••••••••••••••••••••••••',
    });

    const [showWebhookUrl, setShowWebhookUrl] = useState(false);
    const [newDirectory, setNewDirectory] = useState('');
    const [newFileType, setNewFileType] = useState('');

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const addDirectory = () => {
        if (newDirectory.trim()) {
            setFormData(prev => ({
                ...prev,
                directoriesToIgnore: [...prev.directoriesToIgnore, newDirectory.trim()]
            }));
            setNewDirectory('');
        }
    };

    const removeDirectory = (dir) => {
        setFormData(prev => ({
            ...prev,
            directoriesToIgnore: prev.directoriesToIgnore.filter(d => d !== dir)
        }));
    };

    const addFileType = () => {
        if (newFileType.trim()) {
            setFormData(prev => ({
                ...prev,
                includedFileTypes: [...prev.includedFileTypes, newFileType.trim()]
            }));
            setNewFileType('');
        }
    };

    const removeFileType = (type) => {
        setFormData(prev => ({
            ...prev,
            includedFileTypes: prev.includedFileTypes.filter(t => t !== type)
        }));
    };

    const copyWebhookUrl = () => {
        navigator.clipboard.writeText('https://api.aitestgen.com/webhook/abc123def456');
        // Show toast notification
    };

    return (
        <div className="min-h-screen bg-black">
            <div className="max-w-[1200px] mx-auto px-8 py-8">
                {/* Back Button */}
                <Link
                    to="/projects"
                    className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6"
                >
                    <ArrowLeft size={16} />
                    <span className="text-sm">Back</span>
                </Link>

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">Project Settings</h1>
                    <p className="text-gray-400">Configure project-specific settings, integrations, and preferences</p>
                </div>

                {/* Form Sections */}
                <div className="space-y-6">
                    {/* Project Information */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
                        <div className="flex items-center gap-2 mb-6">
                            <Info size={20} className="text-purple-light" />
                            <h2 className="text-xl font-bold text-purple-light">Project Information</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="projectName" className="block text-sm font-medium text-white mb-2">
                                    Project Name
                                </label>
                                <input
                                    type="text"
                                    id="projectName"
                                    name="projectName"
                                    value={formData.projectName}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/10 transition-all"
                                />
                            </div>

                            <div>
                                <label htmlFor="lastUpdated" className="block text-sm font-medium text-white mb-2">
                                    Last Updated
                                </label>
                                <input
                                    type="text"
                                    id="lastUpdated"
                                    name="lastUpdated"
                                    value={formData.lastUpdated}
                                    disabled
                                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-gray-500 cursor-not-allowed"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
                                    Project Description
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    rows="3"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/10 transition-all resize-none"
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Codebase Scan Settings */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
                        <div className="flex items-center gap-2 mb-6">
                            <span className="text-xl">🔍</span>
                            <h2 className="text-xl font-bold text-purple-light">Codebase Scan Settings</h2>
                        </div>

                        <div className="space-y-6">
                            {/* Auto Scanning Toggle */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-white font-medium">Enable Automatic Scanning</p>
                                    <p className="text-gray-400 text-sm">Automatically scan codebase for API changes</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="autoScan"
                                        checked={formData.autoScan}
                                        onChange={handleInputChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple/10 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple"></div>
                                </label>
                            </div>

                            {/* Scan Interval */}
                            <div>
                                <label htmlFor="scanInterval" className="block text-sm font-medium text-white mb-2">
                                    Scan Interval (hours)
                                </label>
                                <input
                                    type="number"
                                    id="scanInterval"
                                    name="scanInterval"
                                    value={formData.scanInterval}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/10 transition-all"
                                />
                                <p className="text-xs text-gray-500 mt-1">Scan will run every 24 hours</p>
                            </div>

                            {/* Directories to Ignore */}
                            <div>
                                <label className="block text-sm font-medium text-white mb-2">
                                    Directories to Ignore
                                </label>
                                <div className="flex gap-2 mb-3">
                                    <input
                                        type="text"
                                        placeholder="e.g., node_modules, dist"
                                        value={newDirectory}
                                        onChange={(e) => setNewDirectory(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && addDirectory()}
                                        className="flex-1 px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/10 transition-all"
                                    />
                                    <button
                                        onClick={addDirectory}
                                        className="px-6 py-2.5 bg-purple hover:bg-purple-dark text-white font-semibold rounded-lg transition-all"
                                    >
                                        + Add
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.directoriesToIgnore.map((dir, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple/20 text-purple-light border border-purple/30 rounded-lg text-sm"
                                        >
                                            {dir}
                                            <button
                                                onClick={() => removeDirectory(dir)}
                                                className="hover:text-white transition-colors"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Included File Types */}
                            <div>
                                <label className="block text-sm font-medium text-white mb-2">
                                    Included File Types
                                </label>
                                <div className="flex gap-2 mb-3">
                                    <input
                                        type="text"
                                        placeholder="e.g., .js, .ts, .jsx"
                                        value={newFileType}
                                        onChange={(e) => setNewFileType(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && addFileType()}
                                        className="flex-1 px-4 py-2.5 bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/10 transition-all"
                                    />
                                    <button
                                        onClick={addFileType}
                                        className="px-6 py-2.5 bg-purple hover:bg-purple-dark text-white font-semibold rounded-lg transition-all"
                                    >
                                        + Add
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {formData.includedFileTypes.map((type, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-cyan-light/20 text-cyan-light border border-cyan-light/30 rounded-lg text-sm"
                                        >
                                            {type}
                                            <button
                                                onClick={() => removeFileType(type)}
                                                className="hover:text-white transition-colors"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Info Box */}
                            <div className="bg-cyan-light/10 border border-cyan-light/30 rounded-lg p-4 flex items-start gap-3">
                                <Info size={20} className="text-cyan-light flex-shrink-0 mt-0.5" />
                                <p className="text-cyan-light text-sm">
                                    Scan settings determine which files and directories are analyzed for API endpoints. Ignored directories are excluded from scanning to improve performance.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Git Integration */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
                        <div className="flex items-center gap-2 mb-6">
                            <span className="text-xl">🔗</span>
                            <h2 className="text-xl font-bold text-purple-light">Git Integration</h2>
                        </div>

                        <div className="space-y-6">
                            {/* Enable Git Integration */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-white font-medium">Enable Git Integration</p>
                                    <p className="text-gray-400 text-sm">Connect to your Git repository for automatic scanning on commits</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="gitIntegration"
                                        checked={formData.gitIntegration}
                                        onChange={handleInputChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple/10 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple"></div>
                                </label>
                            </div>

                            {/* Repository URL */}
                            <div>
                                <label htmlFor="repositoryUrl" className="block text-sm font-medium text-white mb-2">
                                    Repository URL
                                </label>
                                <input
                                    type="text"
                                    id="repositoryUrl"
                                    name="repositoryUrl"
                                    value={formData.repositoryUrl}
                                    onChange={handleInputChange}
                                    placeholder="Full URL to your Git repository"
                                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/10 transition-all"
                                />
                            </div>

                            {/* Default Branch */}
                            <div>
                                <label htmlFor="defaultBranch" className="block text-sm font-medium text-white mb-2">
                                    Default Branch
                                </label>
                                <input
                                    type="text"
                                    id="defaultBranch"
                                    name="defaultBranch"
                                    value={formData.defaultBranch}
                                    onChange={handleInputChange}
                                    placeholder="Branch to scan for API changes"
                                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/10 transition-all"
                                />
                            </div>

                            {/* Enable Webhook */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-white font-medium">Enable Webhook</p>
                                    <p className="text-gray-400 text-sm">Automatically trigger scans on push events</p>
                                </div>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="enableWebhook"
                                        checked={formData.enableWebhook}
                                        onChange={handleInputChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple/10 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple"></div>
                                </label>
                            </div>

                            {/* Webhook URL */}
                            <div>
                                <label className="block text-sm font-medium text-white mb-2">
                                    Webhook URL
                                </label>
                                <div className="relative">
                                    <input
                                        type={showWebhookUrl ? 'text' : 'password'}
                                        value={showWebhookUrl ? 'https://api.aitestgen.com/webhook/abc123def456' : formData.webhookUrl}
                                        disabled
                                        className="w-full px-4 py-3 pr-24 bg-zinc-950 border border-zinc-800 rounded-lg text-white cursor-not-allowed"
                                    />
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                        <button
                                            onClick={() => setShowWebhookUrl(!showWebhookUrl)}
                                            className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-gray-400 hover:text-white"
                                        >
                                            {showWebhookUrl ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                                <button
                                    onClick={copyWebhookUrl}
                                    className="mt-2 flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm rounded-lg transition-all"
                                >
                                    <Copy size={14} />
                                    Copy Webhook URL
                                </button>
                            </div>

                            {/* Info Box */}
                            <div className="bg-cyan-light/10 border border-cyan-light/30 rounded-lg p-4 flex items-start gap-3">
                                <Info size={20} className="text-cyan-light flex-shrink-0 mt-0.5" />
                                <p className="text-cyan-light text-sm">
                                    Add this URL as a webhook in your Git repository settings to enable automatic scanning. Git integration allows automatic API scanning when code is pushed to your repository, keeping your tests synchronized with your codebase.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Integration Credentials */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
                        <div className="flex items-center gap-2 mb-6">
                            <span className="text-xl">🔑</span>
                            <h2 className="text-xl font-bold text-purple-light">Integration Credentials</h2>
                        </div>

                        <div className="space-y-6">
                            {/* API Key */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <label className="block text-sm font-medium text-white">API Key</label>
                                    <span className="px-2 py-0.5 bg-green-500/20 text-green-500 border border-green-500 rounded text-xs font-bold uppercase">
                                        Active
                                    </span>
                                </div>
                                <div className="relative">
                                    <input
                                        type="password"
                                        value="••••••••••••••••••••••••••••"
                                        disabled
                                        className="w-full px-4 py-3 pr-24 bg-zinc-950 border border-zinc-800 rounded-lg text-white cursor-not-allowed"
                                    />
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                        <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-gray-400 hover:text-white">
                                            <Eye size={16} />
                                        </button>
                                        <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-gray-400 hover:text-white">
                                            <Copy size={16} />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">Used for API authentication and integrations</p>
                                <button className="mt-3 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm rounded-lg transition-all flex items-center gap-2">
                                    <span>🔄</span>
                                    Regenerate API Key
                                </button>
                            </div>

                            {/* Authentication Token */}
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <label className="block text-sm font-medium text-white">Authentication Token</label>
                                    <span className="px-2 py-0.5 bg-green-500/20 text-green-500 border border-green-500 rounded text-xs font-bold uppercase">
                                        Active
                                    </span>
                                </div>
                                <div className="relative">
                                    <input
                                        type="password"
                                        value="••••••••••••••••••••••••••••••••••••"
                                        disabled
                                        className="w-full px-4 py-3 pr-24 bg-zinc-950 border border-zinc-800 rounded-lg text-white cursor-not-allowed"
                                    />
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                        <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-gray-400 hover:text-white">
                                            <Eye size={16} />
                                        </button>
                                        <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors text-gray-400 hover:text-white">
                                            <Copy size={16} />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400 mt-1">Used for Git repository and external service authentication</p>
                                <button className="mt-3 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm rounded-lg transition-all flex items-center gap-2">
                                    <span>🔄</span>
                                    Regenerate Auth Token
                                </button>
                            </div>

                            {/* Warning Box */}
                            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4 flex items-start gap-3">
                                <AlertTriangle size={20} className="text-orange-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-orange-500 font-semibold text-sm mb-1">Warning</p>
                                    <p className="text-orange-400 text-sm">Regenerating credentials will invalidate the old ones. Update any external integrations using these credentials immediately.</p>
                                </div>
                            </div>

                            {/* Info Box */}
                            <div className="bg-cyan-light/10 border border-cyan-light/30 rounded-lg p-4 flex items-start gap-3">
                                <Info size={20} className="text-cyan-light flex-shrink-0 mt-0.5" />
                                <p className="text-cyan-light text-sm">
                                    Keep your credentials secure and never share them publicly. Rotate credentials regularly for enhanced security.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Notification Preferences */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
                        <div className="flex items-center gap-2 mb-6">
                            <span className="text-xl">🔔</span>
                            <h2 className="text-xl font-bold text-purple-light">Notification Preferences</h2>
                        </div>

                        <div className="space-y-6">
                            {/* Email Notifications */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className="text-white font-medium">Email Notifications</p>
                                        <p className="text-gray-400 text-sm">Receive email alerts for test execution events</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            defaultChecked
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple/10 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple"></div>
                                    </label>
                                </div>

                                <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-3">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            defaultChecked
                                            className="w-4 h-4 bg-zinc-800 border-zinc-700 rounded text-red-500 focus:ring-2 focus:ring-red-500/10"
                                        />
                                        <span className="text-white text-sm">Notify on Test Failure</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className="w-4 h-4 bg-zinc-800 border-zinc-700 rounded text-green-500 focus:ring-2 focus:ring-green-500/10"
                                        />
                                        <span className="text-white text-sm">Notify on Test Success</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            defaultChecked
                                            className="w-4 h-4 bg-zinc-800 border-zinc-700 rounded text-purple focus:ring-2 focus:ring-purple/10"
                                        />
                                        <span className="text-white text-sm">Notify on Test Completion</span>
                                    </label>
                                </div>
                            </div>

                            {/* Slack Integration */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className="text-white font-medium">Slack Integration</p>
                                        <p className="text-gray-400 text-sm">Send test notifications to Slack channel</p>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input
                                            type="checkbox"
                                            defaultChecked
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple/10 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple"></div>
                                    </label>
                                </div>

                                <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4">
                                    <label className="block text-sm font-medium text-white mb-2">
                                        Slack Webhook URL
                                    </label>
                                    <div className="relative mb-3">
                                        <input
                                            type="password"
                                            value="••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••"
                                            disabled
                                            className="w-full px-4 py-3 pr-12 bg-zinc-900 border border-zinc-800 rounded-lg text-white cursor-not-allowed"
                                        />
                                        <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-zinc-800 rounded-lg transition-colors text-gray-400 hover:text-white">
                                            <Eye size={16} />
                                        </button>
                                    </div>
                                    <p className="text-xs text-gray-400 mb-3">Get this from your Slack workspace settings</p>
                                    <button className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm rounded-lg transition-all flex items-center gap-2">
                                        <span>📤</span>
                                        Send Test Notification
                                    </button>
                                </div>
                            </div>

                            {/* Info Box */}
                            <div className="bg-cyan-light/10 border border-cyan-light/30 rounded-lg p-4 flex items-start gap-3">
                                <Info size={20} className="text-cyan-light flex-shrink-0 mt-0.5" />
                                <p className="text-cyan-light text-sm">
                                    Configure how and when you receive notifications about test execution results, failures, and system events.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-4">
                        <Link
                            to="/projects"
                            className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-lg transition-all"
                        >
                            Cancel
                        </Link>
                        <button className="px-6 py-3 bg-purple hover:bg-purple-dark text-white font-semibold rounded-lg transition-all hover:shadow-glow-purple">
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectSettings;
