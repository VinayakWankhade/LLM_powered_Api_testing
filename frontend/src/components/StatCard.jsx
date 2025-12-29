const StatCard = ({ title, value, subtitle, icon: Icon, trend, color = 'purple', progress }) => {
    const colorClasses = {
        purple: {
            bg: 'bg-purple/10',
            border: 'border-purple/30',
            icon: 'text-purple-light',
            text: 'text-purple-light',
        },
        cyan: {
            bg: 'bg-cyan/10',
            border: 'border-cyan/30',
            icon: 'text-cyan-light',
            text: 'text-cyan-light',
        },
        green: {
            bg: 'bg-green-500/10',
            border: 'border-green-500/30',
            icon: 'text-green-500',
            text: 'text-green-500',
        },
        orange: {
            bg: 'bg-orange-500/10',
            border: 'border-orange-500/30',
            icon: 'text-orange-500',
            text: 'text-orange-500',
        },
    };

    const colors = colorClasses[color] || colorClasses.purple;

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 transition-all">
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">
                        {title}
                    </p>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-3xl font-bold text-white">{value}</h3>
                        {trend && (
                            <span className={`text-xs font-semibold ${trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                                {trend}
                            </span>
                        )}
                    </div>
                    {subtitle && (
                        <p className="text-gray-500 text-xs mt-1">{subtitle}</p>
                    )}
                </div>
                {Icon && (
                    <div className={`w-12 h-12 rounded-lg ${colors.bg} border ${colors.border} flex items-center justify-center flex-shrink-0`}>
                        <Icon size={24} className={colors.icon} />
                    </div>
                )}
            </div>

            {/* Progress Circle */}
            {progress !== undefined && (
                <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16">
                        <svg className="w-16 h-16 transform -rotate-90">
                            <circle
                                cx="32"
                                cy="32"
                                r="28"
                                stroke="currentColor"
                                strokeWidth="6"
                                fill="none"
                                className="text-zinc-800"
                            />
                            <circle
                                cx="32"
                                cy="32"
                                r="28"
                                stroke="currentColor"
                                strokeWidth="6"
                                fill="none"
                                strokeDasharray={`${2 * Math.PI * 28}`}
                                strokeDashoffset={`${2 * Math.PI * 28 * (1 - progress / 100)}`}
                                className={colors.text}
                                strokeLinecap="round"
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className={`text-sm font-bold ${colors.text}`}>{progress}%</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StatCard;
