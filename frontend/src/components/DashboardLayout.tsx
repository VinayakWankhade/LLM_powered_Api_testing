import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import axios from 'axios';

interface NavItem {
  path: string;
  label: string;
  icon: string;
}

const DashboardLayout: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  const navItems: NavItem[] = [
    { path: '/workflow', label: 'MERN Workflow', icon: '🚀' },
    { path: '/dashboard', label: 'Real-Time Dashboard', icon: '📊' },
    { path: '/reports', label: 'Test Reports', icon: '📋' },
    { path: '/coverage', label: 'Coverage Analysis', icon: '📊' },
    { path: '/analytics', label: 'Analytics', icon: '📈' },
    { path: '/failures', label: 'Failures', icon: '❌' },
    { path: '/risk', label: 'Risk Analysis', icon: '⚠️' },
    { path: '/feedback', label: 'Feedback & Learning', icon: '🧠' },
    { path: '/generation', label: 'Test Generation', icon: '🔧' },
    { path: '/realtime', label: 'Real-Time Testing', icon: '⚡' },
    { path: '/ingestion', label: 'Data Ingestion', icon: '📤' },
    { path: '/final-report', label: 'Final Report Viewer', icon: '📋' },
    { path: '/rag-workflow', label: 'RAG Workflow', icon: '🧠' },
  ];

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await axios.get('/analytics/results/export?format=json');
      const blob = new Blob([JSON.stringify(response.data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics_report_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          isSidebarOpen ? 'w-64' : 'w-20'
        } bg-white shadow-lg transition-all duration-300 relative`}
      >
        <div className="p-4">
          <h1 className="text-xl font-bold text-gray-800">
            {isSidebarOpen ? 'Test Dashboard' : 'TD'}
          </h1>
        </div>

        <nav className="mt-8">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }: { isActive: boolean }) =>
                `flex items-center px-4 py-3 transition-colors duration-200 ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-600 border-r-2 border-indigo-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                }`
              }
              aria-label={item.label}
            >
              <span className="text-xl mr-3" aria-hidden="true">{item.icon}</span>
              {isSidebarOpen && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute bottom-4 left-4 p-2 rounded-full bg-indigo-100 text-indigo-600 hover:bg-indigo-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          aria-label={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <span aria-hidden="true">{isSidebarOpen ? '←' : '→'}</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm">
          <div className="px-4 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold text-gray-800">
                API Test Analytics
              </h2>
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
                  aria-label="Export analytics report"
                >
                  {isExporting ? 'Exporting...' : 'Export Report'}
                </button>
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  aria-label="Refresh dashboard data"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;