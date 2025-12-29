import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Play, Info } from 'lucide-react';

const GenerateTests = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        endpoint: '/v2/users/{userId}/permissions',
        categories: {
            functional: false,
            security: false,
            performance: false,
            custom: false,
        },
        llmModel: 'Llama 3',
        creativity: 50,
        includeEdgeCases: false,
        additionalInstructions: '',
    });

    const handleCategoryToggle = (category) => {
        setFormData(prev => ({
            ...prev,
            categories: {
                ...prev.categories,
                [category]: !prev.categories[category]
            }
        }));
    };

    const handleGenerate = () => {
        navigate(`/project/${id}/test-cases`);
    };

    const categories = [
        {
            id: 'functional',
            icon: '⚗️',
            title: 'Functional',
            description: 'Verify core logic, inputs, and expected outputs.',
        },
        {
            id: 'security',
            icon: '🛡️',
            title: 'Security',
            description: 'Probe for vulnerabilities like SQLi, XSS, and auth flaws.',
        },
        {
            id: 'performance',
            icon: '⚡',
            title: 'Performance',
            description: 'Assess API response time, load, and stability.',
        },
        {
            id: 'custom',
            icon: '✨',
            title: 'Custom',
            description: 'Define specific test scenarios with your own prompts.',
        },
    ];

    return (
        <div className="min-h-screen bg-black">
            <div className="max-w-[1000px] mx-auto px-8 py-8">
                {/* Header */}
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold text-white mb-2">Generate Tests Configuration</h1>
                    <p className="text-gray-400">
                        For API Context: <span className="text-cyan-light font-mono">{formData.endpoint}</span>
                    </p>
                </div>

                {/* Form Sections */}
                <div className="space-y-6">
                    {/* 1. Select Test Categories */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
                        <h2 className="text-xl font-bold text-cyan-light mb-6">
                            <span className="text-gray-500">1.</span> Select Test Categories
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => handleCategoryToggle(category.id)}
                                    className={`p-6 rounded-xl border-2 transition-all text-center ${formData.categories[category.id]
                                            ? 'bg-purple/20 border-purple shadow-glow-purple'
                                            : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                                        }`}
                                >
                                    <div className="text-4xl mb-3">{category.icon}</div>
                                    <h3 className="text-white font-bold mb-2">{category.title}</h3>
                                    <p className="text-gray-400 text-xs">{category.description}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* 2. LLM Model Options */}
                    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8">
                        <h2 className="text-xl font-bold text-cyan-light mb-6">
                            <span className="text-gray-500">2.</span> LLM Model Options
                        </h2>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* LLM Model Dropdown */}
                            <div>
                                <label className="block text-sm font-medium text-white mb-2">
                                    LLM Model
                                </label>
                                <select
                                    value={formData.llmModel}
                                    onChange={(e) => setFormData(prev => ({ ...prev, llmModel: e.target.value }))}
                                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/10 transition-all appearance-none cursor-pointer"
                                >
                                    <option value="Llama 3">Llama 3</option>
                                    <option value="GPT-4">GPT-4</option>
                                    <option value="Claude 3">Claude 3</option>
                                    <option value="Gemini Pro">Gemini Pro</option>
                                </select>
                            </div>

                            {/* Generation Creativity Slider */}
                            <div>
                                <label className="block text-sm font-medium text-white mb-2">
                                    Generation Creativity
                                </label>
                                <div className="relative pt-1">
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={formData.creativity}
                                        onChange={(e) => setFormData(prev => ({ ...prev, creativity: parseInt(e.target.value) }))}
                                        className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer slider-purple"
                                        style={{
                                            background: `linear-gradient(to right, #7c3aed 0%, #7c3aed ${formData.creativity}%, #27272a ${formData.creativity}%, #27272a 100%)`
                                        }}
                                    />
                                    <div className="flex justify-between text-xs text-gray-400 mt-2">
                                        <span>Conservative</span>
                                        <span>Explorative</span>
                                    </div>
                                </div>
                            </div>

                            {/* Include Edge Cases */}
                            <div className="flex items-center gap-3">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.includeEdgeCases}
                                        onChange={(e) => setFormData(prev => ({ ...prev, includeEdgeCases: e.target.checked }))}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple/10 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple"></div>
                                </label>
                                <div className="flex items-center gap-2">
                                    <span className="text-white font-medium text-sm">Include Edge Cases</span>
                                    <Info size={14} className="text-gray-500" />
                                </div>
                            </div>

                            {/* Additional Instructions */}
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-white mb-2">
                                    Additional Instructions
                                </label>
                                <textarea
                                    rows="4"
                                    placeholder="Provide custom prompts or specific instructions for the AI... e.g., 'Focus on testing date formats for European locales.'"
                                    value={formData.additionalInstructions}
                                    onChange={(e) => setFormData(prev => ({ ...prev, additionalInstructions: e.target.value }))}
                                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-lg text-white placeholder:text-gray-500 focus:outline-none focus:border-purple focus:ring-2 focus:ring-purple/10 transition-all resize-none"
                                ></textarea>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-4 pt-4 border-t border-zinc-800">
                        <button
                            onClick={() => navigate(-1)}
                            className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-lg transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleGenerate}
                            className="flex items-center gap-2 px-6 py-3 bg-purple hover:bg-purple-dark text-white font-semibold rounded-lg transition-all hover:shadow-glow-purple"
                        >
                            <Play size={18} />
                            Generate
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GenerateTests;
