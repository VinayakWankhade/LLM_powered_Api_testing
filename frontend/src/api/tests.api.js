import client from './client';

export const testsApi = {
    list: async (projectId) => {
        const response = await client.get(`/projects/${projectId}/test-cases`);
        return response.data;
    },

    get: async (projectId, testCaseId) => {
        const response = await client.get(`/projects/${projectId}/tests/${testCaseId}`);
        return response.data;
    },

    generate: async (projectId, endpointIds) => {
        const response = await client.post(`/projects/${projectId}/tests/generate`, {
            endpointIds,
        });
        return response.data;
    },

    heal: async (projectId, testCaseId) => {
        const response = await client.post(`/projects/${projectId}/tests/${testCaseId}/heal`);
        return response.data;
    },
};
