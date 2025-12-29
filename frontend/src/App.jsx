import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';
import ProjectList from './pages/ProjectList';
import AddNewProject from './pages/AddNewProject';
import ProjectDetails from './pages/ProjectDetails';
import ProjectSettings from './pages/ProjectSettings';
import APIEndpoints from './pages/APIEndpoints';
import GenerateTests from './pages/GenerateTests';
import TestCases from './pages/TestCases';
import TestCaseDetail from './pages/TestCaseDetail';
import TestRunsList from './pages/TestRunsList';
import RunDetails from './pages/RunDetails';
import CoverageReport from './pages/CoverageReport';
import HealingReport from './pages/HealingReport';
import GlobalCoverageReport from './pages/GlobalCoverageReport';
import TrendAnalysis from './pages/TrendAnalysis';
import RLInsights from './pages/RLInsights';
import UserSettings from './pages/UserSettings';
import APIKeysManagement from './pages/APIKeysManagement';

function App() {
  return (
    <Router>
      <Routes>
        {/* Authentication Pages - No Layout */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Main App with Layout */}
        <Route
          path="/*"
          element={
            <div className="min-h-screen flex flex-col bg-black">
              <Navigation />
              <main className="flex-1">
                <Routes>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/projects" element={<ProjectList />} />
                  <Route path="/add-project" element={<AddNewProject />} />
                  <Route path="/project/:id" element={<ProjectDetails />} />
                  <Route path="/project/:id/settings" element={<ProjectSettings />} />
                  <Route path="/project/:id/endpoints" element={<APIEndpoints />} />
                  <Route path="/project/:id/generate-tests" element={<GenerateTests />} />
                  <Route path="/project/:id/test-cases" element={<TestCases />} />
                  <Route path="/project/:id/test-case/:testId" element={<TestCaseDetail />} />
                  <Route path="/project/:id/runs" element={<TestRunsList />} />
                  <Route path="/project/:id/run/:runId" element={<RunDetails />} />
                  <Route path="/project/:id/run/:runId/coverage" element={<CoverageReport />} />
                  <Route path="/project/:id/run/:runId/healing" element={<HealingReport />} />
                  <Route path="/analytics/global-coverage" element={<GlobalCoverageReport />} />
                  <Route path="/analytics/trend-analysis" element={<TrendAnalysis />} />
                  <Route path="/analytics/rl-insights" element={<RLInsights />} />
                  <Route path="/settings" element={<UserSettings />} />
                  <Route path="/api-keys" element={<APIKeysManagement />} />
                  <Route path="/endpoints" element={<Dashboard />} />
                  <Route path="/tests" element={<Dashboard />} />
                  <Route path="/analytics" element={<Dashboard />} />
                  <Route path="/" element={<Navigate to="/login" replace />} />
                </Routes>
              </main>
              <Footer />
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
