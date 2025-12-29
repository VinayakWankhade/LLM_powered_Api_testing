import { Filter } from 'lucide-react';

const RecentActivity = () => {
    const activities = [
        {
            id: 1,
            time: '2h ago',
            status: 'success',
            statusLabel: 'SUCCESS',
            project: 'E-Commerce API',
            message: 'Test run completed successfully',
        },
        {
            id: 2,
            time: '4h ago',
            status: 'info',
            statusLabel: 'INFO',
            project: 'User Management',
            message: 'New endpoint detected',
        },
        {
            id: 3,
            time: '6h ago',
            status: 'error',
            statusLabel: 'ERROR',
            project: 'Analytics Engine',
            message: 'Test execution failed',
        },
        {
            id: 4,
            time: '8h ago',
            status: 'healing',
            statusLabel: 'HEALING',
            project: 'Payment Gateway',
            message: 'Self-healing completed',
        },
    ];

    const getStatusBadge = (status, label) => {
        const colors = {
            success: 'bg-green-500/20 text-green-500 border-green-500',
            info: 'bg-blue-500/20 text-blue-500 border-blue-500',
            error: 'bg-red-500/20 text-red-500 border-red-500',
            healing: 'bg-orange-500/20 text-orange-500 border-orange-500',
        };

        return (
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${colors[status]}`}>
                {label}
            </span>
        );
    };

    const getTimeIcon = (time) => {
        return (
            <div className="flex items-center gap-1.5 text-gray-500 text-xs">
                <div className="w-1.5 h-1.5 rounded-full bg-gray-500"></div>
                <span>{time}</span>
            </div>
        );
    };

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Recent Activity</h3>
                <button className="flex items-center gap-2 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-gray-400 hover:text-white text-sm font-medium rounded-lg transition-all">
                    <Filter size={14} />
                    Filter
                </button>
            </div>

            {/* Activity List */}
            <div className="divide-y divide-zinc-800">
                {activities.map((activity) => (
                    <div key={activity.id} className="p-6 hover:bg-white/[0.02] transition-colors">
                        <div className="flex items-start gap-4">
                            <div className="flex-1">
                                {getTimeIcon(activity.time)}
                                <div className="mt-2 flex items-center gap-2">
                                    {getStatusBadge(activity.status, activity.statusLabel)}
                                    <span className="text-purple-light font-medium text-sm">{activity.project}</span>
                                </div>
                                <p className="text-gray-400 text-sm mt-1">{activity.message}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecentActivity;
