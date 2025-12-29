import { Activity, Database, Cpu, CheckCircle, Clock, AlertCircle } from 'lucide-react';

const SystemHealth = () => {
    const metrics = [
        { label: 'API Uptime', value: '99.9%', status: 'good', icon: CheckCircle },
        { label: 'Database Latency', value: '12ms', status: 'good', icon: Database },
        { label: 'Processing Queue', value: '3 jobs', status: 'warning', icon: Cpu },
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'good':
                return 'text-green-500';
            case 'warning':
                return 'text-orange-500';
            case 'error':
                return 'text-red-500';
            default:
                return 'text-gray-400';
        }
    };

    return (
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-bold text-white mb-6">System Health</h3>
            <div className="space-y-4">
                {metrics.map((metric, index) => {
                    const Icon = metric.icon;
                    return (
                        <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Icon size={16} className={getStatusColor(metric.status)} />
                                <span className="text-gray-400 text-sm">{metric.label}</span>
                            </div>
                            <span className={`text-sm font-semibold ${getStatusColor(metric.status)}`}>
                                {metric.value}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SystemHealth;
