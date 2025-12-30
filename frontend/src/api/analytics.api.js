import client from './client';

export const analyticsApi = {
    getDashboard: async () => {
        const response = await client.get('/analytics/dashboard');
        return response.data;
    },

    getProjectAnalytics: async (projectId) => {
        const response = await client.get(`/analytics/projects/${projectId}`);
        return response.data;
    },

    getAIEfficiency: async () => {
        const response = await client.get('/analytics/ai-efficiency');
        return response.data;
    },
};
