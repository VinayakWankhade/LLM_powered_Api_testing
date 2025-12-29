import { Home, ChevronRight, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import StatCard from '../components/StatCard';
import ProjectsTable from '../components/ProjectsTable';
import SystemHealth from '../components/SystemHealth';
import QuickActions from '../components/QuickActions';
import RecentActivity from '../components/RecentActivity';
import { FolderOpen, Target, Zap, TrendingUp } from 'lucide-react';

const Dashboard = () => {
    return (
        <div className="min-h-screen bg-black">
            <div className="max-w-[1920px] mx-auto px-8 py-8">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm mb-6">
                    <Home size={14} className="text-gray-500" />
                    <ChevronRight size={14} className="text-gray-600" />
                    <span className="text-cyan-light font-medium">Dashboard</span>
                </div>

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">System Dashboard</h1>
                    <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-400">Monday, December 29, 2025 at 12:28:42 PM</span>
                        <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full">
                            <CheckCircle size={14} className="text-green-500" />
                            <span className="text-green-500 font-semibold">System Operational</span>
                        </div>
                    </div>
                    <p className="text-gray-400 mt-2">Welcome back. All systems are running optimally.</p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Total Projects"
                        value="12"
                        trend="+1 this week"
                        icon={FolderOpen}
                        color="purple"
                    />
                    <StatCard
                        title="API Coverage"
                        value="87%"
                        subtitle="Global average"
                        icon={Target}
                        color="cyan"
                        progress={87}
                    />
                    <StatCard
                        title="Tests Executed"
                        value="2.4K"
                        subtitle="96% Pass • 2% Fail"
                        icon={Zap}
                        color="green"
                    />
                    <StatCard
                        title="RL Optimization"
                        value="94%"
                        subtitle="Efficiency rating"
                        icon={TrendingUp}
                        color="orange"
                        progress={94}
                    />
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Projects Table - Takes 2 columns */}
                    <div className="lg:col-span-2">
                        <ProjectsTable />
                    </div>

                    {/* Right Sidebar */}
                    <div className="space-y-6">
                        <SystemHealth />
                        <QuickActions />
                    </div>
                </div>

                {/* Recent Activity */}
                <RecentActivity />
            </div>
        </div>
    );
};

export default Dashboard;
