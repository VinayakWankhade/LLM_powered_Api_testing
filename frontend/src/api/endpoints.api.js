import client from './client';

export const endpointsApi = {
    list: async (projectId) => {
        const response = await client.get(`/projects/${projectId}/endpoints`);
        return response.data;
    },

    scan: async (projectId) => {
        const response = await client.post(`/projects/${projectId}/endpoints/scan`);
        return response.data;
    },

    getScanStatus: async (jobId) => {
        const response = await client.get(`/projects/scan/status/${jobId}`);
        return response.data;
    },
};
