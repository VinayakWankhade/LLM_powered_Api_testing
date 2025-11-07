import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000,
});

// Analytics API
export const analytics = {
    getFailurePatterns: (hours = 24) => 
        api.get(`/analytics/failures?hours=${hours}`),
    getEndpointStats: () => 
        api.get('/analytics/statistics/endpoints'),
    getCoverageReport: (format = 'json') => 
        api.get(`/analytics/coverage/report?format=${format}`),
    getCoverageTrends: (days = 7) => 
        api.get(`/analytics/coverage/trends?days=${days}`),
    getCoverageGaps: () => 
        api.get('/analytics/coverage/gaps'),
    exportResults: (format = 'json') => 
        api.get(`/analytics/results/export?format=${format}`),
    analyzeRisk: (data) => 
        api.post('/analytics/risk/analyze', data),
    getRecommendations: (hours = 24, forceRefresh = false) => 
        api.get(`/analytics/risk/recommendations?hours=${hours}&force_refresh=${forceRefresh}`),
    updateRiskModels: (data) => 
        api.post('/analytics/risk/update-models', data),
    semanticSearch: (query, k = 5, source = null) => 
        api.get(`/analytics/search?q=${query}&k=${k}${source ? `&source=${source}` : ''}`)
};

// Test Generation API
export const generation = {
    generateTests: (data) => 
        api.post('/generate/tests', data)
};

// Test Execution API
export const execution = {
    executeTests: (data) => 
        api.post('/execute/run', data),
    getStatus: (executionId) => 
        api.get(`/execute/status/${executionId}`),
    stopExecution: (executionId) => 
        api.post(`/execute/stop/${executionId}`),
    getResults: (executionId) => 
        api.get(`/execute/results/${executionId}`)
};

// Feedback API
export const feedback = {
    submitFeedback: (data) => 
        api.post('/api/feedback/submit', data),
    getStats: () =>
        api.get('/api/feedback/stats'),
    getLearningMetrics: () => 
        api.get('/api/feedback/learning/metrics'),
    cleanupKnowledgeBase: (days = 30) =>
        api.post(`/api/feedback/knowledge-base/cleanup?days=${days}`)
};

// Real-time Testing API
export const realtime = {
    startTesting: (config) => 
        api.post('/api/testing/start', config),
    stopTesting: () => 
        api.post('/api/testing/stop'),
    getStatus: () =>
        api.get('/api/testing/status'),
    getMetrics: () => 
        api.get('/api/testing/live-metrics'),
    runSingleCycle: () =>
        api.post('/api/testing/run-single-cycle'),
    getSimulatorStats: () =>
        api.get('/api/testing/simulator-stats'),
    clearData: () =>
        api.delete('/api/testing/clear-data')
};

// Health Check
export const health = {
    check: () => api.get('/health')
};

// Error interceptor
api.interceptors.response.use(
    response => response,
    error => {
        console.error('API Error:', error);
        if (error.response?.status === 401) {
            // Handle unauthorized access
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;
