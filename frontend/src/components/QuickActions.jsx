import { PlayCircle, BarChart3, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

const QuickActions = () => {
    const actions = [
        {
            label: 'Start New Project Scan',
            icon: PlayCircle,
            color: 'purple',
            to: '/add-project',
        },
        {
            label: 'View Global Analytics',
            icon: BarChart3,
            color: 'cyan',
            to: '/analytics/global-coverage',
        },
        {
            label: 'Manage Account',
            icon: Settings,
            color: 'orange',
            to: '/settings',
        },
    ];

    const getButtonClasses = (color) => {
        const classes = {
            purple: 'bg-purple hover:bg-purple-dark hover:shadow-glow-purple text-white',
            cyan: 'bg-cyan-light hover:bg-cyan hover:shadow-glow-cyan text-black',
            orange: 'bg-orange-500 hover:bg-orange-600 text-white',
        };
        return classes[color] || classes.purple;
    };

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-6">Quick Actions</h3>
            <div className="space-y-3">
                {actions.map((action, index) => {
                    const Icon = action.icon;
                    return (
                        <Link
                            key={index}
                            to={action.to}
                            className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm transition-all ${getButtonClasses(action.color)}`}
                        >
                            <Icon size={18} />
                            {action.label}
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};

export default QuickActions;
