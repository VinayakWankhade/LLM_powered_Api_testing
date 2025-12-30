import { Home, ChevronRight, CheckCircle, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import StatCard from '../components/StatCard';
import ProjectsTable from '../components/ProjectsTable';
import SystemHealth from '../components/SystemHealth';
import QuickActions from '../components/QuickActions';
import RecentActivity from '../components/RecentActivity';
import { FolderOpen, Target, Zap, TrendingUp } from 'lucide-react';
import { analyticsApi } from '../api';

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                setLoading(true);
                const data = await analyticsApi.getDashboard();
                setStats(data);
            } catch (err) {
                console.error("Failed to fetch dashboard stats:", err);
                setError("Could not load dashboard metrics.");
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const formatDate = () => {
        return new Date().toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric',
            hour12: true
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 size={48} className="text-purple animate-spin" />
                    <p className="text-gray-400 font-medium">Synchronizing system metrics...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black">
            <div className="max-w-[1920px] mx-auto px-8 py-8">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm mb-6">
                    <Link to="/" className="flex items-center gap-2 hover:text-white transition-colors">
                        <Home size={14} className="text-gray-500" />
                    </Link>
                    <ChevronRight size={14} className="text-gray-600" />
                    <span className="text-cyan-light font-medium">Dashboard</span>
                </div>

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">System Dashboard</h1>
                    <div className="flex items-center gap-4 text-sm">
                        <span className="text-gray-400">{formatDate()}</span>
                        <div className="flex items-center gap-2 px-3 py-1 bg-green-500/10 border border-green-500/30 rounded-full">
                            <CheckCircle size={14} className="text-green-500" />
                            <span className="text-green-500 font-semibold">System Operational</span>
                        </div>
                    </div>
                    {error && <p className="text-red-500 mt-2 font-medium">{error}</p>}
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <StatCard
                        title="Total Projects"
                        value={stats?.totalProjects || "0"}
                        trend="+1 this week" // To be dynamic in future
                        icon={FolderOpen}
                        color="purple"
                    />
                    <StatCard
                        title="API Coverage"
                        value={`${stats?.passRate || 0}%`}
                        subtitle="Global pass rate"
                        icon={Target}
                        color="cyan"
                        progress={stats?.passRate || 0}
                    />
                    <StatCard
                        title="Total Endpoints"
                        value={stats?.totalEndpoints || "0"}
                        subtitle="Scanned across all projects"
                        icon={Zap}
                        color="green"
                    />
                    <StatCard
                        title="Healed Tests"
                        value={stats?.healedTests || "0"}
                        subtitle="AI-driven recoveries"
                        icon={TrendingUp}
                        color="orange"
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
