import client from './client';

export const projectsApi = {
    list: async () => {
        const response = await client.get('/projects');
        return response.data;
    },

    get: async (projectId) => {
        const response = await client.get(`/projects/${projectId}`);
        return response.data;
    },

    create: async (projectData) => {
        const response = await client.post('/projects', projectData);
        return response.data;
    },

    delete: async (projectId) => {
        const response = await client.delete(`/projects/${projectId}`);
        return response.data;
    },

    update: async (projectId, projectData) => {
        const response = await client.patch(`/projects/${projectId}`, projectData);
        return response.data;
    },
};
