import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import DashboardLayout from './components/DashboardLayout'
import CoverageView from './components/views/CoverageView'
import FailuresView from './components/views/FailuresView'
import AnalyticsView from './components/views/AnalyticsView'
import RiskView from './components/views/RiskView'
import FeedbackView from './components/views/FeedbackView'
import TestGenerationView from './components/views/TestGenerationView'
import TestView from './components/views/TestView'
import RealTimeTestingView from './components/views/RealTimeTestingView'
import IngestionView from './components/views/IngestionView'
import WorkflowView from './components/views/WorkflowView'
import ReportView from './components/views/ReportView'
import RealTimeDashboard from './components/views/RealTimeDashboard'
import FinalReportView from './components/views/FinalReportView'
import RAGWorkflowView from './components/views/RAGWorkflowView'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/workflow" replace />} />
          <Route path="workflow" element={<WorkflowView />} />
          <Route path="dashboard" element={<RealTimeDashboard />} />
          <Route path="reports" element={<ReportView />} />
          <Route path="coverage" element={<CoverageView />} />
          <Route path="analytics" element={<AnalyticsView />} />
          <Route path="failures" element={<FailuresView />} />
          <Route path="risk" element={<RiskView />} />
          <Route path="feedback" element={<FeedbackView />} />
          <Route path="generation" element={<TestGenerationView />} />
          <Route path="realtime" element={<RealTimeTestingView />} />
          <Route path="ingestion" element={<IngestionView />} />
          <Route path="final-report" element={<FinalReportView />} />
          <Route path="rag-workflow" element={<RAGWorkflowView />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)
