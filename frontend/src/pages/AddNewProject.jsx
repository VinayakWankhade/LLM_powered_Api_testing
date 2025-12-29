import { ArrowLeft, AlertTriangle, ArrowRight, HelpCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

const AddNewProject = () => {
    const [formData, setFormData] = useState({
        projectName: '',
        language: '',
        description: '',
        apiVersion: '',
        codebasePath: '',
        apiDefinition: '',
        exclusionPatterns: '',
        scanStrategy: 'Fast',
        deepScanning: false,
        vcsProvider: 'GitHub',
        repositoryUrl: '',
        targetBranch: '',
        enableWebhook: false,
    });

    const [gitConnected, setGitConnected] = useState(false);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    return (
        <div className="min-h-screen bg-black">
            <div className="max-w-[1200px] mx-auto px-8 py-8">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm mb-6">
                    <Link to="/projects" className="flex items-center gap-1 text-gray-500 hover:text-white transition-colors">
                        <ArrowLeft size={14} />
                        Projects
                    </Link>
                    <span className="text-gray-600">/</span>
                    <span className="text-cyan-light font-medium">Add New Project</span>
                </div>

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-purple-light mb-2">Onboard New Project</h1>
                    <p className="text-gray-400">Enter the project's details to configure it for automated API scanning and test generation.</p>
                </div>

                {/* Form */}
                <div className="space-y-8">
                    {/* Section 1: General Project Information */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
                        <h2 className="text-xl font-bold text-cyan-light mb-6">
                            <span className="text-gray-500">1.</span> General Project Information
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="projectName" className="block text-sm font-medium text-white mb-2">
                                    Project Name
                                </label>
                                <input
                                    type="text"
                                    id="projectName"
                                    name="projectName"
                                    placeholder="e.g., Auth Service"
                                    value={formData.projectName}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/10 transition-all"
                                />
                            </div>

                            <div>
                                <label htmlFor="language" className="flex items-center gap-2 text-sm font-medium text-white mb-2">
                                    Primary Code Language
                                    <HelpCircle size={14} className="text-gray-500" />
                                </label>
                                <select
                                    id="language"
                                    name="language"
                                    value={formData.language}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/10 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="">Select Language</option>
                                    <option value="javascript">JavaScript</option>
                                    <option value="typescript">TypeScript</option>
                                    <option value="python">Python</option>
                                    <option value="java">Java</option>
                                    <option value="go">Go</option>
                                    <option value="ruby">Ruby</option>
                                </select>
                            </div>

                            <div className="md:col-span-2">
                                <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
                                    Description (Optional)
                                </label>
                                <textarea
                                    id="description"
                                    name="description"
                                    rows="4"
                                    placeholder="A brief summary of the project's purpose."
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/10 transition-all resize-none"
                                ></textarea>
                            </div>

                            <div>
                                <label htmlFor="apiVersion" className="block text-sm font-medium text-white mb-2">
                                    Initial API Version
                                </label>
                                <input
                                    type="text"
                                    id="apiVersion"
                                    name="apiVersion"
                                    placeholder="e.g., v1.0.0"
                                    value={formData.apiVersion}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/10 transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Codebase Configuration */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
                        <h2 className="text-xl font-bold text-cyan-light mb-6">
                            <span className="text-gray-500">2.</span> Codebase Configuration
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="codebasePath" className="block text-sm font-medium text-white mb-2">
                                    Codebase Root Path
                                </label>
                                <input
                                    type="text"
                                    id="codebasePath"
                                    name="codebasePath"
                                    placeholder="/src/api"
                                    value={formData.codebasePath}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/10 transition-all"
                                />
                                <p className="text-xs text-gray-500 mt-1">Example: "/src/app"</p>
                            </div>

                            <div>
                                <label htmlFor="apiDefinition" className="block text-sm font-medium text-white mb-2">
                                    API Definition File Location
                                </label>
                                <input
                                    type="text"
                                    id="apiDefinition"
                                    name="apiDefinition"
                                    placeholder="swagger.json or openapi.yaml"
                                    value={formData.apiDefinition}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/10 transition-all"
                                />
                                <p className="text-xs text-gray-500 mt-1">Full path relative to root.</p>
                            </div>

                            <div className="md:col-span-2">
                                <label htmlFor="exclusionPatterns" className="block text-sm font-medium text-white mb-2">
                                    Scan Exclusion Patterns
                                </label>
                                <textarea
                                    id="exclusionPatterns"
                                    name="exclusionPatterns"
                                    rows="4"
                                    placeholder="node_modules/&#10;**/*.test.js&#10;dist/"
                                    value={formData.exclusionPatterns}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/10 transition-all resize-none font-mono text-sm"
                                ></textarea>
                            </div>

                            <div>
                                <label htmlFor="scanStrategy" className="block text-sm font-medium text-white mb-2">
                                    Scan Strategy
                                </label>
                                <select
                                    id="scanStrategy"
                                    name="scanStrategy"
                                    value={formData.scanStrategy}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/10 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="Fast">Fast</option>
                                    <option value="Balanced">Balanced</option>
                                    <option value="Deep">Deep</option>
                                </select>
                            </div>

                            <div className="flex items-center gap-3">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        name="deepScanning"
                                        checked={formData.deepScanning}
                                        onChange={handleInputChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple/10 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple"></div>
                                </label>
                                <div>
                                    <p className="text-white font-medium text-sm">Enable Deep Dependency Scanning</p>
                                    <p className="text-gray-500 text-xs">Analyze third-party libraries</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Version Control Integration */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
                        <h2 className="text-xl font-bold text-cyan-light mb-6">
                            <span className="text-gray-500">3.</span> Version Control Integration (VCS)
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="vcsProvider" className="block text-sm font-medium text-white mb-2">
                                    VCS Provider
                                </label>
                                <select
                                    id="vcsProvider"
                                    name="vcsProvider"
                                    value={formData.vcsProvider}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/10 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="GitHub">GitHub</option>
                                    <option value="GitLab">GitLab</option>
                                    <option value="Bitbucket">Bitbucket</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="targetBranch" className="block text-sm font-medium text-white mb-2">
                                    Target Branch
                                </label>
                                <input
                                    type="text"
                                    id="targetBranch"
                                    name="targetBranch"
                                    placeholder="main or develop"
                                    value={formData.targetBranch}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/10 transition-all"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label htmlFor="repositoryUrl" className="block text-sm font-medium text-white mb-2">
                                    Repository URL
                                </label>
                                <input
                                    type="text"
                                    id="repositoryUrl"
                                    name="repositoryUrl"
                                    placeholder="https://github.com/user/repo.git"
                                    value={formData.repositoryUrl}
                                    onChange={handleInputChange}
                                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/10 transition-all"
                                />
                            </div>

                            {/* Security Notice */}
                            <div className="md:col-span-2 bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex items-start gap-3">
                                <AlertTriangle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-red-500 font-semibold text-sm mb-1">Security Notice</p>
                                    <p className="text-red-400 text-sm">Ensure the provided key has read-only access to avoid security issues.</p>
                                </div>
                            </div>

                            {/* Connect Git Button */}
                            <div className="md:col-span-2 flex items-center justify-between">
                                <button
                                    onClick={() => setGitConnected(!gitConnected)}
                                    className="px-6 py-3 bg-cyan-light hover:bg-cyan text-black font-semibold rounded-lg transition-all hover:shadow-glow-cyan"
                                >
                                    Connect Git Authentication Token
                                </button>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-400 text-sm">Status:</span>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${gitConnected ? 'bg-green-500/20 text-green-500 border border-green-500' : 'bg-red-500/20 text-red-500 border border-red-500'}`}>
                                        {gitConnected ? '● Connected' : '● Not Connected'}
                                    </span>
                                </div>
                            </div>

                            {/* Webhook Option */}
                            <div className="md:col-span-2 flex items-center gap-3">
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
                                <span className="text-white font-medium text-sm">Enable Webhook for Continuous Scanning</span>
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
                        <button className="flex items-center gap-2 px-6 py-3 bg-purple hover:bg-purple-dark text-white font-semibold rounded-lg transition-all hover:shadow-glow-purple">
                            Create Project & Start Scan
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddNewProject;
